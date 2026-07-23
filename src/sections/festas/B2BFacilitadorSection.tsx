import { motion } from 'framer-motion';

export interface B2BFacilitadorSectionProps {
  isSubmitting: boolean;
  isSubmitted: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function B2BFacilitadorSection({ isSubmitting, isSubmitted, onSubmit }: B2BFacilitadorSectionProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black text-secondary mb-6">Traga a Sua <span className="text-accent">Família</span> ou Grupo</h2>
            <p className="text-lg text-secondary/80 leading-relaxed mb-6">
              Procura uma atividade em família diferente, ou precisa de um espaço em total exclusividade para um evento de grandes dimensões? Nós facilitamos.
            </p>
            <p className="text-lg text-secondary/80 leading-relaxed mb-8">
              O Leni's FunPark disponibiliza condições exclusivas para encerramento de espaço, adequando-se a famílias, associações desportivas e grandes ajuntamentos superiores a 20 pessoas. Garantimos catering à medida e total apoio da nossa equipa de coordenação.
            </p>
            
            <div className="bg-surface-alt p-6 rounded-2xl border-l-4 border-accent">
              <p className="font-bold text-secondary text-lg">💡 Planeamento Rápido</p>
              <p className="text-secondary/80 mt-2">Deixe-nos as informações base e a nossa equipa de gestão enviará uma proposta no prazo máximo de 48 horas.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-2xl border-4 border-surface-alt">
            <h3 className="text-2xl font-black text-secondary mb-8">Pedido de Orçamento</h3>
            
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Nome do Responsável *</label>
                  <input name="responsible_name" required type="text" className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Entidade / Empresa *</label>
                  <input name="company_name" required type="text" className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Email *</label>
                  <input name="client_email" required type="email" className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Telemóvel *</label>
                  <input name="client_phone" required type="tel" className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Data Prevista *</label>
                  <input name="target_date" required type="date" className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Nº Estimado de Pessoas *</label>
                  <select name="estimated_participants" required defaultValue="" className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors">
                    <option value="" disabled>Selecione um intervalo...</option>
                    <option value="20-50">20 a 50 pessoas</option>
                    <option value="51-100">51 a 100 pessoas</option>
                    <option value="100+">Mais de 100 pessoas (Exclusividade)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Observações / Requisitos Especiais</label>
                <textarea name="observations" rows={4} className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors resize-none"></textarea>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitted || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  isSubmitted 
                    ? 'bg-primary text-white cursor-not-allowed' 
                    : (isSubmitting ? 'bg-secondary/50 text-white cursor-not-allowed' : 'bg-accent text-white hover:bg-accent-dark')
                }`}
              >
                {isSubmitted ? 'Pedido Enviado!' : (isSubmitting ? 'A enviar...' : 'Pedir Orçamento')}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
