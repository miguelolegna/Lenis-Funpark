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
    WHERE token_opaco = p_token_opaco AND otp_codigo = p_otp_codigo;

    IF v_reserva_id IS NULL THEN
        RAISE EXCEPTION 'OTP invalido ou link incorreto.';
    END IF;

    IF v_expira_em < NOW() THEN
        RAISE EXCEPTION 'OTP expirado.';
    END IF;

    -- Invalidação (burn) do OTP atómica para prevenir Replay Attacks
    UPDATE reserva_tokens
    SET otp_codigo = NULL, expira_em = NULL
    WHERE token_opaco = p_token_opaco;

    RETURN v_reserva_id;
END;
$$;
