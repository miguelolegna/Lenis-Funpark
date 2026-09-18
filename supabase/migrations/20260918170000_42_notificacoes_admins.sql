-- ==============================================================================
-- Migração 42: Notificações de contas de admin criadas e removidas
--   Separada da 41 porque cria um trigger em auth.users: se o Supabase o recusar,
--   só esta parte falha. Requer a migração 41 (registar_notificacao).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.notificar_admin_conta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM registar_notificacao('ADMIN_CRIADO', 'Novo administrador: ' || COALESCE(NEW.email, 'sem email'), NULL, '/admin/admins');
    ELSE
        PERFORM registar_notificacao('ADMIN_REMOVIDO', 'Administrador removido: ' || COALESCE(OLD.email, 'sem email'), NULL, '/admin/admins');
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_admin_conta ON auth.users;
CREATE TRIGGER trigger_notificar_admin_conta
AFTER INSERT OR DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.notificar_admin_conta();
