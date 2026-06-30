import { MapPin, Phone, Mail } from 'lucide-react';

export default function MapSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row overflow-hidden rounded-[2rem] shadow-2xl bg-secondary">
        {/* Coluna Esquerda (Painel de Contacto) */}
        <div className="w-full lg:w-2/5 p-10 lg:p-12 text-white flex flex-col justify-center">
          <h2 className="text-4xl font-black mb-4">Venha visitar-nos!</h2>
          <p className="text-lg text-surface-alt mb-10">Venha ver e experimentar o nosso espaço.</p>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-6 rounded-2xl flex items-center">
              <MapPin className="text-primary mr-4 shrink-0" size={32} />
              <span className="font-medium text-lg">Zona Industrial do Tortosendo lt.23B Rua F, 6200-823 Tortosendo</span>
            </div>
            
            <div className="bg-accent p-6 rounded-2xl flex items-center">
              <Phone className="text-white mr-4 shrink-0" size={32} />
              <span className="font-medium text-lg font-bold">920 259 886</span>
            </div>
            
            <div className="bg-white/10 p-6 rounded-2xl flex items-center">
              <Mail className="text-primary mr-4 shrink-0" size={32} />
              <span className="font-medium text-lg">layout.agency.pt@gmail.com</span>
            </div>
          </div>
        </div>
        
        {/* Coluna Direita (Mapa) */}
        <div className="w-full lg:w-3/5">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3051.4886361665426!2d-7.4984!3d40.22!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDEzJzEyLjAiTiA3wrAyOSc1NC4yIlc!5e0!3m2!1spt-PT!2spt!4v1700000000000!5m2!1spt-PT!2spt" 
            className="w-full h-full min-h-[400px] border-0"
            loading="lazy"
            title="Localização"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
