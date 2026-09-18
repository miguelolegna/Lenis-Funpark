import { motion } from 'framer-motion';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

export default function TermosCondicoes() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="py-12 md:py-20 bg-surface min-h-screen"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-secondary/70 hover:text-primary font-bold mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-surface-alt space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-surface-alt">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">
                Termos e Condições
              </h1>
              <p className="text-sm font-semibold text-secondary/60 mt-1">
                Última atualização: Setembro de 2026 | Leni's FunPark
              </p>
            </div>
          </div>

          <div className="space-y-6 text-secondary/85 leading-relaxed font-medium">
            <section>
              <h2 className="text-xl font-black text-secondary mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao aceder a este website, efetuar uma reserva ou utilizar as instalações do <strong>Leni's FunPark</strong>, o utilizador concorda expressamente em cumprir os presentes Termos e Condições, bem como com o Regulamento Interno do parque.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">2. Regras de Utilização do Parque</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Peúgas Antiderrapantes Obrigatórias:</strong> Por razões de higiene e segurança, o uso de peúgas antiderrapantes é obrigatório para todas as crianças e adultos que acedam às zonas de brincadeira e trampolins.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Supervisão dos Adultos:</strong> Os adultos/responsáveis devem manter a supervisão adequada das crianças a seu cargo durante todo o período de permanência no parque.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Segurança e Comportamento:</strong> É expressamente proibido correr com comida ou bebida nas zonas de diversão, empurrar ou adotar comportamentos que coloquem em risco a integridade física própria ou de terceiros.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">3. Reservas e Pagamentos de Caução</h2>
              <p className="mb-2">As reservas de festas de aniversário e eventos realizam-se mediante o seguinte processo:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>O envio do pedido de reserva através da plataforma constitui uma pré-reserva sujeita a confirmação de disponibilidade por parte da equipa do parque.</li>
                <li>Para confirmação definitiva da reserva, é necessário o pagamento da caução estipulada no prazo máximo de <strong>24 horas</strong> após o contacto da nossa equipa.</li>
                <li>Em caso de não pagamento da caução no prazo estipulado, a data e horário pretendidos ficarão novamente disponíveis para outros clientes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">4. Veracidade das Informações</h2>
              <p>
                O cliente garante que todas as informações prestadas nos formulários do website (nome, contactos, número de participantes e dados dos aniversariantes) são verdadeiras, exatas e atualizadas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">5. Alterações e Cancelamentos</h2>
              <p>
                Qualquer pedido de alteração de data ou cancelamento de reserva deve ser comunicado à equipa do Leni's FunPark com a antecedência mínima fixada no ato da confirmação da reserva.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">6. Contactos Legais</h2>
              <p>
                Para esclarecimento de qualquer questão relacionada com os presentes Termos e Condições, pode contactar-nos através do email{' '}
                <a href="mailto:pereira.garcia2025@gmail.com" className="text-primary underline hover:text-secondary font-bold">
                  pereira.garcia2025@gmail.com
                </a>{' '}
                ou do telemóvel <strong>(+351) 920 259 886</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
