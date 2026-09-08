-- ==============================================================================
-- Migração 31: Criação da Tabela park_status e Configuração de RLS / Realtime
-- ==============================================================================

-- 1. Criação da Tabela park_status com linha única forçada
CREATE TABLE IF NOT EXISTS public.park_status (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    estado TEXT NOT NULL CHECK (estado IN ('LIVRE', 'MODERADO', 'CHEIO', 'FECHADO')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Trigger para atualização automática de updated_at
DROP TRIGGER IF EXISTS trigger_update_park_status_updated_at ON public.park_status;
CREATE TRIGGER trigger_update_park_status_updated_at
BEFORE UPDATE ON public.park_status
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 3. Ativação de Row Level Security (RLS)
ALTER TABLE public.park_status ENABLE ROW LEVEL SECURITY;

-- 4. Concessão de Privilégios (DCL)
GRANT SELECT ON TABLE public.park_status TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.park_status TO authenticated;
GRANT ALL ON TABLE public.park_status TO service_role;

-- 5. Políticas de RLS
-- Leitura pública para anon e authenticated
DROP POLICY IF EXISTS "anon_select_park_status" ON public.park_status;
CREATE POLICY "anon_select_park_status"
ON public.park_status
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "authenticated_select_park_status" ON public.park_status;
CREATE POLICY "authenticated_select_park_status"
ON public.park_status
FOR SELECT
TO authenticated
USING (true);

-- Escrita restrita a utilizadores autenticados
DROP POLICY IF EXISTS "authenticated_update_park_status" ON public.park_status;
CREATE POLICY "authenticated_update_park_status"
ON public.park_status
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_insert_park_status" ON public.park_status;
CREATE POLICY "authenticated_insert_park_status"
ON public.park_status
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Inserção do registo inicial único com estado 'LIVRE'
INSERT INTO public.park_status (id, estado, updated_at)
VALUES (1, 'LIVRE', now())
ON CONFLICT (id) DO NOTHING;

-- 7. Adicionar à publicação de Realtime do Supabase
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'park_status'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.park_status;
        END IF;
    END IF;
END;
$$;

-- 8. Notificar PostgREST para recarregar o schema cache
NOTIFY pgrst, 'reload schema';
