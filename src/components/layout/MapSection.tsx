import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { useCookieConsent } from '../../lib/cookieConsent';

const LINK_GOOGLE_MAPS = "https://www.google.com/maps/search/?api=1&query=Leni's+FunPark+Tortosendo";

export default function MapSection() {
  // O iframe da Google só entra no DOM com consentimento de "Conteúdos externos"
  const { externos, guardar } = useCookieConsent();

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
              <span className="font-medium text-lg font-bold">(+351) 920 259 886</span>
            </div>
            
            <div className="bg-white/10 p-6 rounded-2xl flex items-center">
              <Mail className="text-primary mr-4 shrink-0" size={32} />
              <span className="font-medium text-lg">pereira.garcia2025@gmail.com</span>
            </div>
          </div>
        </div>
        
        {/* Coluna Direita (Mapa) */}
        <div className="w-full lg:w-3/5">
          {externos ? (
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3851.171062736886!2d-7.511324187859523!3d40.23053796683072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd3d2300266a00f5%3A0xbb18ab4f16cebe67!2sLeni&#39;s%20FunPark!5e1!3m2!1spt-PT!2spt!4v1782845233288!5m2!1spt-PT!2spt" 
            className="w-full h-full min-h-[400px] border-0"
            loading="lazy"
            title="Localização"
          ></iframe>
          ) : (
            <div className="w-full h-full min-h-[400px] bg-surface-alt flex flex-col items-center justify-center text-center p-8 gap-4">
              <MapPin className="text-primary" size={40} />
              <p className="font-bold text-secondary max-w-sm">
                Zona Industrial do Tortosendo, lt. 23B, Rua F, 6200-823 Tortosendo
              </p>
              <p className="text-sm text-secondary/70 font-medium">
                Para ver o mapa, autorize os conteúdos externos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => guardar(true)}
                  className="px-5 py-3 rounded-xl bg-primary text-white font-black text-sm hover:bg-secondary transition-colors cursor-pointer"
                >
                  Mostrar mapa
                </button>
                <a
                  href={LINK_GOOGLE_MAPS}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl border-2 border-secondary/20 text-secondary font-bold text-sm hover:bg-white transition-colors inline-flex items-center justify-center gap-2"
                >
                  Abrir no Google Maps
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
