import { motion } from 'framer-motion';

export interface HeroSectionProps {}

export default function HeroSection({}: HeroSectionProps) {
  return (
    <section className="relative h-[60vh] bg-secondary flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <img 
        src="/Fotos/zona_de_bolo.jpg" 
        alt="Festas e Eventos" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 text-center px-4 max-w-4xl">
        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-lg"
        >
          Momentos Inesquecíveis, Zero Preocupações.
        </motion.h1>
        <motion.p 
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-surface font-medium"
        >
          O nosso serviço chave-na-mão para aniversários e eventos de grupo.
        </motion.p>
      </div>
    </section>
  );
}
