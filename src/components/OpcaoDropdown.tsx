import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

interface OpcaoDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Dropdown estilizado (listbox acessível) para substituir o <select> nativo. */
export default function OpcaoDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecione uma opção",
}: OpcaoDropdownProps) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const selecionada = options.find((o) => o.value === value);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: PointerEvent) => {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fechar);
    return () => document.removeEventListener("pointerdown", fechar);
  }, [aberto]);

  useEffect(() => {
    if (aberto) listaRef.current?.focus();
  }, [aberto]);

  const abrir = () => {
    setAtivo(Math.max(0, options.findIndex((o) => o.value === value)));
    setAberto(true);
  };

  const escolher = (novo: string) => {
    onChange(novo);
    setAberto(false);
    botaoRef.current?.focus();
  };

  const onKeyDownBotao = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      abrir();
    }
  };

  const onKeyDownLista = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setAtivo((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setAtivo((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setAtivo(0);
        break;
      case "End":
        e.preventDefault();
        setAtivo(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        escolher(options[ativo].value);
        break;
      case "Escape":
        e.preventDefault();
        setAberto(false);
        botaoRef.current?.focus();
        break;
      case "Tab":
        setAberto(false);
        break;
    }
  };

  return (
    <div ref={raizRef} className="relative">
      <label
        id={`${id}-label`}
        className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2"
      >
        {label}
      </label>
      <button
        ref={botaoRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-labelledby={`${id}-label ${id}-valor`}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={onKeyDownBotao}
        className={`w-full flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-bold outline-none transition-all cursor-pointer ${
          aberto
            ? "bg-white border-pink-400 ring-4 ring-pink-400/15"
            : selecionada
              ? "bg-pink-50/60 border-pink-200 hover:border-pink-300"
              : "bg-surface-alt/70 border-surface hover:bg-surface-alt"
        } focus-visible:border-pink-400 focus-visible:ring-4 focus-visible:ring-pink-400/15`}
      >
        <span
          id={`${id}-valor`}
          className={selecionada ? "text-secondary" : "text-secondary/40"}
        >
          {selecionada?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
            aberto ? "rotate-180 text-pink-500" : "text-secondary/50"
          }`}
        />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.ul
            ref={listaRef}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            aria-activedescendant={`${id}-opcao-${ativo}`}
            onKeyDown={onKeyDownLista}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border-2 border-pink-100 bg-white p-1.5 shadow-xl outline-none origin-top"
          >
            {options.map((opcao, i) => {
              const escolhida = opcao.value === value;
              return (
                <li
                  key={opcao.value}
                  id={`${id}-opcao-${i}`}
                  role="option"
                  aria-selected={escolhida}
                  onPointerEnter={() => setAtivo(i)}
                  onClick={() => escolher(opcao.value)}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold cursor-pointer transition-colors ${
                    escolhida
                      ? "bg-pink-500 text-white"
                      : i === ativo
                        ? "bg-pink-100 text-pink-950"
                        : "text-secondary"
                  }`}
                >
                  {opcao.label}
                  {escolhida && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
