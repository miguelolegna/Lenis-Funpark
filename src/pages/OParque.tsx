import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../lib/animations';

import HeroSection from '../sections/o-parque/HeroSection';
import TourVisualSection from '../sections/o-parque/TourVisualSection';
import HistoriaMissaoSection from '../sections/o-parque/HistoriaMissaoSection';
import EquipaSection from '../sections/o-parque/EquipaSection';

export default function OParque() {
  const mockStaffList = [
    { 
      name: "Ana", 
      role: "Monitora Chefe", 
      desc: "Sempre com um sorriso para vos receber e esclarecer qualquer dúvida.",
      img: "/Fotos/Ana.jpg" 
    },
    { 
      name: "Carla", 
      role: "Responsável de Marketing", 
      desc: "Especialista em dinamizar o parque, com atividades criativas para todas as idades.",
      img: "/Fotos/Carla.jpg" 
    },
    { 
      name: "Sofia", 
      role: "Estudante de Desporto", 
      desc: "A energia do parque! Com ela, até os mais tímidos ganham coragem para saltar mais alto.",
      img: "/Fotos/Sofia.jpg" 
    },
    { 
      name: "Margarida", 
      role: "Chefe de Segurança", 
      desc: "Sempre alerta, com os olhos em todo o lado, a garantir que cada salto é feito em segurança e com muita alegria.",
      img: "/Fotos/Margarida.jpg" 
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
