import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronDown, 
  Ticket,
  CheckCircle2,
  Smartphone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { pageVariants, pageTransition } from '../utils/animations';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

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
          ref={videoRef}
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek >= 2 && dayOfWeek <= 5) {
      setAvailableTimes(["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]);
    } else if (dayOfWeek === 6 || dayOfWeek === 0) {
      setAvailableTimes([
        "10:00", "11:00", "12:00", "13:00", "14:00", 
        "15:00", "16:00", "17:00", "18:00", "19:00"
      ]);
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const daysCount = getDaysInMonth(year, month);
  const daysInMonth = Array.from({length: daysCount}, (_, i) => i + 1);
  
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const isPast = clickedDate < today;
    const isMonday = clickedDate.getDay() === 1;
    if (!isPast && !isMonday) setSelectedDate(clickedDate);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) return;
    
    setIsSubmitting(true);
    
    // const formData = new FormData(e.currentTarget);
    // const client_name = formData.get('client_name') as string;
    // const client_phone = formData.get('client_phone') as string;
    // const client_email = formData.get('client_email') as string;
    // const time = formData.get('time') as string;
    // const guests = formData.get('guests') as string;
    // const notes = formData.get('notes') as string;
    // const target_date = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

    try {
      /*
      const { error } = await supabase.from('bookings').insert([{
        client_name,
        client_phone,
        client_email,
        target_date,
        time,
        guests: parseInt(guests),
        notes
      }]);
      
      if (error) throw error;
      */
      
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-secondary flex items-center">
                <Calendar className="mr-2 text-primary" /> {monthNames[month]} {year}
              </h3>
              <div className="flex space-x-2">
                <button onClick={prevMonth} type="button" className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={nextMonth} type="button" className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors"><ChevronRight size={20} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map(day => {
                const dateObj = new Date(year, month, day);
                const isPast = dateObj < today;
                const isMonday = dateObj.getDay() === 1;
                const isDisabled = isPast || isMonday;
                const isSelected = selectedDate?.getTime() === dateObj.getTime();
                
                return (
                  <motion.button
                    key={day}
                    type="button"
                    whileHover={!isDisabled && !isSelected ? { scale: 1.1 } : {}}
                    whileTap={!isDisabled ? { scale: 0.9 } : {}}
                    onClick={() => handleDayClick(day)}
                    disabled={isDisabled}
                    className={`aspect-square rounded-xl font-bold text-lg transition-colors
                      ${isDisabled ? 'bg-surface-alt text-secondary/40 cursor-not-allowed opacity-50' 
                        : isSelected ? 'bg-primary text-white shadow-lg'
                        : 'bg-surface-alt text-secondary hover:bg-primary/20'}
                    `}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </div>
          
          <div className="lg:col-span-3 lg:border-l-2 lg:border-surface-alt lg:pl-12 mt-8 lg:mt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Nome *</label>
                    <input name="client_name" required className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Telemóvel *</label>
                    <input name="client_phone" required type="tel" className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                  </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-secondary mb-2">Email *</label>
                     <input name="client_email" type="email" required className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-secondary mb-2">Nº de Pessoas *</label>
                     <input name="guests" type="number" min="1" required className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-secondary mb-2">Hora *</label>
                   <select 
                     name="time" 
                     required 
                     defaultValue="" 
                     disabled={!selectedDate || availableTimes.length === 0}
                     className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <option value="" disabled>
                       {!selectedDate 
                         ? "Selecione uma data primeiro..." 
                         : availableTimes.length === 0 
                           ? "Sem horários disponíveis" 
                           : "Selecione um horário..."}
                     </option>
                     {availableTimes.map(time => (
                       <option key={time} value={time}>{time}</option>
                     ))}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-secondary mb-2">Observações</label>
                   <textarea name="notes" rows={3} className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3 resize-none"></textarea>
                 </div>

               </div>
               
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={!selectedDate || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${(selectedDate && !isSubmitting) ? 'bg-primary text-white hover:bg-secondary cursor-pointer' : 'bg-surface-alt text-secondary/50 cursor-not-allowed'}`}
              >
                {isSubmitting ? 'A enviar...' : selectedDate ? 'Pedir Confirmação' : 'Selecione uma Data primeiro'}
              </motion.button>
              
              <div className="mt-4 p-4 bg-surface-alt text-secondary text-sm rounded-xl text-center font-medium border border-surface">
                A nossa equipa irá contactá-lo para confirmar os detalhes da sua reserva.
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
