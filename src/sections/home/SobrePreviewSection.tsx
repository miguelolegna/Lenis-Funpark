import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export interface SobrePreviewSectionProps {}

export default function SobrePreviewSection({}: SobrePreviewSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black text-secondary mb-6">Criamos momentos de <span className="text-primary">alegria inesquecível</span></h2>
            <p className="text-lg text-secondary/70 mb-8 leading-relaxed">
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
            <motion.div whileHover={{ scale: 1.05 }} className="bg-surface-alt aspect-square rounded-3xl overflow-hidden shadow-lg">
              <img src="/Fotos/trampolins.webp" loading="lazy" alt="Crianças" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-surface-alt aspect-square rounded-3xl overflow-hidden shadow-lg mt-8">
              <img src="/Fotos/matraquilos.webp" loading="lazy" alt="Parque" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
