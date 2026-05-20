import React from 'react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

export function BookingSection() {
  return (
    <section className="py-20 px-4 bg-brand-dark">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-light mb-2">Faça a sua Marcação</h2>
            <p className="text-brand-gray text-lg">Garanta já o seu lugar na diversão.</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm font-medium bg-[#082E32] px-4 py-2 rounded-full border border-white/5">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-light"></span> Livre</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-yellow"></span> Pré-reserva</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-red"></span> Ocupado</span>
          </div>
        </div>

        <div className="bg-[#082E32] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
          <form className="space-y-6 max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Nome" 
                placeholder="Insira o seu nome" 
                required 
                className="bg-brand-light text-brand-dark border-transparent focus-visible:ring-brand-yellow"
              />
              <Input 
                label="Email" 
                type="email" 
                placeholder="email@exemplo.pt" 
                required 
                className="bg-brand-light text-brand-dark border-transparent focus-visible:ring-brand-yellow"
              />
            </div>
            
            <Input 
              label="Contacto" 
              type="tel" 
              placeholder="Nº de telemóvel" 
              required 
              className="bg-brand-light text-brand-dark border-transparent focus-visible:ring-brand-yellow"
            />

            <Button type="submit" className="w-full mt-8 py-4 text-lg bg-brand-yellow text-brand-dark hover:bg-yellow-500 font-bold rounded-xl">
              Enviar Pedido
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
