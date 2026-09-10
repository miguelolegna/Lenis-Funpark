import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  isInitial?: boolean;
  isRouteTransition?: boolean;
  onFinished?: () => void;
}

export default function LoadingScreen({
  isInitial = false,
  isRouteTransition = false,
  onFinished,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isInitial) return;

    let isMounted = true;
    const startTime = performance.now();
    const duration = 850; // 850ms de transição suave da barra inicial

    const tick = (currentTime: number) => {
      if (!isMounted) return;
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1, elapsed / duration);
      
      // Curva de aceleração natural (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - rawProgress, 3);
      setProgress(Math.round(easeProgress * 100));

      if (rawProgress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Breve pausa a 100% para satisfação visual antes do fade-out
        setTimeout(() => {
          if (isMounted && onFinished) {
            onFinished();
          }
        }, 120);
      }
    };

    const animId = requestAnimationFrame(tick);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [isInitial, onFinished]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center select-none pointer-events-auto"
    >
      {/* Logótipo com fade e escala sutil */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center mb-8"
      >
        <img
          src="/logos/Logo-sem_fundo1.png"
          alt="Leni's FunPark"
          className="w-36 sm:w-44 md:w-48 h-auto max-h-48 object-contain pointer-events-none select-none drop-shadow-xs"
          draggable={false}
        />
      </motion.div>

      {/* Barra de carregamento minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        className="w-44 sm:w-52 h-1 sm:h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
      >
        {isInitial && !isRouteTransition ? (
          // Modo Inicial: preenchimento gradual de 0 a 100%
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-[#1cb3a1] to-primary rounded-full relative"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.1 }}
          >
            {/* Efeito sutil de brilho/shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
          </motion.div>
        ) : (
          // Modo Transição de Rota: barra indeterminada fluida e elegante
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-[#1cb3a1] to-primary rounded-full relative"
            initial={{ x: '-100%', width: '45%' }}
            animate={{ x: '250%' }}
            transition={{
              repeat: Infinity,
              duration: 0.95,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 0.95, ease: 'linear' }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
