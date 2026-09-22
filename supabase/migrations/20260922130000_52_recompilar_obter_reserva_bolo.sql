-- ==============================================================================
-- Migração 52: Recompilar obter_reserva_b2c para garantir inclusão dos campos de bolo
-- ==============================================================================

CREATE OR REPLACE FUNCTION obter_reserva_b2c(p_token_opaco UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
    v_dados JSONB;
BEGIN
    SELECT reserva_id INTO v_reserva_id FROM reserva_tokens WHERE token_opaco = p_token_opaco;
    
    IF v_reserva_id IS NULL THEN 
        RAISE EXCEPTION 'Acesso negado: Token opaco inválido.'; 
    END IF;

    -- Assegura que o tipo de linha da tabela reservas inclui bolo_massa, bolo_recheio e bolo_cobertura
    SELECT to_jsonb(r) INTO v_dados
    FROM reservas r
    WHERE id = v_reserva_id;

    RETURN v_dados;
END;
$$;

NOTIFY pgrst, 'reload schema';
