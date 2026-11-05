-- ==============================================================================
-- Migração 57: Tomada de conhecimento sobre acompanhamento obrigatório
-- (crianças com patologias específicas necessitam de adulto responsável)
-- Confirmado pelo cliente no formulário de inscrição da Home.
-- ==============================================================================

-- 1. Novas colunas na tabela reservas
ALTER TABLE public.reservas
ADD COLUMN IF NOT EXISTS conhecimento_acompanhamento BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS conhecimento_acompanhamento_em TIMESTAMPTZ;

-- 2. Trigger para carimbar automaticamente a data/hora quando conhecimento_acompanhamento = true
CREATE OR REPLACE FUNCTION public.registar_conhecimento_acompanhamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.conhecimento_acompanhamento IS TRUE AND (TG_OP = 'INSERT' OR OLD.conhecimento_acompanhamento IS DISTINCT FROM TRUE) THEN
        NEW.conhecimento_acompanhamento_em := COALESCE(NEW.conhecimento_acompanhamento_em, now());
    ELSIF NEW.conhecimento_acompanhamento IS NOT TRUE THEN
        NEW.conhecimento_acompanhamento_em := NULL;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_conhecimento_acompanhamento ON public.reservas;
CREATE TRIGGER trigger_conhecimento_acompanhamento
BEFORE INSERT OR UPDATE OF conhecimento_acompanhamento ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.registar_conhecimento_acompanhamento();

-- 3. Recompilar obter_reserva_b2c para incluir as novas colunas no JSON retornado
CREATE OR REPLACE FUNCTION public.obter_reserva_b2c(p_token_opaco UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
    v_dados JSONB;
BEGIN
    SELECT reserva_id INTO v_reserva_id FROM reserva_tokens WHERE token_opaco = p_token_opaco;
    
    IF v_reserva_id IS NULL THEN 
        RAISE EXCEPTION 'Acesso negado: Token opaco inválido.'; 
    END IF;

    SELECT to_jsonb(r) INTO v_dados
    FROM reservas r
    WHERE id = v_reserva_id;

    RETURN v_dados;
END;
$$;

-- 4. Notificar PostgREST para recarregar schema cache
NOTIFY pgrst, 'reload schema';
