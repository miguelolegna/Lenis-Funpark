import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import OParque from './pages/OParque';
import Festas from './pages/Festas';
import Contactos from './pages/Contactos';
// import { pageVariants, pageTransition } from './lib/animations';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ReservasPage from './pages/admin/ReservasPage';
import SemaforoPage from './pages/admin/SemaforoPage';
import ContactosPage from './pages/admin/ContactosPage';
import ConvitesPage from './pages/admin/ConvitesPage';
import AdminsPage from './pages/admin/AdminsPage';
import ReservaClient from './pages/ReservaClient';

// === GESTÃO DE ROTAS ===
function AppRoutes() {
  const location = useLocation();
  return (
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
  );
}

// === PONTO DE ENTRADA ===
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  );
}