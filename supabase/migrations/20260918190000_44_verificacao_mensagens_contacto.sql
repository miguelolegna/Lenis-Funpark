-- ==============================================================================
-- Migração 44: Mensagens de contacto só chegam ao admin depois de verificadas
--   - O site deixa de gravar mensagens diretamente: a Edge Function
--     enviar_codigo_mensagem grava a mensagem por verificar e envia um código
--     para o email do visitante (Resend).
--   - Só depois de o código ser validado é que a mensagem aparece no admin
--     e gera notificação.
--   - Mensagens por verificar há mais de 5 minutos são apagadas.
--   Requer a migração 41 aplicada.
-- ==============================================================================

-- 1. Estado de verificação (as mensagens que já existem contam como verificadas)
ALTER TABLE public.mensagens_contacto
    ADD COLUMN IF NOT EXISTS verificada BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.mensagens_contacto
    ALTER COLUMN verificada SET DEFAULT false;

CREATE INDEX IF NOT EXISTS mensagens_contacto_por_verificar_idx
    ON public.mensagens_contacto (created_at) WHERE verificada = false;

-- 2. Os visitantes deixam de poder inserir diretamente (era assim que um bot contornava o código)
DROP POLICY IF EXISTS "visitantes_enviam_mensagens" ON public.mensagens_contacto;
REVOKE ALL ON TABLE public.mensagens_contacto FROM anon;

-- O admin só vê (e recebe em tempo real) mensagens verificadas
DROP POLICY IF EXISTS "admin_gere_mensagens" ON public.mensagens_contacto;
CREATE POLICY "admin_gere_mensagens" ON public.mensagens_contacto
FOR ALL TO authenticated
USING (verificada)
WITH CHECK (true);

