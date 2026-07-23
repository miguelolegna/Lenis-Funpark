import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

export interface ConvitesDigitaisSectionProps {}

export default function ConvitesDigitaisSection({}: ConvitesDigitaisSectionProps) {
  return (
    <section className="py-20 bg-primary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="relative bg-white rounded-[3rem] border-[14px] border-dark aspect-[9/19] shadow-2xl overflow-hidden p-4 flex flex-col justify-end">
              <div className="absolute top-0 inset-x-0 h-6 bg-dark rounded-b-xl mx-16"></div>
              
              <div className="space-y-4 mb-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-alt text-dark p-3 rounded-2xl rounded-tl-sm text-sm font-medium"
                >
                  Vais à festa do Tomás no Leni's FunPark? 🎈
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-primary/20 text-dark p-3 rounded-2xl rounded-tr-sm text-sm font-medium ml-8"
                >
                  Sim! Já recebi o convite digital, muito fixe! 🥳
                </motion.div>
              </div>
            </div>
          </div>

          <div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-black mb-6">Convites Digitais Prontos a Enviar</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Sabemos que organizar uma festa dá trabalho. Por isso, ao reservar a sua festa no Leni's FunPark, disponibilizamos convites digitais personalizados e otimizados para WhatsApp. É só reencaminhar para o seu grupo!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
