-- ==============================================================================
-- Migração 58: Limpeza de OTPs e remoção de dependências/colunas legadas
--   1. Remove colunas e triggers legados de OTP da tabela reserva_tokens
--   2. Corrige validar_otp_b2c para não perder o DELETE / incremento de tentativas
--      por causa do rollback de RAISE EXCEPTION
--   3. Apaga imediatamente os códigos de contacto (codigos_mensagem) após validação
--   4. Unifica o cron job de limpeza (a cada minuto) para purgar OTPs expirados
--      em verification_tokens, codigos_mensagem e mensagens_contacto não verificadas
-- ==============================================================================

-- 1. Remover legado de OTP na tabela reserva_tokens (substituído por verification_tokens)
DROP TRIGGER IF EXISTS trigger_set_otp_expiration ON public.reserva_tokens;
DROP FUNCTION IF EXISTS public.set_otp_expiration();
ALTER TABLE public.reserva_tokens
    DROP COLUMN IF EXISTS otp_codigo,
    DROP COLUMN IF EXISTS expira_em;

-- 2. Restringir acesso direto à tabela verification_tokens e limpar registos expirados
REVOKE ALL ON TABLE public.verification_tokens FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.verification_tokens TO service_role;

DELETE FROM public.verification_tokens WHERE expires_at < now();

-- 3. Atualizar gerar_otp_b2c: limpa expirados ao gerar novo código e restringe a service_role
CREATE OR REPLACE FUNCTION public.gerar_otp_b2c(p_token_opaco UUID)
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_otp VARCHAR(6);
    v_hash VARCHAR;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reserva_tokens WHERE token_opaco = p_token_opaco) THEN
        RAISE EXCEPTION 'Token opaco inválido ou inexistente.';
    END IF;

    v_otp := lpad(floor(random() * 1000000)::text, 6, '0');
    v_hash := encode(digest(v_otp, 'sha256'), 'hex');

    -- Apagar tokens expirados globalmente e qualquer token anterior desta reserva
    DELETE FROM verification_tokens
    WHERE expires_at < now()
       OR (identifier = p_token_opaco::text AND token_type = 'FORM_ACCESS');

    INSERT INTO verification_tokens (identifier, code_hash, token_type, expires_at)
    VALUES (p_token_opaco::text, v_hash, 'FORM_ACCESS', now() + INTERVAL '10 minutes');

    RETURN v_otp;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.gerar_otp_b2c(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_otp_b2c(UUID) TO service_role;

-- 4. Atualizar validar_otp_b2c: devolve JSONB em vez de RAISE EXCEPTION para que
--    o DELETE de OTPs expirados/bloqueados e a contagem de tentativas sejam gravados
DROP FUNCTION IF EXISTS public.validar_otp_b2c(UUID, VARCHAR);
CREATE OR REPLACE FUNCTION public.validar_otp_b2c(p_token_opaco UUID, p_otp_codigo VARCHAR(6))
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_reserva_id UUID;
    v_record RECORD;
    v_hash VARCHAR;
BEGIN
    -- Limpar OTPs já expirados
    DELETE FROM verification_tokens WHERE expires_at < now();

    v_hash := encode(digest(trim(COALESCE(p_otp_codigo, '')), 'sha256'), 'hex');

    SELECT * INTO v_record
    FROM verification_tokens
    WHERE identifier = p_token_opaco::text AND token_type = 'FORM_ACCESS'
    FOR UPDATE;

    IF v_record IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'erro', 'Código inválido ou expirado.');
    END IF;

    IF v_record.attempts >= 5 THEN
        DELETE FROM verification_tokens WHERE id = v_record.id;
        RETURN jsonb_build_object('ok', false, 'erro', 'Demasiadas tentativas falhadas. Solicite um novo código.');
    END IF;

    IF v_record.expires_at < now() THEN
        DELETE FROM verification_tokens WHERE id = v_record.id;
        RETURN jsonb_build_object('ok', false, 'erro', 'O código expirou. Solicite um novo código.');
    END IF;

    IF v_record.code_hash <> v_hash THEN
        IF v_record.attempts + 1 >= 5 THEN
            DELETE FROM verification_tokens WHERE id = v_record.id;
            RETURN jsonb_build_object('ok', false, 'erro', 'Demasiadas tentativas falhadas. Solicite um novo código.');
        END IF;
        UPDATE verification_tokens SET attempts = attempts + 1 WHERE id = v_record.id;
        RETURN jsonb_build_object('ok', false, 'erro', 'Código incorreto.');
    END IF;

    -- OTP válido: apagar imediatamente da base de dados
    DELETE FROM verification_tokens WHERE id = v_record.id;

    SELECT reserva_id INTO v_reserva_id FROM reserva_tokens WHERE token_opaco = p_token_opaco;
    IF v_reserva_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'erro', 'Reserva não encontrada.');
    END IF;

    RETURN jsonb_build_object('ok', true, 'reserva_id', v_reserva_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.validar_otp_b2c(UUID, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validar_otp_b2c(UUID, VARCHAR) TO anon, authenticated;

-- 5. Garantir que ao selar a reserva qualquer OTP residual desse token é apagado
CREATE OR REPLACE FUNCTION public.selar_reserva_b2c(p_token_opaco UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
    v_ip TEXT;
BEGIN
    SELECT reserva_id INTO v_reserva_id
    FROM reserva_tokens
    WHERE token_opaco = p_token_opaco AND ativo = true;

    IF v_reserva_id IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: Token opaco inválido ou já destruído.';
    END IF;

    BEGIN
        v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
    EXCEPTION WHEN OTHERS THEN
        v_ip := 'unknown/local';
    END;

    INSERT INTO auditoria_termos (reserva_id, ip_address)
    VALUES (v_reserva_id, COALESCE(v_ip, 'unknown/local'));

    UPDATE reservas
    SET termos_veracidade = true,
        assinatura_ip = COALESCE(v_ip, 'unknown/local'),
        assinatura_timestamp = now()
    WHERE id = v_reserva_id;

    UPDATE reserva_tokens
    SET ativo = false
    WHERE token_opaco = p_token_opaco;

    DELETE FROM verification_tokens
    WHERE identifier = p_token_opaco::text;
END;
$$;

-- 6. Formulário de contactos: apagar imediatamente a linha de codigos_mensagem após validação
DELETE FROM public.codigos_mensagem
WHERE code_hash = '' OR created_at < now() - INTERVAL '5 minutes';

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
        DELETE FROM codigos_mensagem WHERE mensagem_id = p_mensagem_id;
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

    -- Código validado: marcar mensagem como verificada e apagar imediatamente o OTP da BD
    UPDATE mensagens_contacto SET verificada = true WHERE id = p_mensagem_id;
    DELETE FROM codigos_mensagem WHERE mensagem_id = p_mensagem_id;
    RETURN 'ok';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verificar_mensagem_contacto(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_mensagem_contacto(UUID, TEXT) TO anon, authenticated;

-- 7. Limpeza automática a cada minuto: apaga mensagens não verificadas (>5 min),
--    códigos de mensagem expirados (>5 min) e OTPs de reserva expirados (verification_tokens)
CREATE OR REPLACE FUNCTION public.limpar_mensagens_por_verificar()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    DELETE FROM public.verification_tokens
    WHERE expires_at < now();

    DELETE FROM public.codigos_mensagem
    WHERE code_hash = ''
       OR created_at < now() - INTERVAL '5 minutes';

    DELETE FROM public.mensagens_contacto
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

NOTIFY pgrst, 'reload schema';

