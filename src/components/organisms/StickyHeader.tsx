import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { LotacaoWidget } from '@/features/lotacao/LotacaoWidget';
import { useParkStatus } from '@/hooks/useParkStatus';

export function StickyHeader() {
  const navigate = useNavigate();
  const status = useParkStatus();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-light/10 bg-brand-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <img src="/clear_logo.png" alt="Leni's Funpark" className="h-14 md:h-16 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-brand-light/80 hover:text-brand-light transition-colors">
              Início
            </Link>
            <Link to="/sobre" className="text-sm font-medium text-brand-light/80 hover:text-brand-light transition-colors">
              Sobre Nós
            </Link>
            <Link to="/contactos" className="text-sm font-medium text-brand-light/80 hover:text-brand-light transition-colors">
              Contactos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LotacaoWidget status={status} />
          </div>
          <Button onClick={() => navigate('/marcacoes')}>
            Reservar Agora
          </Button>
        </div>
      </div>
    </header>
  );
}
