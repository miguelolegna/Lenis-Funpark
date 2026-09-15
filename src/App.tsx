import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import { preloadAllPublicRoutes } from './utils/preload';

// Rotas Públicas com Lazy Loading direto sem atrasos artificiais
const Home = lazy(() => import('./pages/Home'));
const OParque = lazy(() => import('./pages/OParque'));
const Festas = lazy(() => import('./pages/Festas'));
const Contactos = lazy(() => import('./pages/Contactos'));
const ReservaClient = lazy(() => import('./pages/ReservaClient'));

// Rotas Administrativas com Lazy Loading
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ReservasPage = lazy(() => import('./pages/admin/ReservasPage'));
const SemaforoPage = lazy(() => import('./pages/admin/SemaforoPage'));
const ContactosPage = lazy(() => import('./pages/admin/ContactosPage'));
const ConvitesPage = lazy(() => import('./pages/admin/ConvitesPage'));
const AdminsPage = lazy(() => import('./pages/admin/AdminsPage'));

// === GESTÃO DE ROTAS ===
function AppRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<LoadingScreen isRouteTransition />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/parque" element={<OParque />} />
          <Route path="/festas" element={<Festas />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/reserva/:token" element={<ReservaClient />} />

          {/* Autenticação Admin */}
          <Route path="/admin/login" element={<Login />} />

          {/* Shell Administrativa Protegida */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reservas" element={<ReservasPage />} />
              <Route path="semaforo" element={<SemaforoPage />} />
              <Route path="contactos" element={<ContactosPage />} />
              <Route path="convites" element={<ConvitesPage />} />
              <Route path="admins" element={<AdminsPage />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

// === PONTO DE ENTRADA ===
export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const searchParams = new URLSearchParams(window.location.search);
  const previewLoader = searchParams.get('preview_loader');

  useEffect(() => {
    // Pré-carrega rotas e recursos essenciais em background
    preloadAllPublicRoutes();
  }, []);

  const handleInitialFinish = () => {
    if (previewLoader) return;
    setIsInitialLoading(false);
  };

  return (
    <BrowserRouter>
      {previewLoader === 'route' ? (
        <LoadingScreen isRouteTransition />
      ) : (
        <AnimatePresence>
          {(isInitialLoading || previewLoader === 'initial') && (
            <LoadingScreen
              isInitial
              onFinished={handleInitialFinish}
            />
          )}
        </AnimatePresence>
      )}
      <ScrollToTop />
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  );
}