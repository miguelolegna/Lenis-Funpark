import { FileText } from 'lucide-react';
import LegalPage, { Seccao, Lista, Tabela, LinkExterno, LinkInterno } from '../components/LegalPage';

export default function TermosCondicoes() {
  return (
    <LegalPage
      titulo="Termos e Condições"
      descricao="Condições de reserva, caução, cancelamento e utilização do Leni's FunPark para festas de aniversário e eventos."
      url="/termos-condicoes"
      icon={FileText}
      corIcone="accent"
      ultimaAtualizacao="outubro de 2026"
    >
      <Seccao titulo="1. Identificação">
        <p>
          O Leni's FunPark é explorado pela Pereira &amp; Garcia, Lda., NIPC 518532372, com sede na Zona Industrial do
          Tortosendo, lt. 23B, Rua F, 6200-823 Tortosendo. Contactos:{' '}
          <a
            href="mailto:pereira.garcia2025@gmail.com"
            className="text-primary underline hover:text-secondary font-bold"
          >
            pereira.garcia2025@gmail.com
          </a>{' '}
          · (+351) 920 259 886.
        </p>
      </Seccao>

      <Seccao titulo="2. Âmbito">
        <p>
          Estes termos aplicam-se à utilização do website e às reservas de festas de aniversário e eventos. A utilização
          do parque rege-se também pelo <LinkInterno to="/regulamento">Regulamento Interno</LinkInterno>.
        </p>
      </Seccao>

      <Seccao titulo="3. Reservas">
        <Lista
          itens={[
            'O pedido feito no site é uma pré-reserva, sujeita à disponibilidade do espaço.',
            'A nossa equipa contacta-o para confirmar os detalhes.',
            <>
              A reserva só fica confirmada após o pagamento de uma <strong>caução de 50 €</strong>, no prazo de 24 horas
              após esse contacto, por MB WAY, transferência bancária ou em dinheiro na receção.
            </>,
            <>
              No caso de pagamento da caução por MB WAY ou transferência bancária, é{' '}
              <strong>
                obrigatório o envio do comprovativo via WhatsApp com a indicação expressa do dia e hora da festa
              </strong>{' '}
              para que a reserva seja identificada e confirmada.
            </>,
            'Sem pagamento da caução nesse prazo, a data volta a ficar disponível.',
          ]}
        />
      </Seccao>

      <Seccao titulo="4. Caução">
        <p>
          A caução garante a reserva e eventuais danos. É acertada no final da festa e descontada no valor total, desde
          que não haja danos nas instalações nem incumprimento destas condições.
        </p>
      </Seccao>

      <Seccao titulo="5. Cancelamentos e alterações">
        <Tabela
          cabecalho={['Situação', 'O que acontece']}
          linhas={[
            ['Cliente cancela até 7 dias antes da festa', 'Caução devolvida na totalidade'],
            ['Cliente cancela a menos de 7 dias da festa', 'Caução não é devolvida'],
            ['Cliente pede alteração de data', 'Possível a qualquer momento, se houver vaga na nova data'],
            [
              'Parque cancela por motivo que lhe seja imputável',
              'Proposta de nova data ou devolução integral da caução, à escolha do cliente',
            ],
          ]}
        />
        <p>Cancelamentos e pedidos de alteração devem ser feitos por email ou WhatsApp, para ficarem registados.</p>
      </Seccao>

      <Seccao titulo="6. Direito de livre resolução">
        <p>
          As reservas de festas são serviços de lazer com data marcada. Por isso, não se aplica o direito de livre
          resolução de 14 dias (artigo 17.º, n.º 1, alínea l) do Decreto-Lei n.º 24/2014). Aplicam-se as regras de
          cancelamento acima.
        </p>
      </Seccao>

      <Seccao titulo="7. Condições da festa">
        <Lista
          itens={[
            'A festa dura 2 horas: 1h30 de brincadeira e 30 minutos de lanche no final.',
            'Os horários de início e fim devem ser respeitados.',
            'Mínimo de 10 e máximo de 25 crianças. Crianças adicionais precisam de autorização prévia da gerência e têm custo extra.',
            'Idade mínima: 5 anos. Crianças até aos 4 anos têm de estar acompanhadas por um adulto, com custo adicional.',
            'A presença de adultos tem custo extra.',
            'O aniversariante não paga.',
            'É permitido trazer bolo e comida para o aniversário.',
            'É obrigatório o uso de meias antiderrapantes nas áreas de jogo.',
          ]}
        />
      </Seccao>

      <Seccao titulo="8. Preços e pagamento">
        <p>
          Os preços dos packs e extras são os da tabela em vigor, comunicada no ato da reserva. O valor total da festa é
          pago no final, em numerário, Multibanco ou MB WAY, descontando a caução.
        </p>
      </Seccao>

      <Seccao titulo="9. Pack Essencial">
        <p>
          O Pack Essencial inclui apenas a entrada no parque, sem lanche. Não inclui utensílios (pratos, copos, talheres,
          toalhas ou outros materiais). A montagem, organização e limpeza da zona da festa são da responsabilidade do
          cliente, que deve deixar o espaço como o encontrou e retirar todos os resíduos e materiais.
        </p>
      </Seccao>

      <Seccao titulo="10. Danos">
        <p>
          Os danos causados nas instalações, equipamentos, brinquedos ou materiais do parque durante a festa são da
          responsabilidade do cliente. Os custos de reparação ou substituição são descontados da caução. Se o valor dos
          danos for superior, será pedido o pagamento da diferença.
        </p>
      </Seccao>

      <Seccao titulo="11. Supervisão, seguros e responsabilidade">
        <Lista
          itens={[
            'A supervisão das crianças é partilhada entre a equipa do parque e os responsáveis legais presentes.',
            'O parque tem os seguros obrigatórios por lei, incluindo responsabilidade civil e acidentes pessoais.',
            'O parque não se responsabiliza por objetos perdidos, esquecidos ou danificados.',
            'É proibido o uso de materiais perigosos ou não autorizados.',
          ]}
        />
      </Seccao>

      <Seccao titulo="12. Fotografias">
        <p>
          O parque só fotografa ou filma festas para as redes sociais com autorização prévia e escrita do responsável.
          Ver a <LinkInterno to="/politica-privacidade">Política de Privacidade</LinkInterno>.
        </p>
      </Seccao>

      <Seccao titulo="13. Veracidade dos dados">
        <p>O cliente garante que os dados indicados nos formulários são verdadeiros e atualizados.</p>
      </Seccao>

      <Seccao titulo="14. Reclamações e resolução de litígios">
        <p>
          Pode apresentar reclamação no{' '}
          <LinkExterno href="https://www.livroreclamacoes.pt/Inicio/">Livro de Reclamações Eletrónico</LinkExterno> ou no
          livro físico disponível no parque.
        </p>
        <p>
          Em caso de litígio de consumo, pode recorrer ao CNIACC – Centro Nacional de Informação e Arbitragem de
          Conflitos de Consumo (<LinkExterno href="https://www.cniacc.pt">www.cniacc.pt</LinkExterno>). Mais informação no
          Portal do Consumidor (<LinkExterno href="https://www.consumidor.gov.pt">www.consumidor.gov.pt</LinkExterno>).
        </p>
      </Seccao>

      <Seccao titulo="15. Lei aplicável">
        <p>Estes termos regem-se pela lei portuguesa.</p>
      </Seccao>
    </LegalPage>
  );
}
