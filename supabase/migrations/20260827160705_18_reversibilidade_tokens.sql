ALTER TABLE reserva_tokens ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 2. Modifica a função selar_reserva_b2c
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

    -- 4. Barreira de Backend: Desativar a chave de acesso em vez de destruir
    UPDATE reserva_tokens SET ativo = false WHERE token_opaco = p_token_opaco;
END;
$$;

-- 3. Cria a função RPC de reativação administrativa
CREATE OR REPLACE FUNCTION reativar_token_b2c(p_reserva_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE reserva_tokens SET ativo = true WHERE reserva_id = p_reserva_id;
END;
$$;

-- 4. Atualiza a função de validação de acesso
CREATE OR REPLACE FUNCTION validar_otp_b2c(p_token_opaco UUID, p_otp_codigo VARCHAR(6))
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
    v_expira_em TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT reserva_id, expira_em INTO v_reserva_id, v_expira_em
    FROM reserva_tokens
    WHERE token_opaco = p_token_opaco AND otp_codigo = p_otp_codigo AND ativo = true;

    IF v_reserva_id IS NULL THEN
        RAISE EXCEPTION 'OTP invalido, link incorreto ou token desativado.';
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
