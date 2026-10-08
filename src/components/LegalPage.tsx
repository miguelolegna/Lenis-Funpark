import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

// Layout comum das páginas legais (Privacidade, Cookies, Termos, Regulamento)
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

interface LegalPageProps {
  titulo: string;
  descricao: string;
  url: string;
  icon: LucideIcon;
  corIcone?: 'primary' | 'accent';
  ultimaAtualizacao?: string;
  children: ReactNode;
}

export default function LegalPage({
  titulo,
  descricao,
  url,
  icon: Icon,
  corIcone = 'primary',
  ultimaAtualizacao,
  children
}: LegalPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="py-12 md:py-20 bg-surface min-h-screen"
    >
      <SEO title={`${titulo} | Leni's FunPark`} description={descricao} url={`https://lenisfunpark.com${url}`} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-secondary/70 hover:text-primary font-bold mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>

        <div className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-xl border border-surface-alt space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-surface-alt">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                corIcone === 'accent' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
              }`}
            >
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">{titulo}</h1>
              <p className="text-sm font-semibold text-secondary/60 mt-1">
                {ultimaAtualizacao ? `Última atualização: ${ultimaAtualizacao} | ` : ''}Leni's FunPark
              </p>
            </div>
          </div>

          <div className="space-y-8 text-secondary/85 leading-relaxed font-medium">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function Seccao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black text-secondary">{titulo}</h2>
      {children}
    </section>
  );
}

export function Lista({ itens }: { itens: ReactNode[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2">
      {itens.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// Tabela em ecrãs largos; no telemóvel cada linha passa a cartão
export function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: ReactNode[][] }) {
  return (
    <>
      <div className="sm:hidden space-y-3">
        {linhas.map((linha, i) => (
          <dl key={i} className="rounded-2xl border border-surface-alt bg-surface-alt/40 p-4 space-y-2 text-sm">
            {linha.map((celula, j) => (
              <div key={j}>
                <dt className="text-xs font-black uppercase tracking-wider text-secondary/50">{cabecalho[j]}</dt>
                <dd className={j === 0 ? 'font-bold text-secondary' : ''}>{celula}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-surface-alt">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-alt text-secondary">
            <tr>
              {cabecalho.map((c) => (
                <th key={c} className="px-4 py-3 font-black whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-alt">
            {linhas.map((linha, i) => (
              <tr key={i} className="align-top">
                {linha.map((celula, j) => (
                  <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-bold text-secondary' : ''}`}>
                    {celula}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function LinkExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline hover:text-secondary font-bold">
      {children}
    </a>
  );
}

export function LinkInterno({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-primary underline hover:text-secondary font-bold">
      {children}
    </Link>
  );
}
