
import { Link } from 'react-router-dom';
import { PartyPopper, MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Coluna 1: Marca */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center rotate-3">
                <PartyPopper className="text-white" />
              </div>
              <span className="ml-3 font-black text-2xl text-white">Leni's <span className="text-accent">FunPark</span></span>
            </div>
            <p className="text-gray-300">
              O 1º Parque de Diversão Indoor na Covilhã!
            </p>
          </div>

          {/* Coluna 2: Contactos & Morada */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contactos</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <MapPin className="text-primary mr-3 mt-1 shrink-0" size={20} />
                <span>Zona Industrial do Tortosendo lt.23B Rua F, 6200-823 Tortosendo</span>
              </li>
              <li className="flex items-start">
                <Phone className="text-primary mr-3 mt-1 shrink-0" size={20} />
                <span>Telemóvel/WhatsApp: 920 259 886</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Horários */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Horários</h3>
            <ul className="space-y-4 text-gray-300">
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
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Política de Cookies</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos e Condições</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Livro de Reclamações Eletrónico</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; 2026 Leni's FunPark.
          </p>
          <Link 
            to="/admin/login" 
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Área Reservada Staff
          </Link>
        </div>
      </div>
    </footer>
  );
}
