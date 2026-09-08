-- ==============================================================================
-- Migração 28: Concessão de Privilégios DCL e RLS para a role 'anon' em reservas
-- ==============================================================================

-- 1. Privilégios de Tabela (DCL)
GRANT INSERT, SELECT ON TABLE public.reservas TO anon;

-- 2. Garantir que o RLS está ativo
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Row Level Security (RLS)
-- a) Política de Inserção para anon
DROP POLICY IF EXISTS "anon_insert_reservas" ON public.reservas;
DROP POLICY IF EXISTS "Permitir insercao anonima" ON public.reservas;
DROP POLICY IF EXISTS "permitir_insert_anon" ON public.reservas;

CREATE POLICY "anon_insert_reservas"
ON public.reservas
FOR INSERT
TO anon
WITH CHECK (true);

-- b) Política de Seleção para anon (permite ler registo recém-criado em .insert().select())
DROP POLICY IF EXISTS "anon_select_reservas" ON public.reservas;

CREATE POLICY "anon_select_reservas"
ON public.reservas
FOR SELECT
TO anon
USING (true);

-- 4. Recarregar a cache de esquema do PostgREST
NOTIFY pgrst, 'reload schema';
