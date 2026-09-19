-- ==============================================================================
-- Migração 50: Detalhes do Bolo
-- ==============================================================================

-- 1. Adicionar colunas em falta na tabela reservas
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS bolo_massa TEXT,
ADD COLUMN IF NOT EXISTS bolo_recheio TEXT,
ADD COLUMN IF NOT EXISTS bolo_cobertura TEXT;

-- 2. Atualizar a RPC atualizar_reserva_b2c para aceitar e persistir os novos campos
CREATE OR REPLACE FUNCTION atualizar_reserva_b2c(p_token_opaco UUID, p_payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
BEGIN
    SELECT reserva_id INTO v_reserva_id FROM reserva_tokens WHERE token_opaco = p_token_opaco;
    
    IF v_reserva_id IS NULL THEN 
        RAISE EXCEPTION 'Acesso negado: Token opaco inválido.'; 
    END IF;

    IF p_payload ? 'nome_aniversariante' THEN UPDATE reservas SET nome_aniversariante = p_payload->>'nome_aniversariante' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'idade' THEN UPDATE reservas SET idade = (p_payload->>'idade')::INTEGER WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'num_criancas' THEN UPDATE reservas SET num_criancas = (p_payload->>'num_criancas')::INTEGER WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'tipo_convite' THEN UPDATE reservas SET tipo_convite = p_payload->>'tipo_convite' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'tema_convite' THEN UPDATE reservas SET tema_convite = p_payload->>'tema_convite' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'opcao_menu' THEN UPDATE reservas SET opcao_menu = p_payload->>'opcao_menu' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'extra_pizza' THEN UPDATE reservas SET extra_pizza = (p_payload->>'extra_pizza')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'extra_cachorro' THEN UPDATE reservas SET extra_cachorro = (p_payload->>'extra_cachorro')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'extra_doces' THEN UPDATE reservas SET extra_doces = (p_payload->>'extra_doces')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'extra_fruta' THEN UPDATE reservas SET extra_fruta = (p_payload->>'extra_fruta')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'extra_gelatina' THEN UPDATE reservas SET extra_gelatina = (p_payload->>'extra_gelatina')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'decoracao_tematica' THEN UPDATE reservas SET decoracao_tematica = (p_payload->>'decoracao_tematica')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'decoracao_tema_nome' THEN UPDATE reservas SET decoracao_tema_nome = p_payload->>'decoracao_tema_nome' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'pinturas_faciais' THEN UPDATE reservas SET pinturas_faciais = (p_payload->>'pinturas_faciais')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'outros_servicos' THEN UPDATE reservas SET outros_servicos = p_payload->>'outros_servicos' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'inclui_bolo' THEN UPDATE reservas SET inclui_bolo = (p_payload->>'inclui_bolo')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'bolo_composicao' THEN UPDATE reservas SET bolo_composicao = p_payload->>'bolo_composicao' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'bolo_massa' THEN UPDATE reservas SET bolo_massa = p_payload->>'bolo_massa' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'bolo_recheio' THEN UPDATE reservas SET bolo_recheio = p_payload->>'bolo_recheio' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'bolo_cobertura' THEN UPDATE reservas SET bolo_cobertura = p_payload->>'bolo_cobertura' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'notas_adicionais' THEN UPDATE reservas SET notas_adicionais = p_payload->>'notas_adicionais' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'termos_veracidade' THEN UPDATE reservas SET termos_veracidade = (p_payload->>'termos_veracidade')::BOOLEAN WHERE id = v_reserva_id; END IF;
    
    -- Legacy field mappings (for backward compatibility if anything else reads them)
    IF p_payload ? 'opcao_menu' THEN UPDATE reservas SET tipo_menu = p_payload->>'opcao_menu' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'decoracao_tematica' THEN UPDATE reservas SET decoracao = (p_payload->>'decoracao_tematica')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'inclui_bolo' THEN UPDATE reservas SET bolo = (p_payload->>'inclui_bolo')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'tema_convite' THEN UPDATE reservas SET tema_personalizado = p_payload->>'tema_convite' WHERE id = v_reserva_id; END IF;
END;
$$;

-- 3. Notificar PostgREST para recarregar schema cache
NOTIFY pgrst, 'reload schema';
