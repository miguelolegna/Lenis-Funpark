ALTER TABLE reservas ADD COLUMN IF NOT EXISTS convite_token UUID DEFAULT gen_random_uuid();
