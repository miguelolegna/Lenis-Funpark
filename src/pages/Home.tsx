import { motion, type Transition } from 'framer-motion';
import { Ticket, CheckCircle2 } from 'lucide-react';

// Assumindo que criaste estes componentes em ficheiros separados.
// O código para estes foi fornecido na versão consolidada anterior.
// import SemaforoWidget from '../components/SemaforoWidget';
// import BookingModule from '../components/BookingModule';
// import FAQSection from '../components/FAQSection';

const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -40, scale: 1.02 }
};

const pageTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 20
};

export default function Home() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {/* HERO SECTION */}
      <section className="relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-primary opacity-20 mix-blend-multiply"></div>
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
             <defs>
               <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                 <circle fill="#ffffff" cx="10" cy="10" r="2"></circle>
               </pattern>
             </defs>
             <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
           </svg>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-48 flex flex-col items-center text-center">
          <motion.span 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="inline-block py-1 px-3 rounded-full bg-accent text-white text-sm font-bold uppercase tracking-widest mb-6 shadow-lg"
          >
            Aberto na Covilhã
          </motion.span>
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-xl"
          >
            O 1º Parque de Diversão <br className="hidden md:block"/> 
            <span className="text-primary bg-white px-4 py-1 rounded-xl inline-block -rotate-2 mt-2">Indoor</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl font-medium drop-shadow-md">
            400m² de aventura, saltos e pura alegria onde a segurança é a nossa prioridade.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-accent border-4 border-accent rounded-2xl shadow-[0_8px_0_var(--color-accent-dark)] hover:shadow-[0_4px_0_var(--color-accent-dark)] transition-shadow"
          >
            Verificar Disponibilidade
            <Ticket className="ml-3 group-hover:rotate-12 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* COMPONENTES DE CONTEÚDO (Requer importação correta) */}
      {/* <SemaforoWidget /> */}
      
      {/* SOBRE PREVIEW */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-secondary mb-6">Criamos momentos de <span className="text-primary">alegria inesquecível</span></h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Mais do que um parque, somos o ponto de encontro perfeito para as famílias da Cova da Beira. Um espaço seguro, 100% climatizado e desenhado para que as crianças gastem energia enquanto os pais relaxam.
              </p>
              <ul className="space-y-4">
                {[
                  'Ambiente 100% Climatizado e Seguro',
                  'Monitores especializados',
                  'Zona lounge para os pais'
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    whileHover={{ x: 10 }}
                    className="flex items-center text-secondary font-bold p-3 bg-surface-alt rounded-xl cursor-default"
                  >
                    <CheckCircle2 className="text-primary mr-3" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-200 aspect-square rounded-3xl overflow-hidden shadow-lg">
                <img src="[https://images.unsplash.com/photo-1566450653303-2614cbb292ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1566450653303-2614cbb292ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)" alt="Crianças" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-200 aspect-square rounded-3xl overflow-hidden shadow-lg mt-8">
                <img src="[https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)" alt="Parque" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* <BookingModule /> */}
      {/* <FAQSection /> */}
    </motion.div>
  );
}
