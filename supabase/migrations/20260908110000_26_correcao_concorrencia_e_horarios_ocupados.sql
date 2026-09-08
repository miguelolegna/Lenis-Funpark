-- ==============================================================================
-- Migração 26: Correção de Concorrência e Horários Ocupados Agnósticos a Detalhes
-- ==============================================================================

-- 1. Reescrever a RPC obter_horarios_ocupados
-- Considera qualquer reserva ativa (incluindo PENDING_APPROVAL, AWAITING_DEPOSIT,
-- IN_PROGRESS, LOCKED, COMPLETED) como horário ocupado, removendo a exigência
-- de termos_veracidade = true para que o bloqueio seja imediato e agnóstico
-- aos detalhes finais da festa.
CREATE OR REPLACE FUNCTION obter_horarios_ocupados(p_data DATE)
RETURNS TABLE (hora TEXT)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI')
    FROM reservas
    WHERE (data_evento AT TIME ZONE 'Europe/Lisbon')::DATE = p_data
      AND estado NOT IN ('CANCELLED', 'REJECTED');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION obter_horarios_ocupados(DATE) TO anon, authenticated, service_role;

-- 2. Reescrever a função e trigger de prevenção de double booking
-- Bloqueia a criação ou atualização de reservas que colidam com uma reserva ativa
-- (qualquer estado que não seja explicitamente CANCELLED ou REJECTED).
CREATE OR REPLACE FUNCTION check_horario_disponivel()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignorar verificação se a reserva está a ser cancelada ou rejeitada
    IF NEW.estado IN ('CANCELLED', 'REJECTED') THEN
        RETURN NEW;
    END IF;

    -- Advisory lock ao nível de transação para serializar tentativas concorrentes no mesmo milissegundo
    PERFORM pg_advisory_xact_lock(hashtext(NEW.data_evento::TEXT));

    -- Verificar se já existe reserva ativa para a mesma data/hora
    IF EXISTS (
        SELECT 1 FROM reservas 
        WHERE data_evento = NEW.data_evento 
          AND estado NOT IN ('CANCELLED', 'REJECTED')
          AND id IS DISTINCT FROM NEW.id
    ) THEN
        RAISE EXCEPTION 'Horário indisponível.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir idempotência na definição do trigger
DROP TRIGGER IF EXISTS prevent_double_booking ON reservas;

CREATE TRIGGER prevent_double_booking
BEFORE INSERT OR UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION check_horario_disponivel();
