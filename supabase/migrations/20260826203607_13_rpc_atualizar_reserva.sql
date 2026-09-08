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
    IF p_payload ? 'tipo_menu' THEN UPDATE reservas SET tipo_menu = p_payload->>'tipo_menu' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'convite_lenis' THEN UPDATE reservas SET convite_lenis = (p_payload->>'convite_lenis')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'extras' THEN UPDATE reservas SET extras = (p_payload->>'extras')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'decoracao' THEN UPDATE reservas SET decoracao = (p_payload->>'decoracao')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'bolo' THEN UPDATE reservas SET bolo = (p_payload->>'bolo')::BOOLEAN WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'bolo_composicao' THEN UPDATE reservas SET bolo_composicao = p_payload->>'bolo_composicao' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'notas_adicionais' THEN UPDATE reservas SET notas_adicionais = p_payload->>'notas_adicionais' WHERE id = v_reserva_id; END IF;
    IF p_payload ? 'termos_veracidade' THEN UPDATE reservas SET termos_veracidade = (p_payload->>'termos_veracidade')::BOOLEAN WHERE id = v_reserva_id; END IF;
END;
$$;
