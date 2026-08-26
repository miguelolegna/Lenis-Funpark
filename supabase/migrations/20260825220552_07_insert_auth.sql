CREATE POLICY "permitir_insert_auth" 
ON reservas 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
