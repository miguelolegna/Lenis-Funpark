-- Migração 32: Adicionar a tabela 'reservas' à publicação 'supabase_realtime' para notificações em tempo real
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'reservas'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.reservas;
        END IF;
    END IF;
END;
$$;

-- Notificar PostgREST para recarregar cache
NOTIFY pgrst, 'reload schema';
