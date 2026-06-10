import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Park } from './pages/Park';
import { PagePlaceholder } from './pages/PagePlaceholder';

// Admin Components
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="parque" element={<Park />} />
          <Route path="festas" element={<PagePlaceholder />} />
          <Route path="contactos" element={<PagePlaceholder />} />
          {/* Fallback routes */}
          <Route path="*" element={<PagePlaceholder />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;