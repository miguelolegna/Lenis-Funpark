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

      {/* NOVA SECÇÃO: Tour Visual */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-secondary">Descubra os nossos espaços</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col"
            >
              <div className="aspect-[4/3] bg-gray-200 relative">
                <img 
                  src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Zona de Saltos" 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-black text-secondary mb-3">Zona de Saltos</h3>
                <p className="text-gray-600">A principal atração! Trampolins de última geração para saltos, piruetas e aterragens seguras em zonas acolchoadas. Diversão garantida para os mais aventureiros.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col"
            >
              <div className="aspect-[4/3] bg-gray-200 relative">
                <img 
                  src="https://images.unsplash.com/photo-1566450653303-2614cbb292ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Área Kids" 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-black text-secondary mb-3">Área Kids</h3>
                <p className="text-gray-600">Um espaço seguro e estimulante desenhado especificamente para os mais pequeninos, com piscinas de bolas, escorregas suaves e obstáculos interativos.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col"
            >
              <div className="aspect-[4/3] bg-gray-200 relative">
                <img 
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Lounge de Pais" 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-black text-secondary mb-3">Lounge de Pais</h3>
                <p className="text-gray-600">Relaxe enquanto as crianças brincam. A nossa cafetaria oferece Wi-Fi gratuito, snacks saudáveis e vista privilegiada para as zonas de brincadeira.</p>
              </div>
            </motion.div>
          </div>
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

      {/* NOVA SECÇÃO: A Nossa Equipa */}
      <section className="py-20 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-secondary">A Nossa Equipa</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Esquerda: Foto */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="A equipa Leni's FunPark" 
                loading="lazy"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </motion.div>

            {/* Direita: Staff */}
            <div className="space-y-6">
              {[
                { 
                  name: "Leni", 
                  role: "Fundadora & Diretora", 
                  img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                },
                { 
                  name: "João", 
                  role: "Monitor Chefe", 
                  img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                },
                { 
                  name: "Ana", 
                  role: "Apoio ao Cliente", 
                  img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                }
              ].map((staff, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100"
                >
                  <img 
                    src={staff.img} 
                    alt={staff.name} 
                    loading="lazy"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-secondary">{staff.name}</h4>
                    <p className="text-primary font-medium">{staff.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
