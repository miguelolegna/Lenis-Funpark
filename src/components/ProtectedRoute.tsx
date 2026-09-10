// import { useEffect, useState } from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
import { Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  /*
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // tenta restaurar a partir do localStorage como fallback
          const saved = localStorage.getItem('admin_session');
          if (saved) {
            const parsed = JSON.parse(saved);
            await supabase.auth.setSession({
              access_token: parsed.access_token,
              refresh_token: parsed.refresh_token,
            });
            const { data: { session: restored } } = await supabase.auth.getSession();
            setAuthenticated(!!restored);
          } else {
            setAuthenticated(false);
          }
        } else {
          setAuthenticated(true);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar...</div>;
  }

  return authenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
  */

  // Dashboard aberta temporariamente: acesso direto sem restrições
  return <Outlet />;
}
