import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Coluna 1: Marca */}
          <div>
            <div className="flex items-center mb-6">
              <img
                src="/logos/Logo-sem_fundo2.png"
                alt="Leni's FunPark"
                className="h-16 object-contain origin-left scale-190"
              />
            </div>
            <p className="text-surface-alt mb-4">
              O 1º Parque de Diversão Indoor na Covilhã!
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/lenisfunpark?igsh=aXB2cnU2bTJuNGh4"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-tr hover:from-[#fdf497] hover:via-[#fd5949] hover:to-[#d6249f] transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/1H7NfeWnQE/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-[#1877F2] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Coluna 2: Contactos & Morada */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contactos</h3>
            <ul className="space-y-4 text-surface-alt">
              <li className="flex items-start">
                <MapPin className="text-primary mr-3 mt-1 shrink-0" size={20} />
                <span>
                  Zona Industrial do Tortosendo lt.23B Rua F, 6200-823
                  Tortosendo
                </span>
              </li>
              <li className="flex items-start">
                <Phone className="text-primary mr-3 mt-1 shrink-0" size={20} />
                <a href="tel:+351920259886" className="hover:text-primary transition-colors">
                  Telemóvel/WhatsApp: (+351) 920 259 886
                </a>
              </li>
              <li className="flex items-start">
                <Mail className="text-primary mr-3 mt-1 shrink-0" size={20} />
                <a href="mailto:pereira.garcia2025@gmail.com" className="hover:text-primary transition-colors break-all">
                  pereira.garcia2025@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Horários */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Horários</h3>
            <ul className="space-y-4 text-surface-alt">
              <li className="flex items-start">
                <Clock className="text-primary mr-3 mt-1 shrink-0" size={20} />
                <div>
                  <p>Segunda-feira: Encerrados</p>
                  <p>3ª feira a 6ª feira: 14h às 20h</p>
                  <p>Sáb., dom. e feriados: 10h às 20h</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Termos Legais */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Informações</h3>
            <ul className="space-y-3 text-surface-alt">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Termos e Condições
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Livro de Reclamações Eletrónico
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-surface-alt/80 text-sm mb-4 md:mb-0">
            &copy; 2026 Leni's FunPark.
          </p>
          <Link
            to="/admin/login"
            className="text-xs text-surface-alt/60 hover:text-surface-alt transition-colors"
          >
            Área Reservada Staff
          </Link>
        </div>
      </div>
    </footer>
  );
}
