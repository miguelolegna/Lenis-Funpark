import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Tent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'O Parque', path: '/parque' },
    { name: 'Festas & Eventos', path: '/festas' },
    { name: 'Contactos', path: '/contactos' },
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-surface-alt">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-xl group-hover:bg-accent transition-colors">
              <Tent className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-secondary tracking-tight">
              Leni's <span className="text-primary">FunPark</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-semibold transition-colors hover:text-accent relative ${
                  location.pathname === link.path ? 'text-primary' : 'text-dark/80'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-accent rounded-full" 
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 text-dark hover:bg-surface-alt rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-surface-alt overflow-hidden bg-white"
            >
              <div className="px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block font-semibold p-2 rounded-lg ${
                      location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-dark/80'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-surface-alt py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2 mb-4 opacity-50">
              <Tent className="w-6 h-6" />
              <span className="text-xl font-bold tracking-tight">Leni's FunPark</span>
            </div>
            <p className="text-surface-alt/70 mb-6 max-w-sm">
              O espaço onde a imaginação ganha vida. A melhor experiência indoor para as crianças brincarem em segurança.
            </p>
            <Link to="/admin/login" className="text-xs text-white/20 hover:text-white/50 transition-colors">
              Área Reservada Staff
            </Link>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contactos</h4>
            <address className="not-italic text-surface-alt/70 space-y-2">
              <p>Zona Industrial do Tortosendo lt.23B</p>
              <p>Covilhã, Portugal</p>
              <p className="pt-2 font-semibold text-accent">+351 920 259 886</p>
            </address>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Horários</h4>
            <ul className="text-surface-alt/70 space-y-2">
              <li className="flex justify-between">
                <span>Segunda-feira</span>
                <span className="text-accent font-medium">Encerrados</span>
              </li>
              <li className="flex justify-between">
                <span>Terça a Sexta</span>
                <span>14h - 20h</span>
              </li>
              <li className="flex justify-between">
                <span>Fim de semana</span>
                <span>10h - 20h</span>
              </li>
            </ul>
          </div>

        </div>
      </footer>
    </div>
  );
};
