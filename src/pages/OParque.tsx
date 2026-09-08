import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../lib/animations';

import HeroSection from '../sections/o-parque/HeroSection';
import TourVisualSection from '../sections/o-parque/TourVisualSection';
import HistoriaMissaoSection from '../sections/o-parque/HistoriaMissaoSection';
import EquipaSection from '../sections/o-parque/EquipaSection';

export default function OParque() {
  const mockStaffList = [
    { 
      name: "Inês", 
      role: "Monitora", 
      desc: "Sempre com um sorriso para vos receber e esclarecer qualquer dúvida.",
      img: "/Fotos/team/ines.webp" 
    },
    { 
      name: "Helena", 
      role: "Monitora", 
      desc: "Especialista em dinamizar o parque, com atividades criativas para todas as idades.",
      img: "/Fotos/team/helena.webp" 
    },
    { 
      name: "Ana", 
      role: "Monitora/ Explicadora", 
      desc: "A energia do parque! Com ela, até os mais tímidos ganham coragem para saltar mais alto.",
      img: "/Fotos/team/ana.webp" 
    },
    { 
      name: "Tatiana", 
      role: "Monitora", 
      desc: "A dona da adrenalina! Adora desafios e não descansa até contagiar toda a gente com o seu espírito aventureiro.",
      img: "/Fotos/team/tatiana.webp" 
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
      <HeroSection />
      
      <TourVisualSection />
      
      <HistoriaMissaoSection />

      <EquipaSection staffList={mockStaffList} />

    </motion.div>
  );
}
