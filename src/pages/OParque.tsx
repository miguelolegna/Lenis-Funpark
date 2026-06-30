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
            className="text-xl md:text-2xl text-surface font-medium"
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
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-surface-alt flex flex-col"
            >
              <div className="aspect-[4/3] bg-surface-alt relative">
                <img 
                  src="/Fotos/trampolins2.jpg" 
                  alt="Zona de Saltos" 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-black text-secondary mb-3">Zona de Saltos</h3>
                <p className="text-secondary/80">A principal atração! Trampolins de última geração para saltos, piruetas e aterragens seguras em zonas acolchoadas. Diversão garantida para os mais aventureiros.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-surface-alt flex flex-col"
            >
              <div className="aspect-[4/3] bg-surface-alt relative">
                <img 
                  src="/Fotos/ball_pitt.jpg" 
                  alt="Área Kids" 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-black text-secondary mb-3">Área Kids</h3>
                <p className="text-secondary/80">Um espaço seguro e estimulante desenhado especificamente para os mais pequeninos, com piscinas de bolas, escorregas suaves e obstáculos interativos.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-surface-alt flex flex-col"
            >
              <div className="aspect-[4/3] bg-surface-alt relative">
                <img 
                  src="/Fotos/parent.jpg" 
                  alt="Lounge de Pais" 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-black text-secondary mb-3">Lounge de Pais</h3>
                <p className="text-secondary/80">Relaxe enquanto as crianças brincam. A nossa cafetaria oferece Wi-Fi gratuito, snacks saudáveis e vista privilegiada para as zonas de brincadeira.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-secondary mb-8">A Nossa História & Missão</h2>
          <p className="text-lg text-secondary/80 leading-relaxed mb-6">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-16">
            {[
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
            ].map((staff, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 text-center border border-surface-alt flex flex-col items-center"
              >
                <img 
                  src={staff.img} 
                  alt={staff.name} 
                  loading="lazy"
                  className="w-32 h-32 rounded-full object-cover mx-auto -mt-16 border-4 border-white shadow-md mb-4"
                />
                <h4 className="text-xl font-bold text-secondary mb-1">{staff.name}</h4>
                <p className="text-sm text-primary font-bold mb-4">{staff.role}</p>
                <p className="text-secondary/70 text-sm leading-relaxed">{staff.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
