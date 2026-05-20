import { StickyHeader } from '@/components/organisms/StickyHeader';
import { Footer } from '@/components/organisms/Footer';

export default function Sobre() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <StickyHeader />
      
      <main className="flex-1 animate-mount-section">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-brand-light mb-6">
            Onde a imaginação <span className="text-brand-yellow">voa alto</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-gray leading-relaxed">
            O Leni's Funpark é um espaço dedicado à alegria e diversão em família. Desenhado para criar as melhores memórias, oferecemos um ambiente vibrante e seguro onde cada momento conta.
          </p>
        </section>

        {/* Trust Seals Grid */}
        <section className="py-12 px-4 bg-[#082E32]/50 border-y border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-dark/50 p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-brand-light mb-2">Segurança Máxima</h3>
              <p className="text-brand-gray text-sm">Equipamentos certificados e vigilância contínua para a paz de espírito dos pais.</p>
            </div>
            <div className="bg-brand-dark/50 p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-brand-light mb-2">Higiene Certificada</h3>
              <p className="text-brand-gray text-sm">Protocolos rigorosos de limpeza e desinfeção diária em todo o parque.</p>
            </div>
            <div className="bg-brand-dark/50 p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center mb-4">
                <span className="text-2xl">❄️</span>
              </div>
              <h3 className="text-xl font-bold text-brand-light mb-2">Climatização</h3>
              <p className="text-brand-gray text-sm">Ambiente com temperatura controlada para máximo conforto, seja Verão ou Inverno.</p>
            </div>
          </div>
        </section>

        {/* Multimedia Gallery */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-light mb-10 text-center">O Nosso Espaço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="aspect-[4/3] rounded-2xl bg-[#082E32] flex items-center justify-center border border-white/10 hover:border-brand-yellow transition-colors group cursor-pointer overflow-hidden">
              <span className="text-brand-light/30 font-medium group-hover:scale-110 transition-transform">Piscina de Bolas</span>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-[#082E32] flex items-center justify-center border border-white/10 hover:border-brand-yellow transition-colors group cursor-pointer overflow-hidden">
              <span className="text-brand-light/30 font-medium group-hover:scale-110 transition-transform">Trampolins</span>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-[#082E32] flex items-center justify-center border border-white/10 hover:border-brand-yellow transition-colors group cursor-pointer overflow-hidden">
              <span className="text-brand-light/30 font-medium group-hover:scale-110 transition-transform">Zona Kids</span>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-[#082E32] flex items-center justify-center border border-white/10 lg:col-span-2 hover:border-brand-yellow transition-colors group cursor-pointer overflow-hidden">
              <span className="text-brand-light/30 font-medium group-hover:scale-110 transition-transform">Circuito Aventura</span>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-[#082E32] flex items-center justify-center border border-white/10 hover:border-brand-yellow transition-colors group cursor-pointer overflow-hidden">
              <span className="text-brand-light/30 font-medium group-hover:scale-110 transition-transform">Cafetaria</span>
            </div>
          </div>
        </section>

        {/* Location Module */}
        <section className="py-20 px-4 bg-[#082E32]/30 border-t border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-light mb-6">Visite-nos</h2>
            <p className="text-brand-gray mb-10">Parque Industrial do Tortosendo, Covilhã</p>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3032.5516086701546!2d-7.536762084600122!3d40.23071377938634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3cd1e309fb13bf%3A0xc6465492d292f7ea!2sParque%20Industrial%20do%20Tortosendo!5e0!3m2!1spt-PT!2spt!4v1700000000000!5m2!1spt-PT!2spt" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Leni's Funpark"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
