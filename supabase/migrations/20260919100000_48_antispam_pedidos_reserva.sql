-- ==============================================================================
-- Migração 48: Proteção contra spam nos pedidos de reserva do site (pessoas e bots)
--   Aplica-se só aos pedidos feitos pelo site (role anon); o admin não tem limites.
--   Por contacto (mesmo email OU mesmo telemóvel):
--     - não repete o mesmo dia e hora enquanto o pedido estiver ativo
--     - no máximo 2 pedidos pendentes ao mesmo tempo
--     - no máximo 3 pedidos em 24 horas
--   Por ligação (IP, guardado só como hash):
--     - no máximo 5 pedidos em 24 horas
--   Por contacto ou IP: 2 minutos de intervalo entre pedidos.
--   Os erros começam por um código (ex.: LIMITE_PENDENTES) que o site traduz.
-- ==============================================================================

ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS pedido_ip_hash TEXT;

-- Data do pedido (usada nos limites). Se a coluna ainda não existir, as reservas antigas
-- ficam sem data e não contam para os limites; as novas recebem a hora do pedido.
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE public.reservas ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE public.reservas ALTER COLUMN updated_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS reservas_created_at_idx ON public.reservas (created_at DESC);

-- Email e telemóvel (últimos 9 dígitos) a partir de "Tel: 912 345 678 | Email: nome@email.com"
CREATE OR REPLACE FUNCTION public.email_do_contacto(p_contacto TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT lower((regexp_match(COALESCE(p_contacto, ''), '[^\s|:<>]+@[^\s|:<>]+\.[^\s|:<>]+'))[1])
$$;

CREATE OR REPLACE FUNCTION public.telemovel_do_contacto(p_contacto TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT NULLIF(right(regexp_replace(COALESCE((regexp_match(COALESCE(p_contacto, ''), 'Tel:\s*([^|]+)', 'i'))[1], ''), '\D', '', 'g'), 9), '')
$$;

CREATE OR REPLACE FUNCTION public.limitar_pedidos_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_claims JSONB := NULLIF(current_setting('request.jwt.claims', true), '')::JSONB;
    v_email TEXT;
    v_tel TEXT;
    v_ip TEXT;
    v_ip_hash TEXT;
BEGIN
    IF COALESCE(v_claims ->> 'role', '') <> 'anon' THEN
        RETURN NEW;
    END IF;

    v_email := email_do_contacto(NEW.contacto_cliente);
    v_tel := telemovel_do_contacto(NEW.contacto_cliente);

    IF v_email IS NULL OR v_tel IS NULL OR length(v_tel) < 9
       OR NEW.num_criancas IS NULL OR NEW.num_criancas < 1 OR NEW.num_criancas > 100
       OR length(COALESCE(NEW.nome_aniversariante, '')) NOT BETWEEN 2 AND 100
       OR length(COALESCE(NEW.notas_adicionais, '')) > 2000 THEN
        RAISE EXCEPTION 'PEDIDO_INVALIDO: dados do pedido inválidos.';
    END IF;

    v_ip := NULLIF(trim(split_part(
        COALESCE(NULLIF(current_setting('request.headers', true), '')::JSONB ->> 'x-forwarded-for', ''), ',', 1)), '');
    IF v_ip IS NOT NULL THEN
        v_ip_hash := encode(digest('lenis-reservas:' || v_ip, 'sha256'), 'hex');
    END IF;
    -- Nunca aceitar estes valores vindos do site (seria uma forma de fugir aos limites)
    NEW.pedido_ip_hash := v_ip_hash;
    NEW.created_at := now();

    -- Um pedido de cada vez por contacto (evita contornar os limites com cliques em simultâneo)
    PERFORM pg_advisory_xact_lock(hashtext('pedido_reserva:' || v_email));
    PERFORM pg_advisory_xact_lock(hashtext('pedido_reserva:' || v_tel));

    IF EXISTS (
        SELECT 1 FROM reservas r
        WHERE (email_do_contacto(r.contacto_cliente) = v_email OR telemovel_do_contacto(r.contacto_cliente) = v_tel
               OR (v_ip_hash IS NOT NULL AND r.pedido_ip_hash = v_ip_hash))
          AND r.created_at > now() - INTERVAL '2 minutes'
    ) THEN
        RAISE EXCEPTION 'DEMASIADO_RAPIDO: aguarde antes de enviar outro pedido.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM reservas r
        WHERE (email_do_contacto(r.contacto_cliente) = v_email OR telemovel_do_contacto(r.contacto_cliente) = v_tel)
          AND r.data_evento = NEW.data_evento
          AND r.estado NOT IN ('CANCELLED', 'REJECTED')
    ) THEN
        RAISE EXCEPTION 'PEDIDO_DUPLICADO: já existe um pedido deste contacto para este horário.';
    END IF;

    IF (
        SELECT count(*) FROM reservas r
        WHERE (email_do_contacto(r.contacto_cliente) = v_email OR telemovel_do_contacto(r.contacto_cliente) = v_tel)
          AND r.estado = 'PENDING_APPROVAL'
    ) >= 2 THEN
        RAISE EXCEPTION 'LIMITE_PENDENTES: este contacto já tem 2 pedidos por confirmar.';
    END IF;

    IF (
        SELECT count(*) FROM reservas r
        WHERE (email_do_contacto(r.contacto_cliente) = v_email OR telemovel_do_contacto(r.contacto_cliente) = v_tel)
          AND r.created_at > now() - INTERVAL '24 hours'
    ) >= 3
    OR (
        v_ip_hash IS NOT NULL AND (
            SELECT count(*) FROM reservas r
            WHERE r.pedido_ip_hash = v_ip_hash
              AND r.created_at > now() - INTERVAL '24 hours'
        ) >= 5
    ) THEN
        RAISE EXCEPTION 'LIMITE_DIARIO: limite de pedidos em 24 horas atingido.';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.limitar_pedidos_reserva() FROM PUBLIC, anon, authenticated;

-- Nome com "a_" para correr antes dos outros triggers BEFORE INSERT (ordem alfabética)
DROP TRIGGER IF EXISTS a_limitar_pedidos_reserva ON public.reservas;
CREATE TRIGGER a_limitar_pedidos_reserva
BEFORE INSERT ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.limitar_pedidos_reserva();

NOTIFY pgrst, 'reload schema';
