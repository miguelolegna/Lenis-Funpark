-- ==============================================================================
-- Migração 41: Mensagens de contacto seguras + notificações partilhadas do admin
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Mensagens de contacto: os visitantes só as podem enviar
--    (antes qualquer visitante podia ler, alterar e apagar todas as mensagens)
-- ------------------------------------------------------------------------------
REVOKE ALL ON TABLE public.mensagens_contacto FROM anon;
GRANT INSERT ON TABLE public.mensagens_contacto TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mensagens_contacto TO authenticated;

DROP POLICY IF EXISTS "Permitir insercao anonima mensagens_contacto" ON public.mensagens_contacto;
DROP POLICY IF EXISTS "Permitir leitura mensagens_contacto" ON public.mensagens_contacto;
DROP POLICY IF EXISTS "Permitir atualizacao mensagens_contacto" ON public.mensagens_contacto;
DROP POLICY IF EXISTS "Permitir eliminacao mensagens_contacto" ON public.mensagens_contacto;

CREATE POLICY "visitantes_enviam_mensagens" ON public.mensagens_contacto
FOR INSERT TO anon
WITH CHECK (
    COALESCE(respondido, false) = false
    AND notas_admin IS NULL
    AND canal_resposta IS NULL
    AND respondido_por IS NULL
);

