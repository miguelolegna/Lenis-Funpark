-- Migração 33: Criar tabela mensagens_contacto e habilitar Realtime
CREATE TABLE IF NOT EXISTS public.mensagens_contacto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    contacto TEXT NOT NULL,
    email TEXT,
    motivo TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'geral', -- 'escola', 'instituicao', 'geral'
    mensagem TEXT NOT NULL,
    preferencia_resposta TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'email', 'telefone'
    respondido BOOLEAN DEFAULT false,
    respondido_por TEXT,
    canal_resposta TEXT,
    notas_admin TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conceder permissões à role anon e authenticated
GRANT ALL ON TABLE public.mensagens_contacto TO anon, authenticated;

-- Habilitar Row Level Security
ALTER TABLE public.mensagens_contacto ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Permitir insercao anonima mensagens_contacto" ON public.mensagens_contacto;
CREATE POLICY "Permitir insercao anonima mensagens_contacto" 
ON public.mensagens_contacto 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura mensagens_contacto" ON public.mensagens_contacto;
CREATE POLICY "Permitir leitura mensagens_contacto" 
ON public.mensagens_contacto 
FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir atualizacao mensagens_contacto" ON public.mensagens_contacto;
CREATE POLICY "Permitir atualizacao mensagens_contacto" 
ON public.mensagens_contacto 
FOR UPDATE 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminacao mensagens_contacto" ON public.mensagens_contacto;
CREATE POLICY "Permitir eliminacao mensagens_contacto" 
ON public.mensagens_contacto 
FOR DELETE 
TO anon, authenticated 
USING (true);

-- Adicionar à publicação supabase_realtime
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'mensagens_contacto'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_contacto;
        END IF;
    END IF;
END;
$$;

-- Notificar PostgREST
NOTIFY pgrst, 'reload schema';
