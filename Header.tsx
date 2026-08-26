import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
        ? "text-brand-blue text-3xl font-black tracking-tight"
        : "text-gray-400 hover:text-brand-blue transition-colors text-3xl font-bold tracking-tight";
    }
    return isActive
      ? "text-brand-blue border-b-[3px] border-brand-lime pb-1 text-base font-black tracking-tight"
      : "text-brand-blue hover:text-brand-lime transition-colors text-base font-bold tracking-tight";
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
              ? "rounded-2xl px-6 py-2 shadow-lg border border-gray-100"
              : "px-6 lg:px-10 py-4 lg:py-5 shadow-sm border-b border-gray-200"
          }`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 transition-all duration-500 relative z-[60]"
            onClick={handleNavigation}
          >
            <img
              src="/logo.png"
              alt="Covitool Logo"
              className={`transition-all duration-500 object-contain object-left ${
                isScrolled ? "h-10" : "h-12 lg:h-14"
              }`}
            />
          </Link>

          {/* Links de Navegação (Desktop) */}
          <nav className="hidden lg:flex items-center gap-10">
            <Link
              className={getLinkClasses("/")}
              to="/"
              onClick={handleNavigation}
            >
              Home
            </Link>
            <Link
              className={getLinkClasses("/marcas")}
              to="/marcas"
              onClick={handleNavigation}
            >
              Marcas
            </Link>
            <Link
              className={getLinkClasses("/sobre-nos")}
              to="/sobre-nos"
              onClick={handleNavigation}
            >
              Sobre Nós
            </Link>
            <Link
              className={getLinkClasses("/folhetos")}
              to="/folhetos"
              onClick={handleNavigation}
            >
              Folhetos
            </Link>
          </nav>

          {/* Novo Bloco de Contacto à Direita (Desktop) */}
          <div className="hidden lg:flex flex-col items-end shrink-0">
            <span className="font-black text-brand-blue text-lg tracking-tight">
              +351 275 322 030
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">
              (Chamada para rede fixa nacional)
            </span>
          </div>

          {/* Hamburger Menu Toggle (Mobile only) */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none relative z-[60] -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 bg-brand-blue transition-all duration-300 ease-in-out ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-brand-blue transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`block w-6 h-0.5 bg-brand-blue transition-all duration-300 ease-in-out ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-[40] transition-opacity duration-500 lg:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed top-0 left-0 w-full bg-white z-[50] flex flex-col shadow-2xl rounded-b-3xl transition-all duration-500 ease-in-out lg:hidden pt-28 pb-8 px-6 ${
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
          <Link
            className={getLinkClasses("/", true)}
            to="/"
            onClick={handleNavigation}
          >
            Home
          </Link>
          <Link
            className={getLinkClasses("/marcas", true)}
            to="/marcas"
            onClick={handleNavigation}
          >
            Marcas
          </Link>
          <Link
            className={getLinkClasses("/sobre-nos", true)}
            to="/sobre-nos"
            onClick={handleNavigation}
          >
            Sobre Nós
          </Link>
          <Link
            className={getLinkClasses("/folhetos", true)}
            to="/folhetos"
            onClick={handleNavigation}
          >
            Folhetos
          </Link>
        </div>

        <div
          className={`w-full mt-8 transition-transform duration-500 delay-200 ${
            isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-sm">
            <span className="text-gray-500 text-sm font-semibold mb-1">
              Apoio ao Cliente
            </span>
            <span className="font-black text-brand-blue text-2xl tracking-tight mb-1">
              +351 275 322 030
            </span>
            <span className="text-xs text-gray-400 font-medium text-center">
              (Chamada para rede fixa nacional)
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
