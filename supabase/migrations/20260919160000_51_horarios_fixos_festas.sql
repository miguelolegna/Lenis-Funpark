-- ==============================================================================
-- Migração 51: Horários fixos para festas
--   - As festas só podem começar num destes horários (2h cada):
--       10:00-12:00, 11:30-13:30, 14:00-16:00, 16:00-18:00, 18:00-20:00
--   - 3ª a 6ª: só 14:00, 16:00 e 18:00. Sáb., dom. e feriados: todos.
--     Segunda-feira: encerrado (mesmo que seja feriado).
--   - Festas em horários diferentes podem sobrepor-se (ex.: 10:00 e 11:30).
--     Uma festa confirmada só bloqueia o seu próprio horário.
--   - Substitui a regra das 3h entre festas (migração 43).
-- ==============================================================================

-- 1. Feriados nacionais (fixos + móveis calculados a partir da Páscoa)
CREATE OR REPLACE FUNCTION public.domingo_pascoa(p_ano INTEGER)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    a INTEGER := p_ano % 19;
    b INTEGER := p_ano / 100;
    c INTEGER := p_ano % 100;
    d INTEGER := b / 4;
    e INTEGER := b % 4;
    f INTEGER := (b + 8) / 25;
    g INTEGER := (b - f + 1) / 3;
    h INTEGER := (19 * a + b - d - g + 15) % 30;
    i INTEGER := c / 4;
    k INTEGER := c % 4;
    l INTEGER := (32 + 2 * e + 2 * i - h - k) % 7;
    m INTEGER := (a + 11 * h + 22 * l) / 451;
    v_mes INTEGER := (h + l - 7 * m + 114) / 31;
    v_dia INTEGER := ((h + l - 7 * m + 114) % 31) + 1;
BEGIN
    RETURN make_date(p_ano, v_mes, v_dia);
END;
$$;

CREATE OR REPLACE FUNCTION public.e_feriado(p_data DATE)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT TO_CHAR(p_data, 'MM-DD') IN (
               '01-01', '04-25', '05-01', '06-10', '08-15',
               '10-05', '11-01', '12-01', '12-08', '12-25'
           )
        OR p_data IN (
               public.domingo_pascoa(EXTRACT(YEAR FROM p_data)::INTEGER) - 2,  -- Sexta-feira Santa
               public.domingo_pascoa(EXTRACT(YEAR FROM p_data)::INTEGER),      -- Páscoa
               public.domingo_pascoa(EXTRACT(YEAR FROM p_data)::INTEGER) + 60  -- Corpo de Deus
           )
$$;

-- 2. Horários de início permitidos num dia (hora de Lisboa)
CREATE OR REPLACE FUNCTION public.horarios_festa_dia(p_data DATE)
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN EXTRACT(ISODOW FROM p_data) = 1 THEN ARRAY[]::TEXT[]
        WHEN EXTRACT(ISODOW FROM p_data) IN (6, 7) OR public.e_feriado(p_data)
            THEN ARRAY['10:00', '11:30', '14:00', '16:00', '18:00']
        ELSE ARRAY['14:00', '16:00', '18:00']
    END
$$;

GRANT EXECUTE ON FUNCTION public.domingo_pascoa(INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.e_feriado(DATE) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.horarios_festa_dia(DATE) TO anon, authenticated, service_role;

-- 3. A regra do horário passa do CHECK para o trigger: o CHECK era reavaliado em qualquer
--    UPDATE (ex.: aprovar), o que impediria mexer em reservas antigas às 15:00, 17:00, etc.
--    Assim, só se valida o horário ao criar ou ao mudar a data; as reservas antigas mantêm-se.
ALTER TABLE public.reservas DROP CONSTRAINT IF EXISTS chk_horario_funcionamento;

-- 4. Horários indisponíveis para o site: slots com uma festa confirmada à mesma hora
CREATE OR REPLACE FUNCTION public.obter_horarios_ocupados(p_data DATE)
RETURNS TABLE (hora TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT TO_CHAR(r.data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI')
    FROM reservas r
    WHERE r.estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')
      AND (r.data_evento AT TIME ZONE 'Europe/Lisbon')::DATE = p_data;
END;
$$;

GRANT EXECUTE ON FUNCTION public.obter_horarios_ocupados(DATE) TO anon, authenticated, service_role;

-- 5. Validação ao gravar: horário permitido + sem outra festa confirmada no mesmo horário
CREATE OR REPLACE FUNCTION public.check_horario_disponivel()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_dia DATE := (NEW.data_evento AT TIME ZONE 'Europe/Lisbon')::DATE;
    v_hora TEXT := TO_CHAR(NEW.data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI');
BEGIN
    IF NEW.estado IN ('CANCELLED', 'REJECTED') THEN
        RETURN NEW;
    END IF;

    -- Horário de funcionamento: só ao criar ou ao mudar a data
    IF (TG_OP = 'INSERT' OR NEW.data_evento IS DISTINCT FROM OLD.data_evento)
       AND NOT (v_hora = ANY (public.horarios_festa_dia(v_dia))) THEN
        RAISE EXCEPTION 'Horário fora do horário de funcionamento.';
    END IF;

    IF TG_OP = 'UPDATE'
       AND NEW.data_evento = OLD.data_evento
       AND (NEW.estado = OLD.estado
            OR OLD.estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')) THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext(v_dia::TEXT));

    IF EXISTS (
        SELECT 1 FROM reservas
        WHERE estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')
          AND id IS DISTINCT FROM NEW.id
          AND data_evento = NEW.data_evento
    ) THEN
        RAISE EXCEPTION 'Horário indisponível.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_double_booking ON public.reservas;
CREATE TRIGGER prevent_double_booking
BEFORE INSERT OR UPDATE ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.check_horario_disponivel();

-- 6. Quando uma festa fica confirmada, os pedidos pendentes para o mesmo horário são recusados
CREATE OR REPLACE FUNCTION public.resolver_colisoes_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')
       AND (TG_OP = 'INSERT'
            OR OLD.estado NOT IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')) THEN
        UPDATE reservas
        SET estado = 'REJECTED'
        WHERE id <> NEW.id
          AND estado = 'PENDING_APPROVAL'
          AND data_evento = NEW.data_evento;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_resolucao_colisoes ON public.reservas;
CREATE TRIGGER trigger_resolucao_colisoes
AFTER INSERT OR UPDATE OF estado ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.resolver_colisoes_reserva();

NOTIFY pgrst, 'reload schema';
