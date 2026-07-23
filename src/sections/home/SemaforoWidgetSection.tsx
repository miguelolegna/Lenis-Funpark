import { motion } from 'framer-motion';

export interface SemaforoWidgetSectionProps {
  status: 'Livre' | 'Moderado' | 'Cheio';
  message: string;
}

export default function SemaforoWidgetSection({ status, message }: SemaforoWidgetSectionProps) {
  return (
    <div className="bg-white flow-root">
      <div className="relative -mt-10 z-30 flex justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-6 border-2 border-surface-alt">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-secondary/50 uppercase tracking-wider mb-2">Lotação Atual</span>
            <div className="flex space-x-2 bg-surface-alt p-2 rounded-full">
              {status === 'Livre' ? (
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-8 h-8 rounded-full bg-primary shadow-[0_0_15px_var(--color-primary)]" />
              ) : <div className="w-8 h-8 rounded-full bg-surface-alt/50" />}
              {status === 'Moderado' ? (
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-8 h-8 rounded-full bg-yellow-400 shadow-[0_0_15px_var(--color-yellow-400)]" />
              ) : <div className="w-8 h-8 rounded-full bg-surface-alt/50" />}
              {status === 'Cheio' ? (
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-8 h-8 rounded-full bg-red-500 shadow-[0_0_15px_var(--color-red-500)]" />
              ) : <div className="w-8 h-8 rounded-full bg-surface-alt/50" />}
            </div>
          </div>
          <div className="hidden sm:block border-l-2 border-surface-alt pl-6">
            <p className="text-2xl font-black text-primary">{status}</p>
            <p className="text-secondary/70 text-sm font-medium">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
