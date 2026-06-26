import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronDown, 
  Ticket,
  CheckCircle2,
  // PartyPopper,
  Smartphone
} from 'lucide-react';

// === CONFIGURAÇÃO PARA SIMULAÇÃO DO AMBIENTE LOCAL ===
// No teu projeto real, O BrowserRouter e a inicialização ficam no main.tsx
// Aqui, consolido no App principal para demonstração funcional.

// === TRANSIÇÕES DE PÁGINA (Framer Motion) ===
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

// === COMPONENTES DA PÁGINA: HOME ===
// Local Real: src/pages/Home.tsx
function Home() {
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
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-primary opacity-20 mix-blend-multiply"></div>
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
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
            O 1º Parque de Diversão Indoor <br className="hidden md:block"/> 
            <span className="text-accent bg-white px-4 py-1 rounded-xl inline-block -rotate-2 mt-2">na Covilhã</span>
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

      <SemaforoWidget />
      
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
                <img src="https://images.unsplash.com/photo-1566450653303-2614cbb292ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Crianças" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-200 aspect-square rounded-3xl overflow-hidden shadow-lg mt-8">
                <img src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Parque" className="w-full h-full object-cover" />
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

// === COMPONENTES DA PÁGINA: O PARQUE ===
// Local Real: src/pages/OParque.tsx
function OParque() {
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
      
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-secondary mb-8">A Nossa História & Missão</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Mais do que um parque, uma família. Nascemos com uma missão simples: tirar as crianças de casa, dos ecrãs, e devolvê-las ao movimento puro e genuíno da brincadeira física.
          </p>
        </div>
      </section>
    </motion.div>
  );
}

// === COMPONENTES DA PÁGINA: ESTÁTICOS ===
function PagePlaceholder({ title }: { title: string }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-32 text-center"
    >
      <h1 className="text-4xl font-black text-secondary">{title}</h1>
      <p className="mt-4 text-gray-600">Página em desenvolvimento estrutural.</p>
    </motion.div>
  );
}

// === COMPONENTES PARTILHADOS ===
// Local Real: src/components/SemaforoWidget.tsx
function SemaforoWidget() {
  return (
    <div className="relative -mt-10 z-30 flex justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-6 border-2 border-gray-100">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Lotação Atual</span>
          <div className="flex space-x-2 bg-gray-100 p-2 rounded-full">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-8 h-8 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        </div>
        <div className="hidden sm:block border-l-2 border-gray-100 pl-6">
          <p className="text-2xl font-black text-green-500">Livre</p>
          <p className="text-gray-500 text-sm font-medium">Venha brincar! Temos muito espaço.</p>
        </div>
      </div>
    </div>
  );
}

// Local Real: src/components/ConvitesDigitais.tsx
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
                  className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-sm text-sm font-medium"
                >
                  Vais à festa do Tomás no Leni's FunPark? 🎈
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-[#dcf8c6] text-gray-800 p-3 rounded-2xl rounded-tr-sm text-sm font-medium ml-8"
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

// Local Real: src/components/BookingModule.tsx
function BookingModule() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const daysInMonth = Array.from({length: 30}, (_, i) => i + 1);
  const occupiedDays = [5, 12, 18, 19, 25];

  const handleDayClick = (day: number) => {
    if (!occupiedDays.includes(day)) setSelectedDate(day);
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
                      ${isOccupied ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
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
          <div className="lg:col-span-3 lg:border-l-2 lg:border-gray-100 lg:pl-12">
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Nome *</label><input required className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Telemóvel *</label><input required type="tel" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3" /></div>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Turno *</label>
                   <select required defaultValue="" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3">
                     <option value="" disabled>Selecione um turno...</option>
                     <option value="manha">Manhã</option>
                     <option value="tarde">Tarde</option>
                   </select>
                 </div>
               </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={!selectedDate}
                className={`w-full py-4 rounded-xl font-bold text-lg ${selectedDate ? 'bg-primary text-white hover:bg-secondary cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {selectedDate ? 'Pedir Confirmação' : 'Selecione uma Data'}
              </motion.button>
              
              <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl text-center font-medium border border-blue-100">
                A nossa equipa irá contactá-lo para confirmar os detalhes.
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Local Real: src/components/FAQSection.tsx
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [{q: "É obrigatório o uso de meias?", a: "Sim, por questões de higiene."}];

  return (
    <section className="py-20 bg-white max-w-3xl mx-auto px-4">
      <h2 className="text-3xl font-black text-center text-secondary mb-12">Perguntas Frequentes</h2>
      {faqs.map((faq, idx) => (
        <div key={idx} className="border-2 rounded-2xl overflow-hidden mb-4 border-gray-100">
          <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="w-full px-6 py-5 text-left flex justify-between font-bold text-secondary">
            {faq.q} <ChevronDown className={openIndex === idx ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 overflow-hidden">
                <p className="pb-5 text-gray-600">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </section>
  );
}

// === GESTÃO DE ROTAS ===
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/parque" element={<OParque />} />
        <Route path="/festas" element={<PagePlaceholder title="Festas & Eventos" />} />
        <Route path="/contactos" element={<PagePlaceholder title="Contactos" />} />
      </Routes>
    </AnimatePresence>
  );
}

// === PONTO DE ENTRADA ===
export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  );
}