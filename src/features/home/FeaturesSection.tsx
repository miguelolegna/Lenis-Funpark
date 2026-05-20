import React from 'react';
import { ShieldCheck, Star, PartyPopper } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-yellow" />,
      title: "Segurança Máxima",
      description: "Equipamentos certificados e staff treinado"
    },
    {
      icon: <Star className="w-8 h-8 text-brand-yellow" />,
      title: "Profissionalismo",
      description: "Equipa dedicada ao seu evento"
    },
    {
      icon: <PartyPopper className="w-8 h-8 text-brand-yellow" />,
      title: "Criatividade",
      description: "Um espaço desenhado para a imaginação"
    }
  ];

  return (
    <section className="py-16 px-4 bg-brand-dark">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div 
            key={idx} 
            className="flex flex-col items-center text-center p-8 bg-[#082E32] rounded-3xl border border-white/5 hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="w-16 h-16 rounded-full border-2 border-brand-yellow flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-brand-light mb-3">{feature.title}</h3>
            <p className="text-brand-light/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
