-- ==============================================================================
-- Migração 38: Eventos internos do calendário do admin
--   (manutenção, parque fechado, eventos privados...). Só aparecem no calendário:
--   não bloqueiam horários de reserva no site.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.eventos_calendario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
    inicio TIMESTAMPTZ NOT NULL,
    fim TIMESTAMPTZ,
    dia_inteiro BOOLEAN NOT NULL DEFAULT false,
    notas TEXT,
    criado_por UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (fim IS NULL OR fim > inicio)
);

ALTER TABLE public.eventos_calendario ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.eventos_calendario FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.eventos_calendario TO authenticated;
GRANT ALL ON TABLE public.eventos_calendario TO service_role;

DROP POLICY IF EXISTS "admin_gere_eventos_calendario" ON public.eventos_calendario;
CREATE POLICY "admin_gere_eventos_calendario" ON public.eventos_calendario
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
