import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
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
import ReservaClient from './pages/ReservaClient';

// === GESTÃO DE ROTAS ===
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/parque" element={<OParque />} />
        <Route path="/festas" element={<Festas />} />
        <Route path="/contactos" element={<Contactos />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/reserva/:token" element={<ReservaClient />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
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