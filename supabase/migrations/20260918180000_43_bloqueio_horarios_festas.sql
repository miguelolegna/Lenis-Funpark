-- ==============================================================================
-- Migração 43: Bloqueio de horários por festas confirmadas
--   - Só as reservas confirmadas pelo admin (a partir de "A aguardar pagamento")
--     bloqueiam horários. Pedidos pendentes não bloqueiam: o site só avisa.
--   - Entre o início de duas festas tem de haver pelo menos 3 horas
--     (2h de festa + 1h de limpeza): uma festa às 14:00 bloqueia 12, 13, 14, 15 e 16.
--   - Última hora de início: 18:00 (o parque fecha às 20:00).
-- ==============================================================================

-- 1. Última hora de início às 18:00, também na base de dados (antes aceitava até às 20:00).
--    Reservas canceladas/recusadas ficam de fora da regra, para não bloquear dados antigos.
DO $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT count(*) INTO v_total
    FROM reservas
    WHERE estado NOT IN ('CANCELLED', 'REJECTED')
      AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') > '18:00';

    IF v_total > 0 THEN
        RAISE EXCEPTION 'Existem % reserva(s) ativa(s) com início depois das 18:00. Cancela-as ou muda-lhes a hora e volta a correr esta migração.', v_total;
    END IF;
END;
$$;

ALTER TABLE public.reservas DROP CONSTRAINT IF EXISTS chk_horario_funcionamento;
ALTER TABLE public.reservas ADD CONSTRAINT chk_horario_funcionamento CHECK (
    estado IN ('CANCELLED', 'REJECTED')
    OR (
        EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') != 1
        AND (
            (EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') BETWEEN 2 AND 5
             AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') >= '14:00'
             AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') <= '18:00')
            OR
            (EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') IN (6, 7)
             AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') >= '10:00'
             AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') <= '18:00')
        )
    )
);

-- 2. Horários indisponíveis para o site: slots a menos de 3h de uma festa confirmada
CREATE OR REPLACE FUNCTION public.obter_horarios_ocupados(p_data DATE)
RETURNS TABLE (hora TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH slots AS (
        SELECT (p_data + h::TIME) AT TIME ZONE 'Europe/Lisbon' AS inicio
        FROM unnest(ARRAY['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']) AS h
    )
    SELECT DISTINCT TO_CHAR(s.inicio AT TIME ZONE 'Europe/Lisbon', 'HH24:MI')
    FROM slots s
    JOIN reservas r
      ON r.estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')
     AND abs(EXTRACT(EPOCH FROM (s.inicio - r.data_evento))) < 3 * 3600;
END;
$$;

GRANT EXECUTE ON FUNCTION public.obter_horarios_ocupados(DATE) TO anon, authenticated, service_role;

-- 3. Resumo do dia para o aviso da página de marcação (só horas e contagens, sem dados pessoais)
CREATE OR REPLACE FUNCTION public.resumo_marcacoes_dia(p_data DATE)
RETURNS TABLE (horas_pendentes TEXT[], festas_confirmadas INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        COALESCE(
            array_agg(DISTINCT TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI')
                      ORDER BY TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI'))
                FILTER (WHERE estado = 'PENDING_APPROVAL'),
            '{}'
        ),
        (count(*) FILTER (WHERE estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')))::INTEGER
    FROM reservas
    WHERE (data_evento AT TIME ZONE 'Europe/Lisbon')::DATE = p_data
$$;

REVOKE EXECUTE ON FUNCTION public.resumo_marcacoes_dia(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resumo_marcacoes_dia(DATE) TO anon, authenticated;

-- 4. Anti-dupla-marcação: uma reserva não pode ficar a menos de 3h de uma festa confirmada.
--    Pedidos pendentes podem coincidir entre si. Só se valida quando pode surgir um conflito
--    novo: ao criar, ao mudar a data, ou ao passar a um estado confirmado (aprovação).
CREATE OR REPLACE FUNCTION public.check_horario_disponivel()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.estado IN ('CANCELLED', 'REJECTED') THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE'
       AND NEW.data_evento = OLD.data_evento
       AND (NEW.estado = OLD.estado
            OR OLD.estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')) THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext((NEW.data_evento AT TIME ZONE 'Europe/Lisbon')::DATE::TEXT));

    IF EXISTS (
        SELECT 1 FROM reservas
        WHERE estado IN ('AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED')
          AND id IS DISTINCT FROM NEW.id
          AND abs(EXTRACT(EPOCH FROM (NEW.data_evento - data_evento))) < 3 * 3600
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

-- 5. Quando uma festa fica confirmada (aprovada, ou criada já paga no calendário),
--    os pedidos pendentes a menos de 3h são recusados automaticamente.
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
          AND abs(EXTRACT(EPOCH FROM (data_evento - NEW.data_evento))) < 3 * 3600;
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
