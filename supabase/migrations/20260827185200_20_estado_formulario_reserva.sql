-- 1. Nova Coluna
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS estado_formulario VARCHAR DEFAULT 'rascunho';

-- 2. Refatorar Fecho (selar_reserva_b2c)
CREATE OR REPLACE FUNCTION selar_reserva_b2c(p_token_opaco UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
    v_ip TEXT;
BEGIN
    -- 1. Validar Token
    SELECT reserva_id INTO v_reserva_id FROM reserva_tokens WHERE token_opaco = p_token_opaco AND ativo = true;
    IF v_reserva_id IS NULL THEN 
        RAISE EXCEPTION 'Acesso negado: Token opaco inválido ou já destruído.'; 
    END IF;

    -- 2. Capturar IP
    BEGIN
        v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    EXCEPTION WHEN OTHERS THEN
        v_ip := 'unknown/local';
    END;

    -- 3. Registar Auditoria Mandatória
    INSERT INTO auditoria_termos (reserva_id, ip_address) VALUES (v_reserva_id, COALESCE(v_ip, 'unknown/local'));

    -- 4. Barreira de Backend: Desativar a chave de acesso e atualizar a reserva
    UPDATE reserva_tokens SET ativo = false WHERE token_opaco = p_token_opaco;
    UPDATE reservas SET estado_formulario = 'concluido' WHERE id = v_reserva_id;
END;
$$;

-- 3. Bloqueio de Validação (validar_otp_b2c)
CREATE OR REPLACE FUNCTION validar_otp_b2c(p_token_opaco UUID, p_otp_codigo VARCHAR(6))
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
    v_expira_em TIMESTAMP WITH TIME ZONE;
    v_estado_formulario VARCHAR;
    v_ativo BOOLEAN;
BEGIN
    SELECT r.id, t.expira_em, r.estado_formulario, t.ativo 
    INTO v_reserva_id, v_expira_em, v_estado_formulario, v_ativo
    FROM reserva_tokens t
    JOIN reservas r ON t.reserva_id = r.id
    WHERE t.token_opaco = p_token_opaco AND t.otp_codigo = p_otp_codigo;

    IF v_reserva_id IS NULL THEN
        RAISE EXCEPTION 'OTP invalido ou link incorreto.';
    END IF;

    IF v_estado_formulario = 'concluido' THEN
        RAISE EXCEPTION 'Reserva fechada. Contacte o administrador para correções';
    END IF;

    IF v_ativo = false THEN
        RAISE EXCEPTION 'Token desativado.';
    END IF;

    IF v_expira_em < NOW() THEN
        RAISE EXCEPTION 'O codigo OTP expirou.';
    END IF;

    -- Destroi OTP (Burn after reading)
    UPDATE reserva_tokens
    SET otp_codigo = NULL, expira_em = NULL
    WHERE token_opaco = p_token_opaco;

    RETURN v_reserva_id;
END;
$$;

-- 4. Destrancar (Administração) - desbloquear_reserva_admin
CREATE OR REPLACE FUNCTION desbloquear_reserva_admin(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE reservas SET estado_formulario = 'rascunho' WHERE id = p_id;
    UPDATE reserva_tokens SET ativo = true WHERE reserva_id = p_id;
END;
$$;
