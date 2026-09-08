CREATE OR REPLACE FUNCTION gerar_otp_b2c(p_token_opaco UUID)
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_otp VARCHAR(6);
BEGIN
    v_otp := lpad(floor(random() * 1000000)::text, 6, '0');

    UPDATE reserva_tokens
    SET otp_codigo = v_otp
    WHERE token_opaco = p_token_opaco;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Token opaco invalido ou inexistente.';
    END IF;

    RETURN v_otp;
END;
$$;
