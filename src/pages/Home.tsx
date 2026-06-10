import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { TrafficLightWidget } from '../components/TrafficLightWidget';
import { BookingModule } from '../components/BookingModule';
import { Check, ChevronDown, Smartphone } from 'lucide-react';

export const Home: React.FC = () => {
  const bookingRef = useRef<HTMLDivElement>(null);

  // Safe programmatic scroll function
  const scrollToBooking = useCallback(() => {
    // We check if the ref exists immediately
    if (bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: wait for potential React/Framer-motion mounting delays
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.getElementById('reserva-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          obs.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Cleanup observer after 2 seconds to prevent memory leaks
      setTimeout(() => observer.disconnect(), 2000);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Hero Section */}
      <section className="relative bg-secondary py-24 px-4 overflow-hidden">
        {/* Placeholder video/pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          >
            O 1º Parque de Diversão Indoor na <span className="text-accent">Covilhã</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-surface-alt mb-10 max-w-2xl mx-auto"
          >
            400m² de aventura, saltos e pura alegria onde a segurança é a nossa prioridade.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" variant="accent" onClick={scrollToBooking}>
              Verificar Disponibilidade
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Traffic Light Widget Section */}
      <section className="px-4 relative z-20 -mt-16 mb-12">
        <div className="max-w-5xl mx-auto">
          <TrafficLightWidget />
        </div>
      </section>

      {/* Sobre Nós Preview */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-6">Criamos momentos de alegria inesquecível...</h2>
            <ul className="space-y-4 mb-8">
              {['Ambiente 100% Seguro e Vigiado', 'Monitores especializados', 'Lounge para pais com Wi-Fi gratuito'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/20 p-1 rounded-full text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg text-dark/80">{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline">Saber mais sobre nós</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-200 aspect-square rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
              [Imagem Parque]
            </div>
            <div className="bg-gray-200 aspect-square rounded-2xl animate-pulse flex items-center justify-center text-gray-400 mt-8">
              [Imagem Lounge]
            </div>
          </div>
        </div>
      </section>

      {/* Booking Engine Section */}
      <section id="reserva-section" ref={bookingRef} className="py-24 px-4 bg-surface-alt">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-secondary mb-4">Reserve o seu Momento</h2>
            <p className="text-lg text-dark/70">Escolha a data e preencha os seus dados. Entraremos em contacto para confirmar.</p>
          </div>
          <BookingModule />
        </div>
      </section>

      {/* Convites Digitais Section */}
      <section className="py-20 px-4 bg-primary text-white overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 flex justify-center relative">
            <div className="w-[280px] h-[580px] bg-white rounded-[3rem] p-4 shadow-2xl relative border-[8px] border-dark">
              {/* Phone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-dark rounded-b-xl w-32 mx-auto"></div>
              {/* WhatsApp Mockup inside phone */}
              <div className="w-full h-full bg-[#E5DDD5] rounded-3xl overflow-hidden flex flex-col">
                <div className="bg-[#075E54] text-white p-4 pt-8 text-center font-bold shadow-md">Leni's FunPark</div>
                <div className="flex-1 p-4 flex flex-col justify-end space-y-3">
                  <div className="bg-white text-dark p-3 rounded-2xl rounded-tl-none shadow-sm text-sm self-start max-w-[85%]">
                    🎉 Convite Especial! 🎉<br/><br/>
                    Vem festejar o meu aniversário no <strong>Leni's FunPark</strong>!<br/>
                    📅 Dia: Sábado<br/>
                    ⏰ Hora: 15:00<br/>
                    📍 Zona Industrial Tortosendo
                  </div>
                  <div className="bg-[#DCF8C6] text-dark p-3 rounded-2xl rounded-tr-none shadow-sm text-sm self-end max-w-[85%]">
                    Que fixe! Vou lá estar de certeza! 🥳
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <Smartphone className="w-16 h-16 text-surface mb-6" />
            <h2 className="text-4xl font-bold mb-6">Convites Digitais Prontos a Enviar</h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Sabemos que organizar uma festa dá trabalho. Por isso, ao reservar a sua festa no Leni's FunPark, disponibilizamos convites digitais personalizados e otimizados para WhatsApp. É só reencaminhar para os seus grupos!
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 bg-surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-secondary mb-12">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              { q: 'O uso de meias é obrigatório?', a: 'Sim! Para garantir a higiene e segurança de todos os exploradores, é obrigatório o uso de meias anti-derrapantes no interior do parque.' },
              { q: 'Os pais pagam entrada?', a: 'Os adultos acompanhantes não pagam entrada. Temos um lounge confortável onde podem relaxar, ver TV e usufruir de Wi-Fi gratuito.' },
              { q: 'Têm fraldário disponível?', a: 'Sim, dispomos de fraldários equipados e limpos para o conforto dos bebés e comodidade dos pais.' },
              { q: 'Podemos levar comida de fora?', a: 'Não é permitida a entrada de comida exterior (exceto papas/leite para bebés). Dispomos de um bar com snacks variados.' }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-sm border border-surface-alt">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-secondary">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-primary" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-dark/70">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};