-- 3. Códigos de verificação (só a Edge Function e as funções abaixo lhes tocam)
CREATE TABLE IF NOT EXISTS public.codigos_mensagem (
    mensagem_id UUID PRIMARY KEY REFERENCES public.mensagens_contacto(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    tentativas INTEGER NOT NULL DEFAULT 0,
    envios INTEGER NOT NULL DEFAULT 1,
    ultimo_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.codigos_mensagem ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.codigos_mensagem FROM anon, authenticated;
GRANT ALL ON TABLE public.codigos_mensagem TO service_role;

-- Gera (ou regenera, no reenvio) o código de 6 dígitos e devolve-o à Edge Function
CREATE OR REPLACE FUNCTION public.gerar_codigo_mensagem(p_mensagem_id UUID, p_ip TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_codigo TEXT := lpad(floor(random() * 1000000)::TEXT, 6, '0');
    v_hash TEXT := encode(digest(v_codigo || p_mensagem_id::TEXT, 'sha256'), 'hex');
BEGIN
    INSERT INTO codigos_mensagem (mensagem_id, code_hash, ip)
    VALUES (p_mensagem_id, v_hash, p_ip)
    ON CONFLICT (mensagem_id) DO UPDATE
    SET code_hash = EXCLUDED.code_hash,
        tentativas = 0,
        envios = codigos_mensagem.envios + 1,
        ultimo_envio = now();
    RETURN v_codigo;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.gerar_codigo_mensagem(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_codigo_mensagem(UUID, TEXT) TO service_role;

-- 4. Validação pelo site. Devolve um estado em vez de erro, para que a contagem
--    de tentativas não seja desfeita pelo rollback de uma exceção.
--    'ok' | 'incorreto' | 'expirado' | 'bloqueado'
CREATE OR REPLACE FUNCTION public.verificar_mensagem_contacto(p_mensagem_id UUID, p_codigo TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_mensagem RECORD;
    v_codigo RECORD;
BEGIN
    SELECT id, verificada, created_at INTO v_mensagem
    FROM mensagens_contacto WHERE id = p_mensagem_id;

    IF NOT FOUND THEN
        RETURN 'expirado';
    END IF;
    IF v_mensagem.verificada THEN
        RETURN 'ok';
    END IF;
    IF v_mensagem.created_at < now() - INTERVAL '5 minutes' THEN
        DELETE FROM mensagens_contacto WHERE id = p_mensagem_id;
        RETURN 'expirado';
    END IF;

    SELECT * INTO v_codigo FROM codigos_mensagem WHERE mensagem_id = p_mensagem_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN 'expirado';
    END IF;

    IF v_codigo.tentativas >= 5 THEN
        DELETE FROM mensagens_contacto WHERE id = p_mensagem_id;
        RETURN 'bloqueado';
    END IF;

    IF v_codigo.code_hash <> encode(digest(trim(COALESCE(p_codigo, '')) || p_mensagem_id::TEXT, 'sha256'), 'hex') THEN
        UPDATE codigos_mensagem SET tentativas = tentativas + 1 WHERE mensagem_id = p_mensagem_id;
        IF v_codigo.tentativas + 1 >= 5 THEN
            DELETE FROM mensagens_contacto WHERE id = p_mensagem_id;
            RETURN 'bloqueado';
        END IF;
        RETURN 'incorreto';
    END IF;

    -- A linha do código fica (sem o hash útil) para contar os envios por IP no limite anti-abuso
    UPDATE mensagens_contacto SET verificada = true WHERE id = p_mensagem_id;
    UPDATE codigos_mensagem SET code_hash = '' WHERE mensagem_id = p_mensagem_id;
    RETURN 'ok';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verificar_mensagem_contacto(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_mensagem_contacto(UUID, TEXT) TO anon, authenticated;

-- 5. Limpeza: mensagens não verificadas em 5 minutos são apagadas (corre a cada minuto)
CREATE OR REPLACE FUNCTION public.limpar_mensagens_por_verificar()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    DELETE FROM mensagens_contacto
    WHERE verificada = false
      AND created_at < now() - INTERVAL '5 minutes';
$$;

REVOKE EXECUTE ON FUNCTION public.limpar_mensagens_por_verificar() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'limpar_mensagens_por_verificar') THEN
        PERFORM cron.unschedule('limpar_mensagens_por_verificar');
    END IF;
END;
$$;

SELECT cron.schedule(
    'limpar_mensagens_por_verificar',
    '* * * * *',
    $$ SELECT public.limpar_mensagens_por_verificar() $$
);

-- 6. Notificações: a "Nova mensagem" passa a ser emitida na verificação, não na gravação,
--    e as mensagens por verificar apagadas pela limpeza não geram notificação.
CREATE OR REPLACE FUNCTION public.notificar_mensagem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.verificada THEN
            PERFORM registar_notificacao('NOVA_MENSAGEM', 'Nova mensagem: ' || NEW.nome, NEW.motivo, '/admin/contactos');
        END IF;
        RETURN NULL;
    END IF;

    IF NEW.verificada AND NOT OLD.verificada THEN
        PERFORM registar_notificacao('NOVA_MENSAGEM', 'Nova mensagem: ' || NEW.nome, NEW.motivo, '/admin/contactos');
        RETURN NULL;
    END IF;

    IF OLD.respondido IS DISTINCT FROM NEW.respondido THEN
        IF NEW.respondido THEN
            PERFORM registar_notificacao('MENSAGEM_RESPONDIDA', 'Mensagem respondida: ' || NEW.nome,
                'Via ' || COALESCE(NEW.canal_resposta, 'contacto direto'), '/admin/contactos');
        ELSE
            PERFORM registar_notificacao('MENSAGEM_PENDENTE', 'Mensagem marcada como pendente: ' || NEW.nome,
                NEW.motivo, '/admin/contactos');
        END IF;
    END IF;

    IF OLD.notas_admin IS DISTINCT FROM NEW.notas_admin AND NULLIF(trim(NEW.notas_admin), '') IS NOT NULL THEN
        PERFORM registar_notificacao('MENSAGEM_NOTA', 'Nota interna na mensagem de ' || NEW.nome,
            left(NEW.notas_admin, 120), '/admin/contactos');
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.notificar_mensagens_apagadas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total INTEGER;
    v_nome TEXT;
BEGIN
    SELECT count(*), min(nome) INTO v_total, v_nome FROM apagadas WHERE verificada;

    IF v_total = 1 THEN
        PERFORM registar_notificacao('MENSAGEM_APAGADA', 'Mensagem apagada: ' || v_nome, NULL, '/admin/contactos');
    ELSIF v_total > 1 THEN
        PERFORM registar_notificacao('MENSAGEM_APAGADA', v_total || ' mensagens apagadas', NULL, '/admin/contactos');
    END IF;
    RETURN NULL;
END;
$$;

NOTIFY pgrst, 'reload schema';
