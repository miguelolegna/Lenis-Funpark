ALTER TYPE estado_reserva ADD VALUE IF NOT EXISTS 'REJECTED';

CREATE OR REPLACE FUNCTION resolver_colisoes_reserva()
RETURNS TRIGGER AS $$
BEGIN
    -- Força o estado 'REJECTED' em todas as reservas preteridas
    -- que colidem exatamente com a data do evento aprovado
    UPDATE reservas
    SET estado = 'REJECTED'
    WHERE data_evento = NEW.data_evento
      AND id != NEW.id
      AND estado = 'PENDING_APPROVAL';
      
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_resolucao_colisoes
AFTER UPDATE ON reservas
FOR EACH ROW
WHEN (OLD.estado = 'PENDING_APPROVAL' AND NEW.estado = 'AWAITING_DEPOSIT')
EXECUTE FUNCTION resolver_colisoes_reserva();
