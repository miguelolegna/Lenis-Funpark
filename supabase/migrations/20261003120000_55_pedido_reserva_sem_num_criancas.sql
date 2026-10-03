-- ==============================================================================
-- Migração 55: O pedido de reserva do site já não pede o número de pessoas
--   O formulário da Home passou a pedir a idade da criança em vez do número de
--   pessoas (o cliente preenche-o depois na página da reserva). A validação da
--   migração 48 exigia num_criancas e recusava todos os pedidos com PEDIDO_INVALIDO.
--   Agora num_criancas é opcional (se vier, continua entre 1 e 100) e a idade,
--   se vier, tem de estar entre 1 e 99.
-- ==============================================================================

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
       OR (NEW.num_criancas IS NOT NULL AND (NEW.num_criancas < 1 OR NEW.num_criancas > 100))
       OR (NEW.idade IS NOT NULL AND (NEW.idade < 1 OR NEW.idade > 99))
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

NOTIFY pgrst, 'reload schema';
