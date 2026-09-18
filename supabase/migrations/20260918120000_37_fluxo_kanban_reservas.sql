-- ==============================================================================
-- Migração 37: Novo fluxo do kanban de reservas
--   PENDING_APPROVAL (Pendente)
--     → AWAITING_DEPOSIT (A aguardar pagamento)      [admin: Aprovar]
--     → IN_PROGRESS      (Em preenchimento)          [admin: Pago → cria o link do formulário]
--     → LOCKED           (Festa em curso)            [cliente submete o formulário]
--     → COMPLETED        (Concluído)                 [automático, no dia seguinte à festa]
--   CANCELLED / REJECTED (Canceladas)                [admin: lixeira, a partir de qualquer coluna ativa]
-- ==============================================================================

-- 1. Regras de acesso
-- a) Remover a leitura pública de todas as reservas (expunha nomes, contactos e IPs a
--    visitantes anónimos). O site público só insere reservas e os horários ocupados
--    vêm de obter_horarios_ocupados (SECURITY DEFINER).
DROP POLICY IF EXISTS "anon_select_reservas" ON public.reservas;

-- b) O admin passa a poder alterar e apagar qualquer reserva
--    (a política anterior só permitia alterar festas a mais de 15 dias).
DROP POLICY IF EXISTS "permitir_update_auth" ON public.reservas;
CREATE POLICY "permitir_update_auth" ON public.reservas
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_delete_auth" ON public.reservas;
CREATE POLICY "permitir_delete_auth" ON public.reservas
FOR DELETE TO authenticated
USING (true);

-- 2. Link do formulário: criado quando o pagamento é confirmado (antes era na aprovação)
--    ou quando uma festa já paga é criada no calendário, e removido quando a reserva é cancelada.
CREATE OR REPLACE FUNCTION public.emitir_token_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.estado = 'IN_PROGRESS'
       AND NOT EXISTS (SELECT 1 FROM reserva_tokens WHERE reserva_id = NEW.id) THEN
        INSERT INTO reserva_tokens (reserva_id) VALUES (NEW.id);
    END IF;

    IF NEW.estado IN ('CANCELLED', 'REJECTED') THEN
        DELETE FROM reserva_tokens WHERE reserva_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_emissao_token ON public.reservas;
CREATE TRIGGER trigger_emissao_token
AFTER INSERT OR UPDATE OF estado ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.emitir_token_reserva();

-- 3. Formulário submetido (selar_reserva_b2c) → Festa em curso.
--    Usa assinatura_timestamp e não só termos_veracidade, porque o cliente pode marcar
--    a caixa dos termos antes de submeter. Também cobre reservas seladas ainda antes
--    do pagamento: passam diretamente para Festa em curso quando o admin marca "Pago".
CREATE OR REPLACE FUNCTION public.avancar_para_festa_em_curso()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.estado = 'IN_PROGRESS'
       AND NEW.termos_veracidade IS TRUE
       AND NEW.assinatura_timestamp IS NOT NULL
       AND (NEW.assinatura_timestamp IS DISTINCT FROM OLD.assinatura_timestamp
            OR OLD.estado IS DISTINCT FROM 'IN_PROGRESS') THEN
        NEW.estado := 'LOCKED';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_festa_em_curso ON public.reservas;
CREATE TRIGGER trigger_festa_em_curso
BEFORE UPDATE ON public.reservas
FOR EACH ROW
EXECUTE FUNCTION public.avancar_para_festa_em_curso();

-- 4. Admin reabre o formulário de uma festa em curso → volta a Em preenchimento
CREATE OR REPLACE FUNCTION public.reabrir_formulario_b2c(p_reserva_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    UPDATE reservas
    SET estado = 'IN_PROGRESS', termos_veracidade = false
    WHERE id = p_reserva_id AND estado = 'LOCKED';

    UPDATE reserva_tokens SET ativo = true WHERE reserva_id = p_reserva_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reabrir_formulario_b2c(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reabrir_formulario_b2c(UUID) TO authenticated;

-- 5. No dia seguinte à festa (hora de Lisboa), cada reserva paga passa para Concluído.
--    Reserva a reserva, para que um erro numa não impeça as restantes.
CREATE OR REPLACE FUNCTION public.concluir_festas_passadas()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT id FROM reservas
        WHERE estado IN ('IN_PROGRESS', 'LOCKED')
          AND (data_evento AT TIME ZONE 'Europe/Lisbon')::DATE < (now() AT TIME ZONE 'Europe/Lisbon')::DATE
    LOOP
        BEGIN
            UPDATE reservas SET estado = 'COMPLETED' WHERE id = r.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'concluir_festas_passadas: reserva % não foi concluída: %', r.id, SQLERRM;
        END;
    END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.concluir_festas_passadas() FROM PUBLIC, anon, authenticated;

-- De hora a hora (aos 5 minutos): cobre a meia-noite de Lisboa com e sem hora de verão.
SELECT cron.schedule(
    'concluir_festas_passadas',
    '5 * * * *',
    $$ SELECT public.concluir_festas_passadas() $$
);

-- 6. Alinhar as reservas existentes com o novo fluxo
--    a) Formulários já submetidos → Festa em curso
UPDATE public.reservas
SET estado = 'LOCKED'
WHERE estado = 'IN_PROGRESS'
  AND termos_veracidade IS TRUE
  AND assinatura_timestamp IS NOT NULL;

--    b) Festas que já passaram → Concluído
SELECT public.concluir_festas_passadas();

NOTIFY pgrst, 'reload schema';
