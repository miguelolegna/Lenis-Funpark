import { ClipboardList } from 'lucide-react';
import LegalPage, { Seccao, Lista } from '../components/LegalPage';

export default function Regulamento() {
  return (
    <LegalPage
      titulo="Regulamento Interno"
      descricao="Regras de segurança, conduta e utilização das atrações do Leni's FunPark."
      url="/regulamento"
      icon={ClipboardList}
    >
      <Seccao titulo="Segurança em primeiro lugar">
        <Lista
          itens={[
            'As crianças com idade igual ou inferior a 4 anos têm de ser acompanhadas por um adulto responsável durante toda a permanência no parque.',
            'Crianças ou adultos com necessidades especiais devem ser sempre acompanhados pelo adulto responsável.',
            'Siga sempre as orientações dos monitores e a sinalização do parque.',
            <>
              É obrigatório o uso de <strong>meias antiderrapantes</strong> em todo o espaço indoor, para adultos e
              crianças. Pode trazê-las ou adquiri-las na receção.
            </>,
            'Comportamento violento, saltos perigosos ou empurrões não são tolerados e podem resultar na expulsão do visitante, sem reembolso.',
            'Aconselha-se roupa confortável ou desportiva. Acessórios que ponham em causa a segurança (colares, relógios, anéis, cintos, bandoletes, etc.) são desaconselhados, e o parque não se responsabiliza pela sua perda nem pelos danos que causem.',
            'Evite trazer objetos pontiagudos, duros ou que possam danificar os insufláveis ou ferir outros visitantes.',
            'Não é permitido escalar por fora das atrações nem ultrapassar barreiras de segurança.',
          ]}
        />
      </Seccao>

      <Seccao titulo="Pertences pessoais">
        <Lista
          itens={[
            'O parque não se responsabiliza por objetos perdidos ou danificados.',
            'Evite trazer objetos de valor e use os cacifos disponíveis.',
            'É proibido usar telemóveis e câmaras durante as atrações em movimento.',
          ]}
        />
      </Seccao>

      <Seccao titulo="Uso das atrações">
        <Lista
          itens={[
            'Alguns equipamentos têm limites de peso, altura ou idade e só podem ser usados por quem os cumprir.',
            'A entrada nas atrações faz-se apenas pelos locais indicados.',
            'Espere pela sua vez de forma ordenada e respeitosa.',
            'Não é permitido levar alimentos, bebidas ou objetos pessoais para dentro das atrações.',
            'Respeite o tempo máximo de utilização de cada atração, para que todos possam brincar.',
          ]}
        />
      </Seccao>

      <Seccao titulo="Conduta e comportamento">
        <Lista
          itens={[
            'Não é permitido fumar dentro do parque.',
            'Não é permitido fotografar ou filmar outras pessoas sem autorização.',
            'Qualquer atitude desrespeitosa ou agressiva resulta na retirada do visitante, sem reembolso.',
            'Danos intencionais ao património do parque são cobrados na totalidade ao responsável.',
          ]}
        />
      </Seccao>

      <Seccao titulo="Horário de funcionamento">
        <Lista
          itens={[
            'Respeite o horário de abertura e encerramento.',
            'A última entrada é 1 hora antes do encerramento.',
            'Por manutenção ou lotação, o acesso a algumas atrações pode ser temporariamente suspenso.',
          ]}
        />
      </Seccao>
    </LegalPage>
  );
}
