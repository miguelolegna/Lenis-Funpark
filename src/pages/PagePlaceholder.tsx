import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const PagePlaceholder: React.FC = () => {
  const location = useLocation();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center"
    >
      <h1 className="text-4xl font-bold text-secondary mb-4">Em Construção</h1>
      <p className="text-lg text-dark/70 mb-8 max-w-md">
        A página para a rota <span className="font-mono bg-dark/10 px-2 py-1 rounded text-accent">'{location.pathname}'</span> está atualmente em desenvolvimento. Volte em breve!
      </p>
      <Link to="/">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Início
        </motion.button>
      </Link>
    </motion.div>
  );
};
