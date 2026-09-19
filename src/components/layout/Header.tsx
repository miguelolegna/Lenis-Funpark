import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { preloadRoute } from '../../utils/preload';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  // Guarda EXCLUSIVAMENTE a altura no estado completo (não-scrolled)
  const [fullNavHeight, setFullNavHeight] = useState<number>(108);
  const fullNavHeightRef = useRef<number>(108);
  const location = useLocation();

  const links = [
    { path: '/', label: 'Início' },
    { path: '/parque', label: 'O Parque' },
    { path: '/festas', label: 'Festas & Eventos' },
    { path: '/contactos', label: 'Contactos' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mede e actualiza APENAS quando navbar está no estado completo (topo da página)
  const measureFullHeight = useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    // Só registar altura quando a navbar está no seu estado completo (não-scrolled)
    if (window.scrollY <= 20) {
      const height = el.getBoundingClientRect().height;
      if (height > 0 && height !== fullNavHeightRef.current) {
        fullNavHeightRef.current = height;
        setFullNavHeight(height);
        // Sincronizar CSS variable para uso em outros componentes se necessário
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    }
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    // ResizeObserver: detecta qualquer mudança de tamanho do header (logo a carregar, resize, etc.)
    const ro = new ResizeObserver(() => measureFullHeight());
    ro.observe(el);

    // Medir imediatamente e após load da página
    measureFullHeight();
    window.addEventListener('load', measureFullHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('load', measureFullHeight);
    };
  }, [measureFullHeight]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const handleNavigation = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const handleReservaClick = (e: React.MouseEvent) => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('reservas');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '/#reservas');
      }
    }
  };

  const getLinkClasses = (path: string, isMobile = false) => {
    const isActive = location.pathname === path;
    if (isMobile) {
      return isActive
        ? "text-accent text-3xl font-black tracking-tight"
        : "text-secondary/70 hover:text-accent transition-colors text-3xl font-bold tracking-tight";
    }
    return isActive
      ? "text-accent border-b-[3px] border-accent pb-1 text-base font-black tracking-tight"
      : "text-secondary hover:text-primary transition-colors text-base font-bold tracking-tight";
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ${
          isScrolled ? "top-4 w-[95%] max-w-7xl" : "top-0 w-full max-w-full"
        }`}
      >
        <div
          className={`bg-white/95 backdrop-blur-md transition-all duration-500 flex justify-between items-center ${
            isScrolled
              ? "rounded-2xl px-6 py-3 shadow-lg border border-gray-100"
              : "px-6 md:px-10 py-4 md:py-5 shadow-sm border-b-4 border-primary"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 transition-all duration-500 relative z-[60]"
            onClick={handleNavigation}
          >
            <img
              src="/logos/Logo-sem_fundo1.png"
              alt="Leni's FunPark"
              className={`object-contain transition-all duration-500 origin-left scale-150 ${isScrolled ? 'h-10' : 'h-16'}`}
              onLoad={measureFullHeight}
            />
          </Link>

          {/* Links de Navegação (Desktop) */}
          <nav className="hidden min-[945px]:flex items-center gap-10">
            {links.map((link) => (
              <Link
                key={link.path}
                className={getLinkClasses(link.path)}
                to={link.path}
                onClick={handleNavigation}
                onMouseEnter={() => preloadRoute(link.path)}
                onTouchStart={() => preloadRoute(link.path)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Botão de Reserva (Desktop) */}
          <Link
            to="/#reservas"
            onClick={handleReservaClick}
            className="hidden min-[945px]:inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white font-black text-sm px-5 py-2.5 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>Fazer Reserva</span>
          </Link>

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button
            className="min-[945px]:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none relative z-[60] -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 bg-secondary transition-all duration-300 ease-in-out ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-secondary transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`block w-6 h-0.5 bg-secondary transition-all duration-300 ease-in-out ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Espaçador fixo com a altura exata da navbar no seu estado completo */}
      <div
        style={{ height: `${fullNavHeight}px` }}
        className="w-full shrink-0"
        aria-hidden="true"
      />

      {/* Mobile Dropdown Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-[40] transition-opacity duration-500 min-[945px]:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed top-0 left-0 w-full bg-white z-[50] flex flex-col shadow-2xl rounded-b-3xl transition-all duration-500 ease-in-out min-[945px]:hidden pt-28 pb-8 px-6 ${
          isMenuOpen
            ? "translate-y-0 opacity-100 visible"
            : "-translate-y-4 opacity-0 invisible"
        }`}
      >
        <div
          className={`flex flex-col gap-6 transition-transform duration-500 delay-100 ${
            isMenuOpen ? "translate-y-0" : "translate-y-4"
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.path}
              className={getLinkClasses(link.path, true)}
              to={link.path}
              onClick={handleNavigation}
              onMouseEnter={() => preloadRoute(link.path)}
              onTouchStart={() => preloadRoute(link.path)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Botão de Reserva (Mobile) */}
        <div
          className={`w-full mt-8 transition-transform duration-500 delay-200 ${
            isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Link
            to="/#reservas"
            onClick={handleReservaClick}
            className="w-full py-4 bg-primary hover:bg-secondary text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer text-center"
          >
            <Calendar className="w-5 h-5" />
            <span>Reservar Agora</span>
          </Link>
        </div>
      </div>
    </>
  );
}
