CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE verification_type AS ENUM ('FORM_ACCESS');

CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR NOT NULL,
    code_hash VARCHAR NOT NULL,
    token_type verification_type NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier_type ON verification_tokens(identifier, token_type);

-- RLS
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Substituir a função de gerar OTP
CREATE OR REPLACE FUNCTION gerar_otp_b2c(p_token_opaco UUID)
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_otp VARCHAR(6);
    v_hash VARCHAR;
BEGIN
    -- Validar se o token_opaco existe
    IF NOT EXISTS (SELECT 1 FROM reserva_tokens WHERE token_opaco = p_token_opaco) THEN
        RAISE EXCEPTION 'Token opaco invalido ou inexistente.';
    END IF;

    -- Gerar código OTP de 6 dígitos
    v_otp := lpad(floor(random() * 1000000)::text, 6, '0');
    v_hash := encode(digest(v_otp, 'sha256'), 'hex');

    -- Invalidar tokens anteriores do mesmo identifier e tipo
    DELETE FROM verification_tokens 
    WHERE identifier = p_token_opaco::text AND token_type = 'FORM_ACCESS';

    -- Inserir novo token com expiração em 10 minutos
    INSERT INTO verification_tokens (identifier, code_hash, token_type, expires_at)
    VALUES (p_token_opaco::text, v_hash, 'FORM_ACCESS', NOW() + INTERVAL '10 minutes');

    RETURN v_otp;
END;
$$;

-- Substituir a função de validar OTP
CREATE OR REPLACE FUNCTION validar_otp_b2c(p_token_opaco UUID, p_otp_codigo VARCHAR(6))
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
    v_record RECORD;
    v_hash VARCHAR;
BEGIN
    v_hash := encode(digest(p_otp_codigo, 'sha256'), 'hex');

    SELECT * INTO v_record
    FROM verification_tokens
    WHERE identifier = p_token_opaco::text AND token_type = 'FORM_ACCESS'
    FOR UPDATE; -- Bloquear registo para prevenir condições de corrida

    IF v_record IS NULL THEN
        RAISE EXCEPTION 'OTP invalido ou inexistente.';
    END IF;

    IF v_record.attempts >= 5 THEN
        DELETE FROM verification_tokens WHERE id = v_record.id;
        RAISE EXCEPTION 'Demasiadas tentativas falhadas. Solicite um novo código.';
    END IF;

    IF v_record.expires_at < NOW() THEN
        DELETE FROM verification_tokens WHERE id = v_record.id;
        RAISE EXCEPTION 'OTP expirado.';
    END IF;

    IF v_record.code_hash != v_hash THEN
        UPDATE verification_tokens SET attempts = attempts + 1 WHERE id = v_record.id;
        RAISE EXCEPTION 'Código incorreto.';
    END IF;

    -- OTP Válido: Eliminar token e retornar reserva_id
    DELETE FROM verification_tokens WHERE id = v_record.id;

    SELECT reserva_id INTO v_reserva_id FROM reserva_tokens WHERE token_opaco = p_token_opaco;

    RETURN v_reserva_id;
END;
$$;
