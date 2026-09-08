import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';

export interface HeroSectionProps {
  onCheckAvailability: () => void;
}

export default function HeroSection({ onCheckAvailability }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.9;
    }
  }, []);

  return (
    <section className="relative">
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos lennis/Lenis Fun Park Siite.mp4"
      />
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-48 flex flex-col items-center text-center">
        <motion.span 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="inline-block py-1 px-3 rounded-full bg-accent text-white text-sm font-bold uppercase tracking-widest mb-6 shadow-lg"
        >
          Agora Aberto no Tortosendo!
        </motion.span>
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-xl"
        >
          O Melhor Parque de Diversão Indoor <br className="hidden md:block"/> 
          <span className="text-accent bg-white px-4 py-1 rounded-xl inline-block -rotate-2 mt-2">da Covilhã</span>
        </motion.h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl font-medium drop-shadow-md">
          400m² de aventura, saltos e pura alegria onde a segurança e os sorrisos são a nossa prioridade.
        </p>
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCheckAvailability}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-accent border-4 border-accent rounded-2xl shadow-[0_8px_0_var(--color-accent-dark)] hover:shadow-[0_4px_0_var(--color-accent-dark)] transition-shadow"
        >
          Verificar Disponibilidade
          <Ticket className="ml-3 group-hover:rotate-12 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
}
