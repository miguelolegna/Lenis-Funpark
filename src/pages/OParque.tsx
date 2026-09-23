import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../lib/animations';

import SEO from '../components/SEO';
import HeroSection from '../sections/o-parque/HeroSection';
import TourVisualSection from '../sections/o-parque/TourVisualSection';
import HistoriaMissaoSection from '../sections/o-parque/HistoriaMissaoSection';
import EquipaSection from '../sections/o-parque/EquipaSection';

export default function OParque() {
  const mockStaffList = [
    { 
      name: "Inês", 
      role: "Monitora", 
      desc: "A dona da adrenalina! Adora desafios e não descansa até contagiar toda a gente com o seu espírito aventureiro.",
      img: "/Fotos/team/ines.webp" 
    },
    { 
      name: "Helena", 
      role: "Monitora", 
      desc: "Especialista em dinamizar o parque, com atividades criativas para todas as idades.",
      img: "/Fotos/team/helena.webp" 
    },
        { 
      name: "Tatiana", 
      role: "Monitora", 
      desc: "Sempre com um sorriso no rosto para receber e esclarecer qualquer duvida",
      img: "/Fotos/team/tatiana.webp" 
    },
    { 
      name: "Ana", 
      role: "Monitora/ Explicadora", 
      desc: "A energia do parque! Com ela, até os mais tímidos ganham coragem para saltar mais alto.",
      img: "/Fotos/team/ana.webp" 
    }
  ];

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
        title="O Parque - Leni's Funpark"
        description="Conhece o espaço do Leni's Funpark. Trampolins, piscina de bolas, escorregas e muito mais. A nossa equipa de diversão está à tua espera!"
        url="https://lenisfunpark.com/parque"
      />
      <HeroSection />
      
      <TourVisualSection />
      
      <HistoriaMissaoSection />

      <EquipaSection staffList={mockStaffList} />

    </motion.div>
  );
}
