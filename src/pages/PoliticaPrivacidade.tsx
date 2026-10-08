import { ShieldCheck } from 'lucide-react';
import LegalPage, { Seccao, Lista, Tabela, LinkExterno, LinkInterno } from '../components/LegalPage';

const EMAIL = 'pereira.garcia2025@gmail.com';
const linkEmail = (
  <a href={`mailto:${EMAIL}`} className="text-primary underline hover:text-secondary font-bold">
    {EMAIL}
  </a>
);

export default function PoliticaPrivacidade() {
  return (
    <LegalPage
      titulo="Política de Privacidade"
      descricao="Como o Leni's FunPark recolhe, usa e protege os seus dados pessoais, nos termos do RGPD."
      url="/politica-privacidade"
      icon={ShieldCheck}
      ultimaAtualizacao="outubro de 2026"
    >
      <Seccao titulo="1. Quem somos">
        <p>
          O responsável pelo tratamento dos seus dados é a <strong>Pereira &amp; Garcia, Lda.</strong>, que explora o
          Leni's FunPark.
        </p>
        <Lista
          itens={[
            'NIPC: 518532372',
            'Morada: Zona Industrial do Tortosendo, lt. 23B, Rua F, 6200-823 Tortosendo',
            <>Email: {linkEmail}</>,
            'Telemóvel: (+351) 920 259 886 (chamada para a rede móvel nacional)',
          ]}
        />
      </Seccao>

      <Seccao titulo="2. Que dados recolhemos e porquê">
        <Tabela
          cabecalho={['Situação', 'Dados', 'Finalidade', 'Base legal']}
          linhas={[
            [
              'Formulário de contacto',
              'Nome, email, telemóvel (se escolher contacto por WhatsApp ou chamada), assunto e mensagem',
              'Responder ao seu pedido',
              'Diligências pré-contratuais e interesse legítimo em responder a quem nos contacta',
            ],
            [
              'Pedido de reserva',
              'Nome do responsável, telemóvel, email, data e hora, idade da criança, método de pagamento da caução e observações',
              'Gerir e confirmar a reserva',
              'Execução do contrato',
            ],
            [
              'Personalização da festa',
              'Primeiro nome e idade do aniversariante, n.º de crianças, menu, bolo, decoração e notas',
              'Preparar a festa',
              'Execução do contrato',
            ],
            [
              'Convites digitais',
              'Primeiro nome e idade do aniversariante, dia, hora e contacto do responsável',
              'Criar os convites da festa',
              'Execução do contrato',
            ],
            [
              'Código de verificação',
              'Email',
              'Confirmar a sua identidade antes de aceder à reserva',
              'Interesse legítimo (segurança)',
            ],
            [
              'Fotografias e vídeos',
              'Imagem das crianças e adultos presentes',
              'Divulgação nas redes sociais do parque',
              'Consentimento',
            ],
            ['Faturação', 'Nome e NIF, se pedir fatura com NIF', 'Cumprir obrigações fiscais', 'Obrigação legal'],
          ]}
        />
        <p>
          Não usamos os seus dados para marketing nem enviamos newsletters. As mensagens que recebe são apenas sobre o
          seu pedido ou a sua reserva.
        </p>
      </Seccao>

      <Seccao titulo="3. Dados de crianças">
        <p>
          Os dados das crianças (primeiro nome e idade) são fornecidos pelo pai, mãe ou responsável legal que faz a
          reserva, e servem apenas para organizar a festa. Pedimos só o mínimo necessário.
        </p>
      </Seccao>

      <Seccao titulo="4. Informações de saúde">
        <p>
          Se indicar nas observações ou nas notas informações de saúde (por exemplo, alergias alimentares ou necessidades
          especiais), usamo-las apenas para preparar a festa em segurança, com base no seu consentimento explícito. Pode
          pedir que sejam apagadas a qualquer momento. Indique apenas o que for necessário.
        </p>
      </Seccao>

      <Seccao titulo="5. Fotografias e vídeos">
        <p>
          Só fotografamos ou filmamos crianças para publicação nas redes sociais com autorização prévia do responsável,
          dada por escrito (por exemplo, por WhatsApp ou email). Pode retirar a autorização a qualquer momento e
          removeremos as publicações em causa.
        </p>
      </Seccao>

      <Seccao titulo="6. Com quem partilhamos os dados">
        <p>
          Não vendemos nem cedemos dados a terceiros. Recorremos apenas a prestadores de serviços que tratam dados em
          nosso nome, com contrato e garantias RGPD:
        </p>
        <Tabela
          cabecalho={['Prestador', 'Serviço', 'Localização']}
          linhas={[
            ['Supabase Inc.', 'Base de dados e autenticação', 'Servidores na Irlanda (UE)'],
            ['Resend Inc.', 'Envio de emails (códigos e confirmações)', 'EUA'],
            ['Vercel Inc.', 'Alojamento do website', 'EUA e UE'],
            ['Google Ireland Ltd.', 'Mapa de localização (só se aceitar os conteúdos externos)', 'UE e EUA'],
          ]}
        />
        <p>
          As transferências para os EUA estão protegidas pelo Quadro de Privacidade de Dados UE-EUA ou por cláusulas
          contratuais-tipo aprovadas pela Comissão Europeia. Podemos ainda comunicar dados a autoridades, quando a lei o
          exija.
        </p>
      </Seccao>

      <Seccao titulo="7. Quanto tempo guardamos os dados">
        <Lista
          itens={[
            <>
              <strong>Reservas e personalização da festa:</strong> enquanto forem necessários para gerir a reserva e
              eventuais reclamações, sendo eliminados periodicamente pela nossa equipa, no máximo até 2 anos após a data
              do evento.
            </>,
            <>
              <strong>Mensagens de contacto:</strong> até o pedido estar resolvido, no máximo 1 ano.
            </>,
            <>
              <strong>Fotografias e vídeos:</strong> enquanto a autorização se mantiver.
            </>,
            <>
              <strong>Dados de faturação:</strong> 10 anos, por obrigação fiscal.
            </>,
          ]}
        />
      </Seccao>

      <Seccao titulo="8. Os seus direitos">
        <p>
          Pode, a qualquer momento, pedir o acesso, a retificação, o apagamento, a limitação ou a portabilidade dos seus
          dados, opor-se ao tratamento e retirar o consentimento que tenha dado. Basta enviar um email para {linkEmail}.
          Respondemos no prazo máximo de 1 mês.
        </p>
        <p>
          Se considerar que os seus direitos não foram respeitados, pode apresentar queixa à Comissão Nacional de
          Proteção de Dados (CNPD), em <LinkExterno href="https://www.cnpd.pt">www.cnpd.pt</LinkExterno>.
        </p>
      </Seccao>

      <Seccao titulo="9. Segurança">
        <p>
          Os dados são guardados com acesso restrito à equipa do parque. O acesso às reservas pelos clientes exige um
          link único e um código enviado por email. Não tomamos decisões automáticas nem criamos perfis com os seus
          dados.
        </p>
      </Seccao>

      <Seccao titulo="10. Cookies">
        <p>
          Saiba como usamos cookies e armazenamento local na nossa{' '}
          <LinkInterno to="/politica-cookies">Política de Cookies</LinkInterno>.
        </p>
      </Seccao>

      <Seccao titulo="11. Alterações">
        <p>Podemos atualizar esta política. A data da última atualização está sempre indicada no topo.</p>
      </Seccao>
    </LegalPage>
  );
}
