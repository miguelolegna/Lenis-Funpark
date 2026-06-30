import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronDown, 
  Ticket,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { pageVariants, pageTransition } from '../utils/animations';

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
      {/* HERO SECTION - Com física de Salto (Bounce) no botão para simular trampolim */}
      <section className="relative bg-secondary overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos lennis/lenis fun park siite.mp4"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-48 flex flex-col items-center text-center">
          <motion.span 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="inline-block py-1 px-3 rounded-full bg-accent text-white text-sm font-bold uppercase tracking-widest mb-6 shadow-lg"
          >
            Agora Aberto no Tortosendo!
          </motion.span>
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-xl"
          >
            O Melhor Parque de Diversão Indoor <br className="hidden md:block"/> 
            <span className="text-accent bg-white px-4 py-1 rounded-xl inline-block -rotate-2 mt-2">da Covilhã</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl font-medium drop-shadow-md">
            400m² de aventura, saltos e pura alegria onde a segurança e os sorrisos são a nossa prioridade.
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

      <SemaforoWidget />
      
      {/* SOBRE PREVIEW */}
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
                <img src="/Fotos/trampolins.jpg" loading="lazy" alt="Crianças" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="bg-surface-alt aspect-square rounded-3xl overflow-hidden shadow-lg mt-8">
                <img src="/Fotos/matraquilos.jpg" loading="lazy" alt="Parque" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <ConvitesDigitais />
      <BookingModule />
      <FAQSection />
    </motion.div>
  );
}

function SemaforoWidget() {
  return (
    <div className="relative -mt-10 z-30 flex justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-6 border-2 border-surface-alt">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-secondary/50 uppercase tracking-wider mb-2">Lotação Atual</span>
          <div className="flex space-x-2 bg-surface-alt p-2 rounded-full">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-8 h-8 rounded-full bg-primary shadow-[0_0_15px_var(--color-primary)]" />
            <div className="w-8 h-8 rounded-full bg-surface-alt/50" />
            <div className="w-8 h-8 rounded-full bg-surface-alt/50" />
          </div>
        </div>
        <div className="hidden sm:block border-l-2 border-surface-alt pl-6">
          <p className="text-2xl font-black text-primary">Livre</p>
          <p className="text-secondary/70 text-sm font-medium">Venha brincar! Temos muito espaço.</p>
        </div>
      </div>
    </div>
  );
}

function ConvitesDigitais() {
  return (
    <section className="py-20 bg-primary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Esquerda: Visual Mockup */}
          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="relative bg-white rounded-[3rem] border-[14px] border-dark aspect-[9/19] shadow-2xl overflow-hidden p-4 flex flex-col justify-end">
              {/* Status Bar Mockup */}
              <div className="absolute top-0 inset-x-0 h-6 bg-dark rounded-b-xl mx-16"></div>
              
              {/* Chat Bubbles */}
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

          {/* Direita: Copy */}
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

function BookingModule() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const daysInMonth = Array.from({length: 30}, (_, i) => i + 1);
  const occupiedDays = [5, 12, 18, 19, 25];

  const handleDayClick = (day: number) => {
    if (!occupiedDays.includes(day)) setSelectedDate(day);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const client_name = formData.get('client_name') as string;
    const client_phone = formData.get('client_phone') as string;
    const shift = formData.get('shift') as string;
    const target_date = `2026-06-${selectedDate.toString().padStart(2, '0')}`;

    try {
      const { error } = await supabase.from('bookings').insert([{
        client_name,
        client_phone,
        target_date,
        shift
      }]);
      
      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      alert('Ocorreu um erro ao registar o seu pedido: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="reservas" className="py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] p-12 shadow-2xl border-4 border-primary"
          >
            <CheckCircle2 className="w-24 h-24 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-black text-secondary mb-4">Pedido Registado!</h2>
            <button onClick={() => setSubmitted(false)} className="px-8 py-4 bg-secondary text-white font-bold rounded-xl mt-4">Novo pedido</button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="reservas" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-secondary mb-4">
            Faça a sua <span className="text-accent">Marcação</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-[3rem] p-8 shadow-2xl">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-black text-secondary flex items-center mb-6"><Calendar className="mr-2 text-primary" /> Junho 2026</h3>
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map(day => {
                const isOccupied = occupiedDays.includes(day);
                const isSelected = selectedDate === day;
                return (
                  <motion.button
                    key={day}
                    whileHover={!isOccupied && !isSelected ? { scale: 1.1 } : {}}
                    whileTap={!isOccupied ? { scale: 0.9 } : {}}
                    onClick={() => handleDayClick(day)}
                    disabled={isOccupied}
                    className={`aspect-square rounded-xl font-bold text-lg 
                      ${isOccupied ? 'bg-surface-alt text-secondary/40 cursor-not-allowed opacity-50' 
                        : isSelected ? 'bg-primary text-white shadow-lg'
                        : 'bg-surface-alt text-secondary'}
                    `}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-3 lg:border-l-2 lg:border-surface-alt lg:pl-12">
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold text-secondary mb-2">Nome *</label><input name="client_name" required className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" /></div>
                  <div><label className="block text-sm font-bold text-secondary mb-2">Telemóvel *</label><input name="client_phone" required type="tel" className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" /></div>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-secondary mb-2">Turno *</label>
                   <select name="shift" required defaultValue="" className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3">
                     <option value="" disabled>Selecione um turno...</option>
                     <option value="manha">Manhã</option>
                     <option value="tarde">Tarde</option>
                   </select>
                 </div>
               </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={!selectedDate || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg ${(selectedDate && !isSubmitting) ? 'bg-primary text-white hover:bg-secondary cursor-pointer' : 'bg-surface-alt text-secondary/50 cursor-not-allowed'}`}
              >
                {isSubmitting ? 'A enviar...' : selectedDate ? 'Pedir Confirmação' : 'Selecione uma Data'}
              </motion.button>
              
              <div className="mt-4 p-4 bg-surface-alt text-secondary text-sm rounded-xl text-center font-medium border border-surface">
                A nossa equipa irá contactá-lo para confirmar os detalhes.
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [{q: "É obrigatório o uso de meias?", a: "Sim, por questões de higiene."}];

  return (
    <section className="py-20 bg-white max-w-3xl mx-auto px-4">
      <h2 className="text-3xl font-black text-center text-secondary mb-12">Perguntas Frequentes</h2>
      {faqs.map((faq, idx) => (
        <div key={idx} className="border-2 rounded-2xl overflow-hidden mb-4 border-surface-alt">
          <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="w-full px-6 py-5 text-left flex justify-between font-bold text-secondary">
            {faq.q} <ChevronDown className={openIndex === idx ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 overflow-hidden">
                <p className="pb-5 text-secondary/80">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </section>
  );
}
