import React from 'react';
import { motion } from 'framer-motion';

export const TrafficLightWidget: React.FC = () => {
  // Current fixed local state
  const [status] = React.useState<'livre' | 'composto' | 'cheio'>('livre');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center max-w-sm mx-auto border border-surface-alt">
      <h3 className="text-lg font-bold text-secondary mb-3">Lotação Atual</h3>
      
      <div className="flex gap-4 p-4 bg-dark rounded-full mb-4 shadow-inner">
        <motion.div 
          className={`w-12 h-12 rounded-full ${status === 'livre' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-green-900/50'}`}
          animate={{ opacity: status === 'livre' ? 1 : 0.3 }}
        />
        <motion.div 
          className={`w-12 h-12 rounded-full ${status === 'composto' ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-yellow-900/50'}`}
          animate={{ opacity: status === 'composto' ? 1 : 0.3 }}
        />
        <motion.div 
          className={`w-12 h-12 rounded-full ${status === 'cheio' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-red-900/50'}`}
          animate={{ opacity: status === 'cheio' ? 1 : 0.3 }}
        />
      </div>
      
      <p className="text-dark/80 font-medium text-center">
        Estado: <span className="font-bold uppercase text-green-600">Livre</span>
        <br />
        <span className="text-sm text-dark/60">Pode vir visitar-nos sem reserva prévia!</span>
      </p>
    </div>
  );
};
