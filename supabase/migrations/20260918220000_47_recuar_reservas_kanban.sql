-- ==============================================================================
-- Migração 47: Recuar reservas no kanban (seta "voltar à coluna anterior")
--   A notificação passa a dizer que a reserva voltou atrás, em vez de repetir
--   "Reserva aprovada" / "Pagamento confirmado" quando o admin recua um card.
--   Requer a migração 41.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.notificar_reserva_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_nome TEXT := COALESCE(NULLIF(trim(NEW.nome_aniversariante), ''), 'sem nome');
    v_data TEXT := 'Festa a ' || formatar_data_festa(NEW.data_evento);
    v_automatico BOOLEAN := NULLIF(current_setting('request.jwt.claims', true), '') IS NULL;
    v_ordem_antiga INTEGER := array_position(ARRAY['PENDING_APPROVAL', 'AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED'], OLD.estado::TEXT);
    v_ordem_nova INTEGER := array_position(ARRAY['PENDING_APPROVAL', 'AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED', 'COMPLETED'], NEW.estado::TEXT);
    v_colunas TEXT[] := ARRAY['Pendente', 'A aguardar pagamento', 'Em preenchimento', 'Formulário preenchido', 'Concluído'];
BEGIN
    -- Reativada a partir das canceladas/recusadas
    IF OLD.estado IN ('CANCELLED', 'REJECTED') AND v_ordem_nova IS NOT NULL THEN
        PERFORM registar_notificacao('RESERVA_REATIVADA', 'Reserva reativada: ' || v_nome,
            v_data || ' • voltou para "' || v_colunas[v_ordem_nova] || '"', '/admin/reservas');
        RETURN NULL;
    END IF;

    -- Recuada no fluxo (LOCKED → IN_PROGRESS continua a ser "Formulário reaberto")
    IF v_ordem_antiga IS NOT NULL AND v_ordem_nova IS NOT NULL AND v_ordem_nova < v_ordem_antiga
       AND NOT (OLD.estado = 'LOCKED' AND NEW.estado = 'IN_PROGRESS') THEN
        PERFORM registar_notificacao('RESERVA_RECUADA', 'Reserva voltou atrás: ' || v_nome,
            v_data || ' • agora em "' || v_colunas[v_ordem_nova] || '"', '/admin/reservas');
        RETURN NULL;
    END IF;

    CASE NEW.estado
        WHEN 'AWAITING_DEPOSIT' THEN
            PERFORM registar_notificacao('RESERVA_APROVADA', 'Reserva aprovada: ' || v_nome, v_data, '/admin/reservas');
        WHEN 'IN_PROGRESS' THEN
            IF OLD.estado = 'LOCKED' THEN
                PERFORM registar_notificacao('FORMULARIO_REABERTO', 'Formulário reaberto: ' || v_nome, v_data, '/admin/reservas');
            ELSE
                PERFORM registar_notificacao('PAGAMENTO_CONFIRMADO', 'Pagamento confirmado: ' || v_nome,
                    v_data || ' • link do formulário criado', '/admin/reservas');
            END IF;
        WHEN 'LOCKED' THEN
            PERFORM registar_notificacao('FORMULARIO_SUBMETIDO', 'Formulário submetido: ' || v_nome, v_data, '/admin/reservas');
        WHEN 'COMPLETED' THEN
            PERFORM registar_notificacao('FESTA_CONCLUIDA', 'Festa concluída: ' || v_nome, v_data, '/admin/reservas');
        WHEN 'CANCELLED' THEN
            PERFORM registar_notificacao('RESERVA_CANCELADA', 'Reserva cancelada: ' || v_nome,
                CASE WHEN v_automatico AND OLD.estado = 'AWAITING_DEPOSIT'
                     THEN 'Cancelada automaticamente: sem pagamento em 48 horas'
                     ELSE v_data END,
                '/admin/reservas');
        WHEN 'REJECTED' THEN
            PERFORM registar_notificacao('RESERVA_RECUSADA', 'Reserva recusada: ' || v_nome,
                'O horário foi atribuído a outra reserva', '/admin/reservas');
        ELSE
            PERFORM registar_notificacao('RESERVA_ATUALIZADA', 'Reserva atualizada: ' || v_nome, v_data, '/admin/reservas');
    END CASE;
    RETURN NULL;
END;
$$;

NOTIFY pgrst, 'reload schema';
