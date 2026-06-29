import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { PartyPopper, GraduationCap, CheckCircle2 } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -40, scale: 1.02 }
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20
};

export default function Festas() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      responsible_name: formData.get('responsible_name') as string,
      company_name: formData.get('company_name') as string,
      client_email: formData.get('client_email') as string,
      client_phone: formData.get('client_phone') as string,
      target_date: formData.get('target_date') as string,
      estimated_participants: formData.get('estimated_participants') as string,
      observations: formData.get('observations') as string,
    };

    try {
      const { error } = await supabase.from('event_quotes').insert([data]);
      if (error) throw error;
      setIsSubmitted(true);
    } catch (error: any) {
      alert('Erro ao enviar pedido de orçamento: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <section className="relative h-[60vh] bg-secondary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1530103862676-de88924370a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Festas e Eventos" 
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-lg"
          >
            Momentos Inesquecíveis, Zero Preocupações.
          </motion.h1>
          <motion.p 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-200 font-medium"
          >
            O nosso serviço chave-na-mão para aniversários e eventos de grupo.
          </motion.p>
        </div>
      </section>

      {/* SECÇÃO B2C: Oferta Customizada */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-secondary">Pacotes Desenhados à Medida</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pacote 1: Aniversários */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-primary flex flex-col"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <PartyPopper className="text-primary" size={32} />
              </div>
              <h3 className="text-3xl font-black text-secondary mb-4">Aniversários</h3>
              <p className="text-gray-600 mb-8 flex-1">A festa perfeita que o seu filho nunca vai esquecer, sem que os pais tenham qualquer trabalho.</p>
              
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
              
              <button className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-white hover:bg-secondary transition-colors">
                Verificar Disponibilidade
              </button>
            </motion.div>

            {/* Pacote 2: Visitas Escolares */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-secondary flex flex-col"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="text-secondary" size={32} />
              </div>
              <h3 className="text-3xl font-black text-secondary mb-4">Visitas Escolares</h3>
              <p className="text-gray-600 mb-8 flex-1">Uma experiência lúdica e desportiva ideal para turmas e associações, focada no bem-estar físico e mental.</p>
              
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
              
              <button className="w-full py-4 rounded-xl font-bold text-lg bg-secondary text-white hover:bg-primary transition-colors">
                Contactar Equipa
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECÇÃO B2B: Facilitador de Grupos */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Coluna Esquerda: Copy Persuasivo */}
            <div>
              <h2 className="text-4xl font-black text-secondary mb-6">Traga a Sua <span className="text-accent">Empresa</span> ou Grupo</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Procura uma atividade de team building diferente, ou precisa de um espaço em total exclusividade para um evento de grandes dimensões? Nós facilitamos.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                O Leni's FunPark disponibiliza condições exclusivas para encerramento de espaço, adequando-se a empresas, associações desportivas e grandes ajuntamentos superiores a 20 pessoas. Garantimos catering à medida e total apoio da nossa equipa de coordenação.
              </p>
              
              <div className="bg-surface-alt p-6 rounded-2xl border-l-4 border-accent">
                <p className="font-bold text-secondary text-lg">💡 Planeamento Rápido</p>
                <p className="text-gray-600 mt-2">Deixe-nos as informações base e a nossa equipa de gestão enviará uma proposta no prazo máximo de 48 horas.</p>
              </div>
            </div>

            {/* Coluna Direita: Formulário */}
            <div className="bg-surface p-8 lg:p-10 rounded-[2rem] shadow-2xl">
              <h3 className="text-2xl font-black text-secondary mb-8">Pedido de Orçamento</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Responsável *</label>
                    <input name="responsible_name" required type="text" className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Entidade / Empresa *</label>
                    <input name="company_name" required type="text" className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input name="client_email" required type="email" className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Telemóvel *</label>
                    <input name="client_phone" required type="tel" className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data Prevista *</label>
                    <input name="target_date" required type="date" className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nº Estimado de Pessoas *</label>
                    <select name="estimated_participants" required defaultValue="" className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors">
                      <option value="" disabled>Selecione um intervalo...</option>
                      <option value="20-50">20 a 50 pessoas</option>
                      <option value="51-100">51 a 100 pessoas</option>
                      <option value="100+">Mais de 100 pessoas (Exclusividade)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Observações / Requisitos Especiais</label>
                  <textarea name="observations" rows={4} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors resize-none"></textarea>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSubmitted || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                    isSubmitted 
                      ? 'bg-green-500 text-white cursor-not-allowed' 
                      : (isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-accent text-white hover:bg-opacity-90')
                  }`}
                >
                  {isSubmitted ? 'Pedido Enviado!' : (isSubmitting ? 'A enviar...' : 'Pedir Orçamento')}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
