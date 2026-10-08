import { Cookie } from 'lucide-react';
import LegalPage, { Seccao, Tabela, LinkExterno, LinkInterno } from '../components/LegalPage';
import { useCookieConsent } from '../lib/cookieConsent';

export default function PoliticaCookies() {
  const { abrirPainel } = useCookieConsent();

  return (
    <LegalPage
      titulo="Política de Cookies"
      descricao="Que cookies e armazenamento local o site do Leni's FunPark usa e como pode alterar a sua escolha."
      url="/politica-cookies"
      icon={Cookie}
      ultimaAtualizacao="outubro de 2026"
    >
      <Seccao titulo="1. O nosso site não usa cookies de publicidade nem de estatística">
        <p>
          Não usamos Google Analytics, pixéis de redes sociais nem qualquer ferramenta de rastreamento. O único conteúdo
          de terceiros é o mapa do Google Maps, que só carrega com a sua autorização, dada no banner de cookies.
        </p>
      </Seccao>

      <Seccao titulo="2. Armazenamento técnico necessário">
        <p>
          Para o site funcionar, guardamos algumas informações no armazenamento local do seu browser (localStorage). São
          estritamente necessárias e, nos termos do artigo 5.º da Lei n.º 41/2004, não exigem consentimento.
        </p>
        <Tabela
          cabecalho={['Nome', 'Para que serve', 'Duração']}
          linhas={[
            [
              'Preferências de cookies',
              'Guarda a escolha que fez no banner, para não lhe perguntarmos em cada visita',
              '12 meses',
            ],
            [
              'Estado do pagamento da reserva',
              'Lembra o método de pagamento da caução que escolheu durante a reserva',
              'Até limpar os dados do browser',
            ],
            [
              'Sessão de administração',
              'Mantém a sessão iniciada da equipa do parque (não se aplica a visitantes)',
              'Até terminar a sessão',
            ],
          ]}
        />
        <p>Estes dados ficam apenas no seu dispositivo e não são partilhados com terceiros.</p>
      </Seccao>

      <Seccao titulo="3. Mapa do Google">
        <p>
          Mostramos a nossa localização através do Google Maps (categoria "Conteúdos externos"). O mapa só é carregado
          se aceitar esta categoria no banner ou clicar em "Mostrar mapa". Nesse momento, a Google pode instalar cookies
          e recolher o seu endereço IP, de acordo com a{' '}
          <LinkExterno href="https://policies.google.com/privacy">política de privacidade da Google</LinkExterno>. Sem a
          sua autorização, nenhuma informação é enviada à Google.
        </p>
      </Seccao>

      <Seccao titulo="4. Como alterar a sua escolha">
        <p>
          Pode alterar ou retirar o seu consentimento a qualquer momento no botão{' '}
          <button
            type="button"
            onClick={abrirPainel}
            className="text-primary underline hover:text-secondary font-bold cursor-pointer"
          >
            "Gerir cookies"
          </button>
          , no rodapé do site. Pode também apagar o armazenamento local e os cookies nas definições do seu browser; se o
          fizer durante uma reserva, poderá ter de voltar a escolher o método de pagamento.
        </p>
      </Seccao>

      <Seccao titulo="5. Contacto">
        <p>
          Para qualquer dúvida:{' '}
          <a
            href="mailto:pereira.garcia2025@gmail.com"
            className="text-primary underline hover:text-secondary font-bold"
          >
            pereira.garcia2025@gmail.com
          </a>
          . Mais informação na nossa <LinkInterno to="/politica-privacidade">Política de Privacidade</LinkInterno>.
        </p>
      </Seccao>
    </LegalPage>
  );
}
