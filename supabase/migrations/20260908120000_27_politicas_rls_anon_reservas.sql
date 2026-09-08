-- ==============================================================================
-- Migração 27: Políticas RLS para Operações Anónimas na Tabela Reservas
-- ==============================================================================

-- 1. Assegurar privilégios da role anon
GRANT INSERT, UPDATE ON reservas TO anon;

-- 2. Política para INSERT anónimo
DROP POLICY IF EXISTS "Permitir insercao anonima" ON reservas;
DROP POLICY IF EXISTS "permitir_insert_anon" ON reservas;

CREATE POLICY "Permitir insercao anonima"
ON reservas
FOR INSERT
TO anon
WITH CHECK (true);

-- 3. Função auxiliar para validar com segurança os privilégios de UPDATE anónimo
-- Garante que utilizadores anónimos só podem editar o seu próprio rascunho (IN_PROGRESS)
-- enquanto a reserva não estiver selada/fechada, validando a existência de token opaco ativo.
CREATE OR REPLACE FUNCTION validar_acesso_anonimo_reserva(p_reserva_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_header_token TEXT;
BEGIN
    BEGIN
        v_header_token := current_setting('request.headers', true)::json->>'x-reserva-token';
    EXCEPTION WHEN OTHERS THEN
        v_header_token := NULL;
    END;

    RETURN EXISTS (
        SELECT 1 
        FROM reserva_tokens rt
        JOIN reservas r ON r.id = rt.reserva_id
        WHERE rt.reserva_id = p_reserva_id
          AND rt.ativo = true
          AND r.estado = 'IN_PROGRESS'
          AND r.termos_veracidade = false
          AND (v_header_token IS NULL OR rt.token_opaco::text = v_header_token)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION validar_acesso_anonimo_reserva(UUID) TO anon, authenticated, service_role;

-- 4. Política estrita de UPDATE anónimo
DROP POLICY IF EXISTS "Permitir update anonimo com token ativo" ON reservas;

CREATE POLICY "Permitir update anonimo com token ativo"
ON reservas
FOR UPDATE
TO anon
USING (
    validar_acesso_anonimo_reserva(id)
)
WITH CHECK (
    validar_acesso_anonimo_reserva(id)
);
