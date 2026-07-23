import { motion } from 'framer-motion';

export interface TourVisualSectionProps {}

export default function TourVisualSection({}: TourVisualSectionProps) {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-secondary">Descubra os nossos espaços</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                src="/Fotos/playground.jpg" 
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
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-surface-alt flex flex-col"
          >
            <div className="aspect-[4/3] bg-surface-alt relative">
              <img 
                src="/Fotos/futebol.jpg" 
                alt="Campo de Futebol" 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex-1">
              <h3 className="text-2xl font-black text-secondary mb-3">Campo de Futebol</h3>
              <p className="text-secondary/80">Jogue com os amigos num campo de futebol seguro e divertido, desenhado para os pequenos campeões gastarem energia.</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-surface-alt flex flex-col"
          >
            <div className="aspect-[4/3] bg-surface-alt relative">
              <img 
                src="/Fotos/matraquilos.jpg" 
                alt="Matraquilhos" 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex-1">
              <h3 className="text-2xl font-black text-secondary mb-3">Matraquilhos</h3>
              <p className="text-secondary/80">Desafie a família e os amigos para uma partida animada de matraquilhos na nossa área de jogos tradicionais.</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-surface-alt flex flex-col"
          >
            <div className="aspect-[4/3] bg-surface-alt relative">
              <img 
                src="/Fotos/escorrega_ondas.jpg" 
                alt="Escalada e Escorregas" 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex-1">
              <h3 className="text-2xl font-black text-secondary mb-3">Escalada e Escorregas</h3>
              <p className="text-secondary/80">Aventure-se na escalada e deslize a toda a velocidade nos nossos escorregas de ondas, com toda a segurança.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
