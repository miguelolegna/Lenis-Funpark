import { Button } from '@/components/atoms/Button';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden animate-mount-section">
      {/* Background Placeholder */}
      <div className="absolute inset-0 z-0 bg-brand-dark">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent z-10" />
        {/* Placeholder for Video/Image */}
        <div className="w-full h-full bg-[url('/banner.jpeg')] bg-cover bg-center opacity-40 mix-blend-overlay" />
      </div>

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-8">
        <h1 className="text-5xl md:text-7xl font-bold text-brand-light tracking-tight max-w-4xl mx-auto leading-tight">
          Leni's Funpark: <br className="hidden md:block" />
          <span className="text-brand-yellow">Onde a Diversão não tem Limites</span>
        </h1>
        <p className="text-lg md:text-xl text-brand-gray max-w-2xl">
          O melhor parque de diversões para todas as idades. Cria memórias inesquecíveis num ambiente seguro e vibrante.
        </p>
        <Button 
          onClick={() => navigate('/marcacoes')}
          className="mt-6 px-10 py-4 text-lg bg-brand-yellow text-brand-dark hover:bg-yellow-500 rounded-full font-bold"
        >
          Reservar Agora
        </Button>
      </div>
    </section>
  );
}
