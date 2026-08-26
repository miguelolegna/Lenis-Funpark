GRANT INSERT ON reservas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON reservas TO authenticated;

DROP POLICY IF EXISTS "permitir_insert_anon" ON reservas;
DROP POLICY IF EXISTS "permitir_insert_auth" ON reservas;
DROP POLICY IF EXISTS "permitir_select_auth" ON reservas;
DROP POLICY IF EXISTS "permitir_delete_auth" ON reservas;
DROP POLICY IF EXISTS "permitir_update_auth" ON reservas;
DROP POLICY IF EXISTS "policy_update_reservas_locked" ON reservas;

CREATE POLICY "permitir_insert_anon" ON reservas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "permitir_insert_auth" ON reservas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "permitir_select_auth" ON reservas FOR SELECT TO authenticated USING (true);
CREATE POLICY "permitir_delete_auth" ON reservas FOR DELETE TO authenticated USING (true);
CREATE POLICY "permitir_update_auth" ON reservas FOR UPDATE TO authenticated USING (data_evento > CURRENT_TIMESTAMP + INTERVAL '15 days') WITH CHECK (data_evento > CURRENT_TIMESTAMP + INTERVAL '15 days');
