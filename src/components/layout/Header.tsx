import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper, Menu, X } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { path: '/', label: 'Início' },
    { path: '/parque', label: 'O Parque' },
    { path: '/festas', label: 'Festas & Eventos' },
    { path: '/contactos', label: 'Contactos' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center rotate-3">
              <PartyPopper className="text-white" />
            </div>
            <span className="ml-3 font-black text-2xl text-secondary">Leni's <span className="text-accent">FunPark</span></span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            {links.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-lg font-bold transition-colors ${location.pathname === link.path ? 'text-accent border-b-2 border-accent' : 'text-secondary hover:text-primary'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button 
            className="md:hidden text-secondary hover:text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      
      {/* Dropdown Menu Mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-surface-alt overflow-hidden"
          >
            <nav className="flex flex-col px-4 pt-2 pb-6 space-y-4 shadow-inner">
              {links.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block text-lg font-bold transition-colors ${location.pathname === link.path ? 'text-accent' : 'text-secondary hover:text-primary'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