CREATE POLICY "admin_gere_mensagens" ON public.mensagens_contacto
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 2. Tabela de notificações (partilhada por todos os admins: lida e apagada para todos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    link TEXT,
    autor TEXT,
    lida BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notificacoes_created_at_idx ON public.notificacoes (created_at DESC);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Só os triggers (SECURITY DEFINER) criam notificações; o admin lê, marca como lida e apaga
REVOKE ALL ON TABLE public.notificacoes FROM anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.notificacoes TO authenticated;
GRANT ALL ON TABLE public.notificacoes TO service_role;

DROP POLICY IF EXISTS "admin_gere_notificacoes" ON public.notificacoes;
CREATE POLICY "admin_gere_notificacoes" ON public.notificacoes
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notificacoes'
       ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Funções de apoio
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.formatar_data_festa(p_data TIMESTAMPTZ)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT to_char(p_data AT TIME ZONE 'Europe/Lisbon', 'DD/MM/YYYY "às" HH24:MI')
$$;

-- Autor: email do admin, 'Cliente' (pedidos anónimos do site) ou 'Sistema' (cron, SQL, Edge Functions).
-- Uma falha a gravar a notificação nunca pode impedir a ação que a originou.
CREATE OR REPLACE FUNCTION public.registar_notificacao(p_tipo TEXT, p_titulo TEXT, p_descricao TEXT, p_link TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_claims JSONB;
    v_autor TEXT;
BEGIN
    v_claims := NULLIF(current_setting('request.jwt.claims', true), '')::JSONB;
    v_autor := CASE v_claims ->> 'role'
        WHEN 'authenticated' THEN COALESCE(v_claims ->> 'email', 'Admin')
        WHEN 'anon' THEN 'Cliente'
        ELSE 'Sistema'
    END;

    INSERT INTO notificacoes (tipo, titulo, descricao, link, autor)
    VALUES (p_tipo, p_titulo, p_descricao, p_link, v_autor);
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'registar_notificacao (%): %', p_tipo, SQLERRM;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.registar_notificacao(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. Reservas
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notificar_reserva_criada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_nome TEXT := COALESCE(NULLIF(trim(NEW.nome_aniversariante), ''), 'sem nome');
    v_data TEXT := 'Festa a ' || formatar_data_festa(NEW.data_evento);
BEGIN
    IF NEW.notas_adicionais = 'Convite avulso emitido manualmente pelo Back-Office.' THEN
        PERFORM registar_notificacao('CONVITE_AVULSO', 'Convite avulso criado: ' || v_nome, v_data, '/admin/convites');
    ELSIF NEW.estado = 'PENDING_APPROVAL' THEN
        PERFORM registar_notificacao('NOVA_RESERVA', 'Nova reserva: ' || v_nome,
            v_data || COALESCE(' • ' || NEW.num_criancas || ' crianças', ''), '/admin/reservas');
    ELSE
        PERFORM registar_notificacao('FESTA_MANUAL', 'Festa adicionada: ' || v_nome, v_data, '/admin/calendario');
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_reserva_criada ON public.reservas;
CREATE TRIGGER trigger_notificar_reserva_criada
AFTER INSERT ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.notificar_reserva_criada();

-- Sem lista de colunas: a passagem para LOCKED acontece num trigger BEFORE durante selar_reserva_b2c
CREATE OR REPLACE FUNCTION public.notificar_reserva_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_nome TEXT := COALESCE(NULLIF(trim(NEW.nome_aniversariante), ''), 'sem nome');
    v_data TEXT := 'Festa a ' || formatar_data_festa(NEW.data_evento);
    v_automatico BOOLEAN := NULLIF(current_setting('request.jwt.claims', true), '') IS NULL;
BEGIN
    CASE NEW.estado
        WHEN 'AWAITING_DEPOSIT' THEN
            PERFORM registar_notificacao('RESERVA_APROVADA', 'Reserva aprovada: ' || v_nome, v_data, '/admin/reservas');
        WHEN 'IN_PROGRESS' THEN
            IF OLD.estado = 'LOCKED' THEN
                PERFORM registar_notificacao('FORMULARIO_REABERTO', 'Formulário reaberto: ' || v_nome, v_data, '/admin/reservas');
            ELSE
                PERFORM registar_notificacao('PAGAMENTO_CONFIRMADO', 'Pagamento confirmado: ' || v_nome,
                    v_data || ' • link do formulário criado', '/admin/reservas');
            END IF;
        WHEN 'LOCKED' THEN
            PERFORM registar_notificacao('FORMULARIO_SUBMETIDO', 'Formulário submetido: ' || v_nome, v_data, '/admin/reservas');
        WHEN 'COMPLETED' THEN
            PERFORM registar_notificacao('FESTA_CONCLUIDA', 'Festa concluída: ' || v_nome, v_data, '/admin/reservas');
        WHEN 'CANCELLED' THEN
            PERFORM registar_notificacao('RESERVA_CANCELADA', 'Reserva cancelada: ' || v_nome,
                CASE WHEN v_automatico AND OLD.estado = 'AWAITING_DEPOSIT'
                     THEN 'Cancelada automaticamente: sem pagamento em 48 horas'
                     ELSE v_data END,
                '/admin/reservas');
        WHEN 'REJECTED' THEN
            PERFORM registar_notificacao('RESERVA_RECUSADA', 'Reserva recusada: ' || v_nome,
                'O horário foi atribuído a outra reserva', '/admin/reservas');
        ELSE
            PERFORM registar_notificacao('RESERVA_ATUALIZADA', 'Reserva atualizada: ' || v_nome, v_data, '/admin/reservas');
    END CASE;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_reserva_estado ON public.reservas;
CREATE TRIGGER trigger_notificar_reserva_estado
AFTER UPDATE ON public.reservas
FOR EACH ROW
WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
EXECUTE FUNCTION public.notificar_reserva_estado();

-- Um trigger por comando (FOR EACH STATEMENT): limpar uma coluna com 20 reservas gera uma notificação, não 20
CREATE OR REPLACE FUNCTION public.notificar_reservas_apagadas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total INTEGER;
    v_nome TEXT;
BEGIN
    SELECT count(*), min(COALESCE(NULLIF(trim(nome_aniversariante), ''), 'sem nome'))
    INTO v_total, v_nome
    FROM apagadas;

    IF v_total = 1 THEN
        PERFORM registar_notificacao('RESERVA_APAGADA', 'Reserva apagada: ' || v_nome, NULL, '/admin/reservas');
    ELSIF v_total > 1 THEN
        PERFORM registar_notificacao('RESERVA_APAGADA', v_total || ' reservas apagadas', NULL, '/admin/reservas');
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_reservas_apagadas ON public.reservas;
CREATE TRIGGER trigger_notificar_reservas_apagadas
AFTER DELETE ON public.reservas
REFERENCING OLD TABLE AS apagadas
FOR EACH STATEMENT
EXECUTE FUNCTION public.notificar_reservas_apagadas();

-- ------------------------------------------------------------------------------
-- 5. Mensagens de contacto
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notificar_mensagem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
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

DROP TRIGGER IF EXISTS trigger_notificar_mensagem ON public.mensagens_contacto;
CREATE TRIGGER trigger_notificar_mensagem
AFTER INSERT OR UPDATE ON public.mensagens_contacto
FOR EACH ROW
EXECUTE FUNCTION public.notificar_mensagem();

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
    SELECT count(*), min(nome) INTO v_total, v_nome FROM apagadas;

    IF v_total = 1 THEN
        PERFORM registar_notificacao('MENSAGEM_APAGADA', 'Mensagem apagada: ' || v_nome, NULL, '/admin/contactos');
    ELSIF v_total > 1 THEN
        PERFORM registar_notificacao('MENSAGEM_APAGADA', v_total || ' mensagens apagadas', NULL, '/admin/contactos');
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_mensagens_apagadas ON public.mensagens_contacto;
CREATE TRIGGER trigger_notificar_mensagens_apagadas
AFTER DELETE ON public.mensagens_contacto
REFERENCING OLD TABLE AS apagadas
FOR EACH STATEMENT
EXECUTE FUNCTION public.notificar_mensagens_apagadas();

-- ------------------------------------------------------------------------------
-- 6. Calendário: eventos internos e notas do dia
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notificar_evento_calendario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_evento public.eventos_calendario;
    v_quando TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_evento := NEW;
    ELSE
        v_evento := OLD;
    END IF;
    v_quando := CASE WHEN v_evento.dia_inteiro
        THEN to_char(v_evento.inicio AT TIME ZONE 'Europe/Lisbon', 'DD/MM/YYYY') || ' • dia inteiro'
        ELSE formatar_data_festa(v_evento.inicio) END;

    IF TG_OP = 'INSERT' THEN
        PERFORM registar_notificacao('EVENTO_CRIADO', 'Evento interno criado: ' || v_evento.titulo, v_quando, '/admin/calendario');
    ELSE
        PERFORM registar_notificacao('EVENTO_APAGADO', 'Evento interno apagado: ' || v_evento.titulo, v_quando, '/admin/calendario');
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_evento_calendario ON public.eventos_calendario;
CREATE TRIGGER trigger_notificar_evento_calendario
AFTER INSERT OR DELETE ON public.eventos_calendario
FOR EACH ROW
EXECUTE FUNCTION public.notificar_evento_calendario();

CREATE OR REPLACE FUNCTION public.notificar_nota_calendario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM registar_notificacao('NOTA_DIA_CRIADA', 'Nota para ' || to_char(NEW.dia, 'DD/MM/YYYY'),
            left(NEW.texto, 120), '/admin/calendario');
    ELSE
        PERFORM registar_notificacao('NOTA_DIA_APAGADA', 'Nota apagada de ' || to_char(OLD.dia, 'DD/MM/YYYY'),
            left(OLD.texto, 120), '/admin/calendario');
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_nota_calendario ON public.notas_calendario;
CREATE TRIGGER trigger_notificar_nota_calendario
AFTER INSERT OR DELETE ON public.notas_calendario
FOR EACH ROW
EXECUTE FUNCTION public.notificar_nota_calendario();

NOTIFY pgrst, 'reload schema';
