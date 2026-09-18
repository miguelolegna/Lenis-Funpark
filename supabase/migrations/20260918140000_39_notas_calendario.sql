-- ==============================================================================
-- Migração 39: Notas do dia no calendário do admin
--   (ex: "hoje é preciso esperar pelo carteiro"). Várias notas por dia.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notas_calendario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia DATE NOT NULL,
    texto TEXT NOT NULL CHECK (length(trim(texto)) > 0),
    criado_por UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notas_calendario ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.notas_calendario FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notas_calendario TO authenticated;
GRANT ALL ON TABLE public.notas_calendario TO service_role;

DROP POLICY IF EXISTS "admin_gere_notas_calendario" ON public.notas_calendario;
CREATE POLICY "admin_gere_notas_calendario" ON public.notas_calendario
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
