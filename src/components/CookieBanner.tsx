import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useCookieConsent } from "../lib/cookieConsent";

const botaoPrincipal =
  "flex-1 px-4 py-3 rounded-xl text-sm font-black transition-colors cursor-pointer bg-primary text-white hover:bg-secondary";
const botaoSecundario =
  "flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer border-2 border-secondary/20 text-secondary hover:bg-surface-alt";

function Interruptor({ ligado, bloqueado, onChange, label }: {
  ligado: boolean;
  bloqueado?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={label}
      disabled={bloqueado}
      onClick={() => onChange?.(!ligado)}
      className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${
        ligado ? "bg-primary" : "bg-secondary/25"
      } ${bloqueado ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          ligado ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function PainelPreferencias() {
  const { externos, guardar, fecharPainel } = useCookieConsent();
  const [externosLocal, setExternosLocal] = useState(externos);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && fecharPainel();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [fecharPainel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-secondary/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={fecharPainel}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookies-titulo"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 id="cookies-titulo" className="text-xl font-black text-secondary">
            Preferências de cookies
          </h2>
          <button
            type="button"
            onClick={fecharPainel}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-secondary/60 hover:bg-surface-alt cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-secondary/70 font-medium mb-6">
          Escolha que conteúdos autoriza. Pode mudar de ideias a qualquer momento.
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-surface-alt/60 border border-surface-alt flex items-start justify-between gap-4">
            <div>
              <p className="font-black text-secondary text-sm">
                Essenciais <span className="text-xs font-bold text-primary ml-1">Sempre ativos</span>
              </p>
              <p className="text-xs text-secondary/70 font-medium mt-1">
                Necessários para o site funcionar: guardam as suas escolhas durante a reserva e as suas
                preferências de cookies. Não podem ser desativados.
              </p>
            </div>
            <Interruptor ligado bloqueado label="Essenciais (sempre ativos)" />
          </div>

          <div className="p-4 rounded-2xl bg-surface-alt/60 border border-surface-alt flex items-start justify-between gap-4">
            <div>
              <p className="font-black text-secondary text-sm">Conteúdos externos</p>
              <p className="text-xs text-secondary/70 font-medium mt-1">
                Mostra o mapa da nossa localização através do Google Maps. A Google pode instalar cookies e
                recolher o seu endereço IP.
              </p>
            </div>
            <Interruptor ligado={externosLocal} onChange={setExternosLocal} label="Conteúdos externos" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" onClick={() => guardar(externosLocal)} className={botaoPrincipal}>
            Guardar preferências
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => guardar(true)} className={botaoSecundario}>
            Aceitar todos
          </button>
          <button type="button" onClick={() => guardar(false)} className={botaoSecundario}>
            Rejeitar todos
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CookieBanner() {
  const { mostrarBanner, painelAberto, guardar, fecharBanner, abrirPainel } = useCookieConsent();

  return (
    <>
      <AnimatePresence>
        {mostrarBanner && (
          <motion.div
            role="region"
            aria-label="Aviso de cookies"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-[80] p-3 sm:p-4 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-surface-alt p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-black text-secondary">Usamos cookies?</p>
                    <button
                      type="button"
                      onClick={fecharBanner}
                      aria-label="Fechar aviso de cookies"
                      className="w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center text-secondary/50 hover:bg-surface-alt cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-secondary/75 font-medium mt-1 leading-relaxed">
                    Usamos apenas o armazenamento necessário para o site funcionar. Com a sua autorização,
                    carregamos também o mapa do Google Maps, que pode instalar cookies da Google. Pode alterar a sua
                    escolha a qualquer momento em "Gerir cookies", no rodapé.{" "}
                    <Link to="/politica-cookies" className="text-primary font-bold underline hover:text-secondary">
                      Política de Cookies
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
                <button type="button" onClick={abrirPainel} className={`${botaoSecundario} border-transparent underline`}>
                  Personalizar
                </button>
                <button type="button" onClick={() => guardar(false)} className={botaoPrincipal}>
                  Rejeitar
                </button>
                <button type="button" onClick={() => guardar(true)} className={botaoPrincipal}>
                  Aceitar todos
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{painelAberto && <PainelPreferencias />}</AnimatePresence>
    </>
  );
}
