CREATE OR REPLACE FUNCTION emitir_token_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado != 'PENDING_APPROVAL' AND OLD.estado = 'PENDING_APPROVAL' THEN
        INSERT INTO reserva_tokens (reserva_id) VALUES (NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_emissao_token ON reservas;
CREATE TRIGGER trigger_emissao_token
AFTER UPDATE OF estado ON reservas
FOR EACH ROW
EXECUTE FUNCTION emitir_token_reserva();
