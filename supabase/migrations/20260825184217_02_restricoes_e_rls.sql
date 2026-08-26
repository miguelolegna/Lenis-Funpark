ALTER TABLE reservas ADD CONSTRAINT check_bolo_composicao 
CHECK (bolo IS NOT TRUE OR bolo_composicao IS NOT NULL);

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_update_reservas_locked" ON reservas 
FOR UPDATE 
USING (data_evento > CURRENT_TIMESTAMP + INTERVAL '15 days');
