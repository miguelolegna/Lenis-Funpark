import { motion } from 'framer-motion';
import { PartyPopper, GraduationCap, CheckCircle2, Building2, Clock } from 'lucide-react';

export interface B2COfertaSectionProps {
  onCheckAvailability: (packageType: string) => void;
}

export default function B2COfertaSection({ onCheckAvailability }: B2COfertaSectionProps) {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-secondary">Pacotes Desenhados à Medida</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[2rem] shadow-xl border-b-4 border-primary flex flex-col overflow-hidden"
          >
            <img src="/Fotos/feliz_aniversário.webp" loading="lazy" alt="Aniversários" className="w-full h-48 object-cover rounded-t-xl" />
            <div className="p-8 flex flex-col flex-1">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <PartyPopper className="text-primary" size={32} />
              </div>
              <h3 className="text-3xl font-black text-secondary mb-4">Aniversários</h3>
              <p className="text-secondary/80 mb-8 flex-1">A festa perfeita que o seu filho nunca vai esquecer, sem que os pais tenham qualquer trabalho.</p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Convites Digitais',
                  'Lanche Incluído',
                  'Supervisão Contínua',
                  'Acesso a todas as zonas'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-secondary font-medium">
                    <CheckCircle2 className="text-primary mr-3 shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onCheckAvailability('Aniversários')}
                className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-white hover:bg-secondary transition-colors"
              >
                Verificar Disponibilidade
              </button>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[2rem] shadow-xl border-b-4 border-accent flex flex-col overflow-hidden"
          >
            <img src="/Fotos/futebol.webp" loading="lazy" alt="Visitas Escolares" className="w-full h-48 object-cover rounded-t-xl" />
            <div className="p-8 flex flex-col flex-1">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="text-secondary" size={32} />
              </div>
              <h3 className="text-3xl font-black text-secondary mb-4">Visitas Escolares</h3>
              <p className="text-secondary/80 mb-8 flex-1">Uma experiência lúdica e desportiva ideal para turmas e associações, focada no bem-estar físico e mental.</p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Condições Especiais para Turmas',
                  'Desenvolvimento Motor e Lúdico',
                  'Segurança Máxima'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-secondary font-medium">
                    <CheckCircle2 className="text-secondary mr-3 shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onCheckAvailability('Visitas Escolares')}
                className="w-full py-4 rounded-xl font-bold text-lg bg-secondary text-white hover:bg-primary transition-colors"
              >
                Contactar Equipa
              </button>
            </div>
          </motion.div>

          {/* NOVO CARTÃO: Instituição */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[2rem] shadow-xl border-b-4 border-yellow-400 flex flex-col overflow-hidden"
          >
            <img src="/Fotos/playground.webp" loading="lazy" alt="Instituições" className="w-full h-48 object-cover rounded-t-xl" />
            <div className="p-8 flex flex-col flex-1">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-3xl font-black text-secondary mb-4">Traga a sua Instituição</h3>
              <p className="text-secondary/80 mb-8 flex-1">Proporcione momentos de pura alegria à sua instituição! Desenhámos condições especiais para que todos possam brincar.</p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Acesso a zona de lanche e parabéns',
                  'Lanche incluído (opcional)',
                  'Diversão em ambiente seguro'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-secondary font-medium">
                    <CheckCircle2 className="text-yellow-500 mr-3 shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onCheckAvailability('Instituição')}
                className="w-full py-4 rounded-xl font-bold text-lg bg-yellow-400 text-secondary hover:bg-yellow-500 transition-colors"
              >
                Pedir Informações
              </button>
            </div>
          </motion.div>

          {/* NOVO CARTÃO: A Qualquer Hora */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[2rem] shadow-xl border-b-4 border-green-500 flex flex-col overflow-hidden"
          >
            <img src="/Fotos/trampolins2.webp" loading="lazy" alt="Diversão à Hora" className="w-full h-48 object-cover rounded-t-xl" />
            <div className="p-8 flex flex-col flex-1">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="text-green-500" size={32} />
              </div>
              <h3 className="text-3xl font-black text-secondary mb-4">Venha a Qualquer Hora</h3>
              <p className="text-secondary/80 mb-8 flex-1">Apareça de surpresa para uma tarde diferente! Pode alugar as nossas diversões de hora a hora.</p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Aluguer de hora a hora',
                  'Acesso às melhores diversões',
                  'Perfeito para uma tarde diferente'
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-secondary font-medium">
                    <CheckCircle2 className="text-green-500 mr-3 shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onCheckAvailability('A Qualquer Hora')}
                className="w-full py-4 rounded-xl font-bold text-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Ver Tarifários
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
