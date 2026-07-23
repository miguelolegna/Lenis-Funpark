import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('admin_user');
      setAuthenticated(!!savedUser);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar...</div>;
  }

  return authenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
