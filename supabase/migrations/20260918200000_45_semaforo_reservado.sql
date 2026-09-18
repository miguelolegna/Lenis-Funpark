-- ==============================================================================
-- Migração 45: Novo estado do semáforo "RESERVADO" (parque ocupado por uma festa)
-- ==============================================================================

-- A restrição foi criada sem nome na migração 31: procurar a que valida "estado" e substituí-la
DO $$
DECLARE
    v_nome TEXT;
BEGIN
    FOR v_nome IN
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'public.park_status'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%estado%'
    LOOP
        EXECUTE format('ALTER TABLE public.park_status DROP CONSTRAINT %I', v_nome);
    END LOOP;
END;
$$;

ALTER TABLE public.park_status
    ADD CONSTRAINT park_status_estado_check
    CHECK (estado IN ('LIVRE', 'MODERADO', 'CHEIO', 'RESERVADO', 'FECHADO'));

NOTIFY pgrst, 'reload schema';
