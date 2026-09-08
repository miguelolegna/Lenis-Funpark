CREATE TABLE IF NOT EXISTS reserva_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    token_opaco UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    otp_codigo VARCHAR(6),
    expira_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION set_otp_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.otp_codigo IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.otp_codigo IS DISTINCT FROM OLD.otp_codigo) THEN
        NEW.expira_em = NOW() + INTERVAL '10 minutes';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_otp_expiration ON reserva_tokens;
CREATE TRIGGER trigger_set_otp_expiration
BEFORE INSERT OR UPDATE OF otp_codigo ON reserva_tokens
FOR EACH ROW
EXECUTE FUNCTION set_otp_expiration();

ALTER TABLE reserva_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permitir_gestao_admin_tokens" ON reserva_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);
