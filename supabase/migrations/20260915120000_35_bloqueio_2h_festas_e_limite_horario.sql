-- ==============================================================================
-- Migração 35: Bloqueio de 2 Horas por Festa e Limite de Horário de Início (18:00)
-- ==============================================================================

-- 1. Atualização da Restrição de Horário de Funcionamento (Matriz Horária)
-- O parque encerra às 20:00. Com a duração mínima de 2h por festa, o último
-- horário de início permitido passa a ser às 18:00 (18:00 - 20:00).
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS chk_horario_funcionamento;

ALTER TABLE reservas ADD CONSTRAINT chk_horario_funcionamento CHECK (
    EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') != 1
    AND
    (
        (EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') BETWEEN 2 AND 5 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') >= '14:00' 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') <= '18:00')
        OR
        (EXTRACT(ISODOW FROM data_evento AT TIME ZONE 'Europe/Lisbon') IN (6, 7) 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') >= '10:00' 
         AND TO_CHAR(data_evento AT TIME ZONE 'Europe/Lisbon', 'HH24:MI') <= '18:00')
    )
);

-- 2. Reescrever a RPC obter_horarios_ocupados
-- Cada festa ativa bloqueia uma janela de 2 horas. Todos os slots de início cujo
-- intervalo [slot, slot + 2h[ colida com uma festa existente [data_evento, data_evento + 2h[
-- são devolvidos como ocupados (ex: festa às 15:00 bloqueia marcações às 14:00, 15:00 e 16:00).
CREATE OR REPLACE FUNCTION obter_horarios_ocupados(p_data DATE)
RETURNS TABLE (hora TEXT)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH slots_do_dia AS (
        SELECT (p_data + (h || ':00')::TIME) AT TIME ZONE 'Europe/Lisbon' AS slot_start
        FROM unnest(ARRAY['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']) AS h
    )
    SELECT DISTINCT TO_CHAR(s.slot_start AT TIME ZONE 'Europe/Lisbon', 'HH24:MI')
    FROM slots_do_dia s
    JOIN reservas r ON r.estado NOT IN ('CANCELLED', 'REJECTED')
                   AND (r.data_evento AT TIME ZONE 'Europe/Lisbon')::DATE = p_data
                   AND s.slot_start < (r.data_evento + INTERVAL '2 hours')
                   AND (s.slot_start + INTERVAL '2 hours') > r.data_evento;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION obter_horarios_ocupados(DATE) TO anon, authenticated, service_role;

-- 3. Reescrever a função e trigger de prevenção de conflitos
-- Garante atomicamente que nenhuma reserva com duração de 2 horas se sobreponha
-- a outra reserva ativa.
CREATE OR REPLACE FUNCTION check_horario_disponivel()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignorar verificação se a reserva está a ser cancelada ou rejeitada
    IF NEW.estado IN ('CANCELLED', 'REJECTED') THEN
        RETURN NEW;
    END IF;

    -- Advisory lock para serializar operações na mesma data
    PERFORM pg_advisory_xact_lock(hashtext((NEW.data_evento AT TIME ZONE 'Europe/Lisbon')::DATE::TEXT));

    -- Verificar colisão de intervalo de 2 horas com qualquer reserva ativa existente
    IF EXISTS (
        SELECT 1 FROM reservas 
        WHERE estado NOT IN ('CANCELLED', 'REJECTED')
          AND id IS DISTINCT FROM NEW.id
          AND NEW.data_evento < (data_evento + INTERVAL '2 hours')
          AND (NEW.data_evento + INTERVAL '2 hours') > data_evento
    ) THEN
        RAISE EXCEPTION 'Horário indisponível.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_double_booking ON reservas;

CREATE TRIGGER prevent_double_booking
BEFORE INSERT OR UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION check_horario_disponivel();
