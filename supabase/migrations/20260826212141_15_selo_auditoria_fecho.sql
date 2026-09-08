ALTER TABLE reservas ADD COLUMN IF NOT EXISTS tipo_menu VARCHAR(50);

CREATE TABLE IF NOT EXISTS auditoria_termos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    ip_address TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

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
    SELECT reserva_id INTO v_reserva_id FROM reserva_tokens WHERE token_opaco = p_token_opaco;
    IF v_reserva_id IS NULL THEN 
        RAISE EXCEPTION 'Acesso negado: Token opaco inválido ou já destruído.'; 
    END IF;

    -- 2. Capturar IP (Tratamento de exceção para ambientes locais sem headers PostgREST)
    BEGIN
        v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    EXCEPTION WHEN OTHERS THEN
        v_ip := 'unknown/local';
    END;

    -- 3. Registar Auditoria Mandatória
    INSERT INTO auditoria_termos (reserva_id, ip_address) VALUES (v_reserva_id, COALESCE(v_ip, 'unknown/local'));

    -- 4. Barreira de Backend: Destruir a chave de acesso para impedir edições futuras
    DELETE FROM reserva_tokens WHERE token_opaco = p_token_opaco;
END;
$$;
