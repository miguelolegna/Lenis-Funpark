import { motion } from 'framer-motion';

export type SemaforoStatus = 'Livre' | 'Moderado' | 'Cheio' | 'Fechado';

export interface SemaforoWidgetSectionProps {
  status: SemaforoStatus;
  message: string;
}

const statusTextColor: Record<SemaforoStatus, string> = {
  Livre: 'text-primary',
  Moderado: 'text-amber-600',
  Cheio: 'text-red-600',
  Fechado: 'text-secondary/70'
};

export default function SemaforoWidgetSection({ status, message }: SemaforoWidgetSectionProps) {
  return (
    <section 
      id="semaforo" 
      aria-label="Semáforo de lotação do parque"
      className="scroll-mt-28 bg-white flow-root"
    >
      <div className="relative -mt-10 z-30 flex justify-center px-4">
        <div 
          role="status"
          aria-live="polite"
          aria-label={`Lotação atual do parque: ${status}. ${message}`}
          className="bg-white rounded-3xl shadow-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:space-x-6 space-y-3 sm:space-y-0 text-center sm:text-left border-2 border-surface-alt max-w-md sm:max-w-xl mx-auto justify-center"
        >
          {/* Indicador Visual do Semáforo */}
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-bold text-secondary/60 uppercase tracking-wider mb-2">
              Lotação Atual
            </span>
            <div 
              className="flex space-x-2.5 bg-surface-alt p-2.5 rounded-full border border-surface-alt/80"
              aria-hidden="true"
            >
              {status === 'Livre' ? (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }} 
                  className="w-8 h-8 rounded-full bg-primary shadow-[0_0_15px_var(--color-primary)]" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-alt/70 border border-secondary/10" />
              )}
              {status === 'Moderado' ? (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }} 
                  className="w-8 h-8 rounded-full bg-yellow-400 shadow-[0_0_15px_var(--color-yellow-400)]" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-alt/70 border border-secondary/10" />
              )}
              {status === 'Cheio' ? (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }} 
                  className="w-8 h-8 rounded-full bg-red-500 shadow-[0_0_15px_var(--color-red-500)]" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-alt/70 border border-secondary/10" />
              )}
            </div>
          </div>

          {/* Estado e Mensagem com contraste adaptativo (visível em todos os tamanhos de ecrã) */}
          <div className="sm:border-l-2 sm:border-surface-alt sm:pl-6 flex flex-col items-center sm:items-start">
            <p className={`text-2xl sm:text-3xl font-black ${statusTextColor[status]}`}>
              {status}
            </p>
            {message ? (
              <p className="text-secondary/75 text-sm sm:text-base font-medium mt-0.5">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
