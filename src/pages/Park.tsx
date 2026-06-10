import React from 'react';
import { motion } from 'framer-motion';

export const Park: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Photographic background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551000676-47eeb09a8eb7?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Onde a Diversão Encontra a Segurança.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Conheça os 400m² do Leni's FunPark.
          </p>
        </div>
      </section>

      {/* Galeria de Imagens (Zonas do Parque) */}
      <section className="py-24 px-4 bg-surface-alt">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
            {/* Zona de Saltos */}
            <div className="md:col-span-2 md:row-span-2 rounded-2xl shadow-lg bg-cover bg-center relative overflow-hidden group" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=800&q=80')" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="absolute bottom-6 left-6 text-3xl font-bold text-white">Zona de Saltos</h3>
            </div>
            {/* Área Kids */}
            <div className="md:col-span-1 rounded-2xl shadow-lg bg-cover bg-center relative overflow-hidden group" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534151772186-b413158f0003?auto=format&fit=crop&w=600&q=80')" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">Área Kids</h3>
            </div>
            {/* Lounge de Pais */}
            <div className="md:col-span-1 rounded-2xl shadow-lg bg-cover bg-center relative overflow-hidden group" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=600&q=80')" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">Lounge de Pais</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-4 bg-surface">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="prose prose-lg prose-headings:text-secondary prose-p:text-dark/80">
            <h2 className="text-4xl font-bold mb-8 text-secondary">A Nossa História & Missão</h2>
            
            <div className="space-y-6 text-lg leading-relaxed">
              <p className="font-semibold text-xl text-primary leading-snug">
                Mais do que um parque, uma família. Nascemos com uma missão simples: tirar as crianças de casa, dos ecrãs, e devolvê-las ao movimento puro e genuíno da brincadeira física.
              </p>
              <p>
                Na era digital em que vivemos, o movimento, a brincadeira física e a socialização ao vivo tornaram-se necessidades ainda mais cruciais para o desenvolvimento saudável das crianças. A nossa missão é proporcionar esse ambiente perfeito, onde a energia pode ser gasta com alegria e total segurança.
              </p>
              <p>
                Localizado na <strong>Zona Industrial do Tortosendo</strong>, o nosso parque oferece uma infraestrutura de excelência, desenhada cuidadosamente para desafiar a motricidade infantil, promovendo ao mesmo tempo uma interação social rica e memorável.
              </p>
              <p>
                Equipado com áreas que variam entre as piscinas de bolas, escorregas tubulares gigantes e trampolins, garantimos que cada visita é uma nova aventura que fortalece laços, arranca sorrisos e, acima de tudo, deixa pais descansados graças à nossa vigilância rigorosa.
              </p>
            </div>
          </div>
          
          <div className="relative h-full min-h-[450px]">
            <div className="absolute inset-0 rounded-3xl shadow-xl bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80')" }} />
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent rounded-full -z-10 opacity-50" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-full -z-10 opacity-30" />
          </div>
        </div>
      </section>

      {/* Equipa Section */}
      <section className="py-24 px-4 bg-surface-alt">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Fotografia de Grupo */}
          <div className="relative h-full min-h-[400px]">
            <div className="absolute inset-0 rounded-3xl shadow-xl bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80')" }} />
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-secondary mb-1">A Nossa Família</h3>
              <p className="text-primary font-semibold">Monitores especializados</p>
            </div>
          </div>

          {/* Carrossel de Equipa Structure */}
          <div className="w-full overflow-hidden">
            <h2 className="text-4xl font-bold mb-6 text-secondary">A Nossa Equipa</h2>
            <p className="text-lg text-dark/80 mb-10 leading-relaxed">
              Selecionamos cuidadosamente a nossa equipa para garantir o máximo de diversão com o rigor e segurança que os pais exigem. Conheça alguns dos rostos que vão acompanhar as crianças.
            </p>
            
            {/* Scrollable Container for Team Cards */}
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              {[
                { name: 'Sofia M.', role: 'Supervisora', imgId: '1534528741775-53994a69daeb' },
                { name: 'Tiago C.', role: 'Monitor Kids', imgId: '1506794778202-cad84cf45f1d' },
                { name: 'Marta R.', role: 'Apoio Festas', imgId: '1494790108377-be9c29b29330' },
                { name: 'João S.', role: 'Monitor Saltos', imgId: '1507003211169-0a1dd7228f2d' }
              ].map((member, i) => (
                <div key={i} className="min-w-[180px] snap-center bg-white rounded-3xl shadow-sm border border-surface p-6 text-center shrink-0">
                  <div 
                    className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 bg-cover bg-center shadow-inner" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-${member.imgId}?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80')` }} 
                  />
                  <h4 className="font-bold text-secondary text-lg mb-1">{member.name}</h4>
                  <p className="text-primary font-semibold text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
