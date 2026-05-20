import React from 'react';
import { Button } from '@/components/atoms/Button';

export function DigitalInviteSection() {
  return (
    <section className="py-20 px-4 bg-brand-dark">
      <div className="max-w-6xl mx-auto bg-[#082E32] rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-stretch shadow-2xl border border-white/5">
        
        {/* Image/Mockup side */}
        <div className="md:w-1/2 relative bg-gradient-to-br from-brand-dark/50 to-transparent p-12 min-h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          
          {/* Phone Mockup Placeholder */}
          <div className="relative z-10 w-[280px] h-[580px] bg-[#0A192F] rounded-[3rem] border-8 border-brand-dark shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-brand-dark/40 flex-1 p-6 flex flex-col justify-center items-center text-center">
              <h4 className="text-3xl font-bold text-brand-yellow mb-2 font-serif">Leni's<br/>Funpark</h4>
              <p className="text-brand-light text-sm mb-6">És o nosso convidado especial!</p>
              
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm w-full border border-white/5">
                <p className="text-brand-light font-medium text-sm mb-1">Data: Sábado, 15 de Junho</p>
                <p className="text-brand-light/70 text-xs">A diversão não tem limites</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content side */}
        <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center items-start">
          <div className="inline-block px-4 py-1.5 rounded-full border border-brand-yellow text-brand-yellow text-sm font-bold tracking-wider uppercase mb-6">
            Novidade
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-brand-light mb-6 leading-tight">
            Convite Digital Gratuito
          </h2>
          
          <p className="text-brand-light/80 text-lg mb-10 leading-relaxed">
            Torne a sua festa ainda mais especial. Ao reservar uma festa connosco, recebe um convite digital personalizado para partilhar com todos os seus convidados.
          </p>
          
          <Button className="px-8 py-4 text-lg bg-brand-yellow text-brand-dark hover:bg-yellow-500 rounded-full font-bold">
            Marcar Festa
          </Button>
        </div>
      </div>
    </section>
  );
}
