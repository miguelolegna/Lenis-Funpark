import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

// Registo de páginas descarregadas na sessão para evitar recarregamento repetido
const loadedPages = new Set<string>();

// Função auxiliar de carregamento assíncrono com rastreio e suavização anti-flicker
function lazyWithTracking<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  key: string
) {
  return lazy(async () => {
    // Se a página já foi descarregada nesta sessão, resolve de imediato
    if (loadedPages.has(key)) {
      return factory();
    }
    // Primeiro carregamento: aguarda o chunk e um tempo mínimo suave (400ms)
    // para que a barra de progresso e o logótipo apareçam com fluidez
    const [module] = await Promise.all([
      factory(),
      new Promise((resolve) => setTimeout(resolve, 400)),
    ]);
    loadedPages.add(key);
    return module;
  });
}

// Rotas Públicas com Lazy Loading
const Home = lazyWithTracking(() => import('./pages/Home'), 'home');
const OParque = lazyWithTracking(() => import('./pages/OParque'), 'parque');
const Festas = lazyWithTracking(() => import('./pages/Festas'), 'festas');
const Contactos = lazyWithTracking(() => import('./pages/Contactos'), 'contactos');
const ReservaClient = lazyWithTracking(() => import('./pages/ReservaClient'), 'reserva');

// Rotas Administrativas com Lazy Loading
const Login = lazyWithTracking(() => import('./pages/admin/Login'), 'admin-login');
const Dashboard = lazyWithTracking(() => import('./pages/admin/Dashboard'), 'admin-dashboard');
const ReservasPage = lazyWithTracking(() => import('./pages/admin/ReservasPage'), 'admin-reservas');
const SemaforoPage = lazyWithTracking(() => import('./pages/admin/SemaforoPage'), 'admin-semaforo');
const ContactosPage = lazyWithTracking(() => import('./pages/admin/ContactosPage'), 'admin-contactos');
const ConvitesPage = lazyWithTracking(() => import('./pages/admin/ConvitesPage'), 'admin-convites');
const AdminsPage = lazyWithTracking(() => import('./pages/admin/AdminsPage'), 'admin-admins');

// === GESTÃO DE ROTAS ===
function AppRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<LoadingScreen isRouteTransition />}>
      <AnimatePresence mode="wait">
        <Routes location={location}>
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

  const handleInitialFinish = () => {
    if (previewLoader) return; // Mantém ativo para visualização/teste se solicitado via URL
    // Registar a rota em que o utilizador entrou como carregada
    const path = window.location.pathname;
    if (path === '/') loadedPages.add('home');
    else if (path.startsWith('/parque')) loadedPages.add('parque');
    else if (path.startsWith('/festas')) loadedPages.add('festas');
    else if (path.startsWith('/contactos')) loadedPages.add('contactos');
    else if (path.startsWith('/reserva')) loadedPages.add('reserva');
    else if (path.startsWith('/admin/login')) loadedPages.add('admin-login');
    else if (path.startsWith('/admin/dashboard')) loadedPages.add('admin-dashboard');
    else if (path.startsWith('/admin/reservas')) loadedPages.add('admin-reservas');
    else if (path.startsWith('/admin/semaforo')) loadedPages.add('admin-semaforo');
    else if (path.startsWith('/admin/contactos')) loadedPages.add('admin-contactos');
    else if (path.startsWith('/admin/convites')) loadedPages.add('admin-convites');
    else if (path.startsWith('/admin/admins')) loadedPages.add('admin-admins');

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