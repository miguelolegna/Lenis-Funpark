import { motion } from 'framer-motion';

import SEO from '../components/SEO';
import HeroSection from '../sections/festas/HeroSection';
import B2COfertaSection from '../sections/festas/B2COfertaSection';

const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -40, scale: 1.02 }
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20
};

export default function Festas() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      <SEO 
        title="Festas de Aniversário - Leni's Funpark"
        description="Organiza a melhor festa de aniversário para o teu filho! Menus especiais, lanche e muita diversão nos nossos trampolins e piscina de bolas."
        url="https://lenisfunpark.com/festas"
      />
      <HeroSection />

      <B2COfertaSection />
    </motion.div>
  );
}

