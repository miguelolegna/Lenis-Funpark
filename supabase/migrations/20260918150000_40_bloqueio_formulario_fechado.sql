-- ==============================================================================
-- Migração 40: Formulário fechado só reabre com o admin
--   Depois de o cliente submeter o formulário (estado LOCKED, coluna "Formulário
--   preenchido"), o cliente deixa de o poder alterar. Só volta a poder depois de o
--   admin usar "Reabrir formulário" (reabrir_formulario_b2c → IN_PROGRESS).
-- ==============================================================================

-- 1. O cliente (pedidos anónimos, feitos pelas RPCs do formulário) só altera a reserva
--    enquanto está em "Em preenchimento". O admin, os cron jobs e as Edge Functions
--    não são afetados.
CREATE OR REPLACE FUNCTION public.bloquear_formulario_fechado()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role' = 'anon'
       AND OLD.estado IS DISTINCT FROM 'IN_PROGRESS' THEN
        RAISE EXCEPTION 'Formulário fechado: só o Leni''s FunPark o pode reabrir.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_bloquear_formulario_fechado ON public.reservas;
CREATE TRIGGER trigger_bloquear_formulario_fechado
BEFORE UPDATE ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.bloquear_formulario_fechado();

-- 2. A página do cliente pergunta se o formulário está aberto antes de pedir o código
--    de acesso: 'aberto', 'fechado' ou 'invalido'.
CREATE OR REPLACE FUNCTION public.estado_formulario_b2c(p_token_opaco UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_estado TEXT;
BEGIN
    SELECT r.estado::TEXT INTO v_estado
    FROM reserva_tokens t
    JOIN reservas r ON r.id = t.reserva_id
    WHERE t.token_opaco = p_token_opaco;

    IF NOT FOUND THEN
        RETURN 'invalido';
    END IF;

    RETURN CASE WHEN v_estado = 'IN_PROGRESS' THEN 'aberto' ELSE 'fechado' END;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.estado_formulario_b2c(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.estado_formulario_b2c(UUID) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
