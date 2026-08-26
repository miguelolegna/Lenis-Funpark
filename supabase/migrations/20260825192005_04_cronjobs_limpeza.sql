ALTER TABLE reservas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reservas_updated_at
BEFORE UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE EXTENSION IF NOT EXISTS pg_cron;

ALTER TYPE estado_reserva ADD VALUE IF NOT EXISTS 'CANCELLED';

SELECT cron.schedule(
    'purga_financeira_reservas',
    '0 * * * *',
    $$ UPDATE reservas SET estado = 'CANCELLED' WHERE estado = 'AWAITING_DEPOSIT' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '48 hours' $$
);

SELECT cron.schedule(
    'purga_sanitaria_rgpd',
    '0 0 * * *',
    $$ UPDATE reservas SET nome_aniversariante = 'PURGADO', contacto_cliente = 'PURGADO', assinatura_ip = '0.0.0.0' WHERE estado = 'COMPLETED' AND data_evento < CURRENT_TIMESTAMP - INTERVAL '30 days' $$
);
