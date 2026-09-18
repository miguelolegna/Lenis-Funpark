import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

export default function PoliticaPrivacidade() {
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
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">
                Política de Privacidade
              </h1>
              <p className="text-sm font-semibold text-secondary/60 mt-1">
                Última atualização: Setembro de 2026 | Leni's FunPark
              </p>
            </div>
          </div>

          <div className="space-y-6 text-secondary/85 leading-relaxed font-medium">
            <section>
              <h2 className="text-xl font-black text-secondary mb-3">1. Introdução</h2>
              <p>
                O <strong>Leni's FunPark</strong> (operado por Pereira & Garcia, Lda.) valoriza e respeita a privacidade de todos os seus visitantes, clientes e utilizadores do nosso website. Esta Política de Privacidade descreve como recolhemos, utilizamos, armazenamos e protegemos os seus dados pessoais em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento UE 2016/679) e demais legislação aplicável.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">2. Dados Pessoais Recolhidos</h2>
              <p className="mb-2">Recolhemos apenas os dados estritamente necessários para a prestação dos nossos serviços:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Reservas de Festas e Atividades:</strong> Nome do responsável, número de telemóvel, endereço de email, nome e idade do aniversariante/participantes e detalhes específicos do evento.</li>
                <li><strong>Formulários de Contacto e Orçamentos:</strong> Nome, email, número de telefone, entidade/empresa e mensagem/assunto enviado.</li>
                <li><strong>Dados de Navegação:</strong> Informações técnicas anonimizadas para otimização da experiência no website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">3. Finalidade do Tratamento dos Dados</h2>
              <p className="mb-2">Os dados recolhidos destinam-se exclusivamente às seguintes finalidades:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestão, agendamento e confirmação de reservas de festas de aniversário e eventos de grupo;</li>
                <li>Resposta a pedidos de contacto, pedidos de orçamento ou esclarecimento de dúvidas;</li>
                <li>Comunicação de informações relevantes sobre a sua reserva (instruções de pagamento de caução, horários, etc.);</li>
                <li>Cumprimento de obrigações legais e fiscais.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">4. Conservação dos Dados</h2>
              <p>
                Os seus dados pessoais são mantidos apenas pelo período necessário para cumprir as finalidades para as quais foram recolhidos ou para satisfazer exigências legais e fiscais aplicáveis. Após esse período, os dados serão eliminados de forma segura ou anonimizados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">5. Partilha de Dados com Terceiros</h2>
              <p>
                O Leni's FunPark <strong>não vende, aluga ou cede</strong> dados pessoais a terceiros para fins de marketing. Os dados poderão ser partilhados apenas com prestadores de serviços de confiança estritamente necessários para o funcionamento da plataforma (como alojamento do site, serviço de envio de email transactional ou plataformas de gestão de dados com garantias de segurança RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">6. Direitos dos Titulares dos Dados</h2>
              <p className="mb-2">Nos termos do RGPD, tem o direito de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Solicitar o acesso aos seus dados pessoais guardados por nós;</li>
                <li>Solicitar a retificação de dados incorretos ou incompletos;</li>
                <li>Solicitar o apagamento dos seus dados pessoais ("direito ao esquecimento");</li>
                <li>Solicitar a limitação ou opor-se ao tratamento dos seus dados;</li>
                <li>Retirar o consentimento a qualquer momento.</li>
              </ul>
              <p className="mt-3">
                Para exercer qualquer um destes direitos, contacte-nos através do email{' '}
                <a href="mailto:pereira.garcia2025@gmail.com" className="text-primary underline hover:text-secondary font-bold">
                  pereira.garcia2025@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-secondary mb-3">7. Contactos e Responsável pelo Tratamento</h2>
              <div className="bg-surface-alt p-6 rounded-2xl border border-surface space-y-3 font-semibold text-sm">
                <p className="font-bold text-base text-secondary">Leni's FunPark - Pereira & Garcia, Lda.</p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  Zona Industrial do Tortosendo lt.23B Rua F, 6200-823 Tortosendo
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  (+351) 920 259 886
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  pereira.garcia2025@gmail.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
