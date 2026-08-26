import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            <div className={`bg-primary rounded-xl flex items-center justify-center rotate-3 transition-all duration-500 ${isScrolled ? 'w-10 h-10' : 'w-12 h-12'}`}>
              <PartyPopper className={`text-white transition-all duration-500 ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </div>
            <span className={`ml-3 font-black text-secondary transition-all duration-500 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
              Leni's <span className="text-accent">FunPark</span>
            </span>
          </Link>

          {/* Links de Navegação (Desktop) */}
          <nav className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <Link
                key={link.path}
                className={getLinkClasses(link.path)}
                to={link.path}
                onClick={handleNavigation}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contacto (Desktop) */}
          <div className="hidden md:flex flex-col items-end shrink-0">

            <span className="font-black text-secondary text-lg tracking-tight">
              920 259 886
            </span>
            <span className="text-[10px] text-secondary/50 font-semibold">
              (Chamada para rede fixa nacional)
            </span>
          </div>

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none relative z-[60] -mr-2"
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

      {/* Mobile Dropdown Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-[40] transition-opacity duration-500 md:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed top-0 left-0 w-full bg-white z-[50] flex flex-col shadow-2xl rounded-b-3xl transition-all duration-500 ease-in-out md:hidden pt-28 pb-8 px-6 ${
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
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contacto (Mobile) */}
        <div
          className={`w-full mt-8 transition-transform duration-500 delay-200 ${
            isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-sm">
            <span className="text-secondary/60 text-sm font-semibold mb-1 uppercase tracking-wider">
              Contacto
            </span>
            <span className="font-black text-secondary text-2xl tracking-tight mb-1">
              920 259 886
            </span>
            <span className="text-xs text-secondary/50 font-medium text-center">
              (Chamada para rede fixa nacional)
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
