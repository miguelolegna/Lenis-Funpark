import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../utils/animations';

export default function OParque() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      <section className="relative h-[60vh] bg-secondary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Vista geral" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg"
          >
            Onde a Diversão Encontra a Segurança.
          </motion.h1>
          <motion.p 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-200 font-medium"
          >
            Conheça os 400m² do Leni's FunPark.
          </motion.p>
        </div>
      </section>
      
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-secondary mb-8">A Nossa História & Missão</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Mais do que um parque, uma família. Nascemos com uma missão simples: tirar as crianças de casa, dos ecrãs, e devolvê-las ao movimento puro e genuíno da brincadeira física.
          </p>
        </div>
      </section>
    </motion.div>
  );
}
