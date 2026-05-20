import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-brand-dark py-12 px-4 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <Link to="/" className="flex items-center">
          <img src="/clear_logo.png" alt="Leni's Funpark" className="h-10 md:h-12 w-auto opacity-80 hover:opacity-100 transition-opacity" />
        </Link>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm font-medium text-brand-light/80">
          <span className="text-brand-gray">Morada: Parque Industrial do Tortosendo, Covilhã</span>
          <div className="flex gap-6">
            <Link to="/privacidade" className="hover:text-brand-light transition-colors">Termos de Privacidade</Link>
            <Link to="/faq" className="hover:text-brand-light transition-colors">FAQ</Link>
          </div>
        </div>
        
        <p className="text-sm text-brand-light/50">
          &copy; 2024 Leni's Funpark. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
