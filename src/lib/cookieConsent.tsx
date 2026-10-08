import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// Consentimento de cookies: "essenciais" estão sempre ativos; "externos" (Google Maps) só com autorização.
// Se a Política de Cookies mudar, sobe a versão para o banner voltar a aparecer.
const CHAVE = "lfp_cookie_consent";
const VERSAO = "2026-10";
const VALIDADE_MS = 365 * 24 * 60 * 60 * 1000; // 12 meses

interface EscolhaGuardada {
  externos: boolean;
  data: string;
  versao: string;
}

interface CookieConsentContexto {
  externos: boolean;
  // true quando ainda não há escolha válida e o banner não foi fechado nesta visita
  mostrarBanner: boolean;
  painelAberto: boolean;
  guardar: (externos: boolean) => void;
  fecharBanner: () => void;
  abrirPainel: () => void;
  fecharPainel: () => void;
}

const Contexto = createContext<CookieConsentContexto | null>(null);

function lerEscolha(): EscolhaGuardada | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const escolha = JSON.parse(bruto) as EscolhaGuardada;
    const idade = Date.now() - new Date(escolha.data).getTime();
    if (escolha.versao !== VERSAO || !(idade >= 0 && idade < VALIDADE_MS)) return null;
    return escolha;
  } catch {
    return null;
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [escolha, setEscolha] = useState<EscolhaGuardada | null>(lerEscolha);
  const [bannerFechado, setBannerFechado] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);

  const guardar = useCallback((externos: boolean) => {
    const nova: EscolhaGuardada = { externos, data: new Date().toISOString(), versao: VERSAO };
    try {
      localStorage.setItem(CHAVE, JSON.stringify(nova));
    } catch {
      // Sem armazenamento (ex.: modo privado): a escolha vale só para esta visita
    }
    setEscolha(nova);
    setPainelAberto(false);
  }, []);

  const valor = useMemo<CookieConsentContexto>(
    () => ({
      externos: escolha?.externos ?? false,
      mostrarBanner: !escolha && !bannerFechado && !painelAberto,
      painelAberto,
      guardar,
      // Fechar sem escolher conta como "Rejeitar" nesta visita, sem guardar nada
      fecharBanner: () => setBannerFechado(true),
      abrirPainel: () => setPainelAberto(true),
      fecharPainel: () => {
        setPainelAberto(false);
        setBannerFechado(true);
      },
    }),
    [escolha, bannerFechado, painelAberto, guardar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCookieConsent() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useCookieConsent tem de estar dentro de CookieConsentProvider");
  return contexto;
}
