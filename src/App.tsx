import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import OParque from './pages/OParque';
import Festas from './pages/Festas';
import { pageVariants, pageTransition } from './utils/animations';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

// === COMPONENTES DA PÁGINA: ESTÁTICOS ===
function PagePlaceholder({ title }: { title: string }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-32 text-center"
    >
      <h1 className="text-4xl font-black text-secondary">{title}</h1>
      <p className="mt-4 text-gray-600">Página em desenvolvimento estrutural.</p>
    </motion.div>
  );
}

// === GESTÃO DE ROTAS ===
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/parque" element={<OParque />} />
        <Route path="/festas" element={<Festas />} />
        <Route path="/contactos" element={<PagePlaceholder title="Contactos" />} />
        <Route path="/admin/login" element={<Login />} />
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
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  );
}