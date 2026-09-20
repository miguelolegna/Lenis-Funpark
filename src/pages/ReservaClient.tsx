import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PrivacyTermsCheckbox from "../components/PrivacyTermsCheckbox";
import {
  PartyPopper,
  Sparkles,
  CheckCircle2,
  KeyRound,
  User,
  Utensils,
  Gift,
  Palette,
  Cake,
  FileText,
  ShieldCheck,
  Download,
  Check,
  Ticket,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ReservaClient() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reservaId, setReservaId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [conviteToken, setConviteToken] = useState<string | null>(null);
  const [estadoFormulario, setEstadoFormulario] = useState<
    "a_verificar" | "aberto" | "fechado" | "invalido"
  >("a_verificar");

  useEffect(() => {
    let cancelado = false;
    const verificar = async () => {
      const { data, error } = await supabase.rpc("estado_formulario_b2c", {
        p_token_opaco: token,
      });
      if (cancelado) return;
      if (error) {
        console.error(
          "[Formulário] Erro ao verificar o estado do formulário:",
          error.code,
          error.message,
        );
        setEstadoFormulario(error.code === "22P02" ? "invalido" : "aberto");
        return;
      }
      setEstadoFormulario(
        data === "fechado" || data === "invalido" ? data : "aberto",
      );
    };
    void verificar();
    return () => {
      cancelado = true;
    };
  }, [token]);

  const [formData, setFormData] = useState({
    nome_aniversariante: "",
    idade: "",
    num_criancas: "",
    tipo_convite: "nenhum",
    tema_convite: "",
    opcao_menu: "com_menu",
    extra_pizza: false,
    extra_cachorro: false,
    extra_doces: false,
    extra_fruta: false,
    extra_gelatina: false,
    decoracao_tematica: false,
    decoracao_tema_nome: "",
    pinturas_faciais: false,
    outros_servicos: "",
    inclui_bolo: false,
    bolo_massa: "",
    bolo_recheio: "",
    bolo_cobertura: "",
    bolo_composicao: "",
    notas_adicionais: "",
    termos_veracidade: false,
    convite_token: "",
  });

  useEffect(() => {
    console.log("[STATE DEBUG] Componente montado. Step atual:", step);
  }, [step]);

  const requestOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: fnError } = await supabase.functions.invoke(
        "dispatch_b2c_otp",
        { body: { token_opaco: token } },
      );
      if (fnError) throw fnError;
      setStep(2);
      setOtp("");
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar código de acesso.");
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: reservaId, error: rpcError } = await supabase.rpc(
        "validar_otp_b2c",
        {
          p_token_opaco: token,
          p_otp_codigo: otp,
        },
      );
      if (rpcError) throw rpcError;
      if (!reservaId) throw new Error("Falha na extração do ID da reserva.");

      const { data: reservaData, error: fetchError } = await supabase.rpc(
        "obter_reserva_b2c",
        { p_token_opaco: token },
      );
      if (fetchError) throw fetchError;

      if (reservaData) {
        setConviteToken(reservaData.convite_token);
        setFormData({
          nome_aniversariante: reservaData.nome_aniversariante || "",
          idade: reservaData.idade || "",
          num_criancas: reservaData.num_criancas || "",
          tipo_convite: reservaData.tipo_convite || "nenhum",
          tema_convite: reservaData.tema_convite || "",
          opcao_menu: reservaData.opcao_menu || "com_menu",
          extra_pizza: reservaData.extra_pizza || false,
          extra_cachorro: reservaData.extra_cachorro || false,
          extra_doces: reservaData.extra_doces || false,
          extra_fruta: reservaData.extra_fruta || false,
          extra_gelatina: reservaData.extra_gelatina || false,
          decoracao_tematica: reservaData.decoracao_tematica || false,
          decoracao_tema_nome: reservaData.decoracao_tema_nome || "",
          pinturas_faciais: reservaData.pinturas_faciais || false,
          outros_servicos: reservaData.outros_servicos || "",
          inclui_bolo: reservaData.inclui_bolo || false,
          bolo_massa: reservaData.bolo_massa || "",
          bolo_recheio: reservaData.bolo_recheio || "",
          bolo_cobertura: reservaData.bolo_cobertura || "",
          bolo_composicao: reservaData.bolo_composicao || "",
          notas_adicionais: reservaData.notas_adicionais || "",
          termos_veracidade: reservaData.termos_veracidade || false,
          convite_token: reservaData.convite_token || "",
        });
      }

      setReservaId(reservaId);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Código Inválido ou Expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === "tipo_convite" && value !== "tematico")
        newState.tema_convite = "";
      if (field === "decoracao_tematica" && value === false)
        newState.decoracao_tema_nome = "";
      if (field === "inclui_bolo" && value === false)
        newState.bolo_composicao = "";
      return newState;
    });
  };

  const handleFinalSubmit = async () => {
    if (!formData.nome_aniversariante) {
      setError(
        "O Nome do Aniversariante é estritamente obrigatório para concluir.",
      );
      return;
    }
    setLoading(true);
    setError("");

    const { error: rpcError } = await supabase.rpc("selar_reserva_b2c", {
      p_token_opaco: token,
    });

    if (rpcError) {
      setError("Falha de sistema ao guardar a reserva: " + rpcError.message);
      setLoading(false);
      return;
    }

    setIsCompleted(true);
    setLoading(false);
  };

  const handleBlur = async (field: string, value: any) => {
    if (!reservaId) return;

    if (
      field === "inclui_bolo" &&
      value === true &&
      (!formData.bolo_massa || !formData.bolo_recheio || !formData.bolo_cobertura)
    ) {
      return;
    }

    const payload: Record<string, any> = { [field]: value };
    if (field === "tipo_convite" && value !== "tematico")
      payload.tema_convite = "";
    if (field === "decoracao_tematica" && value === false)
      payload.decoracao_tema_nome = "";
    if (field === "inclui_bolo" && value === false) {
      payload.bolo_massa = "";
      payload.bolo_recheio = "";
      payload.bolo_cobertura = "";
      payload.bolo_composicao = "";
    }
    if (["bolo_massa", "bolo_recheio", "bolo_cobertura", "bolo_composicao"].includes(field) && formData.inclui_bolo)
      payload.inclui_bolo = true;

    const { error: patchError } = await supabase.rpc("atualizar_reserva_b2c", {
      p_token_opaco: token,
      p_payload: payload,
    });

    if (patchError) {
      console.error(`Falha ao gravar ${field}:`, patchError);
    }
  };

  // -------------------------------------------------------------
  // ECRÃ 1: RESERVA SUBMETIDA COM SUCESSO
  // -------------------------------------------------------------
  if (isCompleted) {
    const conviteUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace(
      /\/$/,
      "",
    )}/functions/v1/convite_digital?token=${conviteToken}`;

    return (
      <div className="min-h-screen bg-surface py-20 px-4 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border-4 border-primary text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
            <Sparkles className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 mb-3">
            Formulário Concluído
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-secondary mb-4">
            Reserva Submetida!
          </h2>
          <p className="text-secondary/80 font-medium leading-relaxed mb-8">
            Os detalhes da sua festa foram gravados com sucesso. A nossa equipa
            no Leni's FunPark irá analisar as preferências da sua celebração.
          </p>

          {formData.tipo_convite === "lenis" && conviteToken && (
            <a
              href={conviteUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-secondary text-white px-6 py-4 rounded-2xl font-black text-base transition-all uppercase tracking-wide shadow-lg shadow-primary/20 mb-4"
            >
              <Download className="w-5 h-5" />
              <span>Descarregar Convite Digital</span>
            </a>
          )}

          {formData.tipo_convite === "tematico" && (
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-4 rounded-2xl text-sm font-medium mb-6 text-left flex items-start gap-3">
              <Palette className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">
                  Convite Temático ({formData.tema_convite})
                </p>
                <p className="text-xs mt-1 text-amber-800">
                  A nossa equipa de design irá preparar o convite personalizado e
                  enviá-lo por email.
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-surface-alt rounded-2xl text-xs font-bold text-secondary/60">
            Pode fechar esta página com segurança.
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ECRÃ 2: PREENCHIMENTO DOS DETALHES DA FESTA (STEP 3)
  // -------------------------------------------------------------
  if (step === 3) {
    return (
      <div className="min-h-screen bg-surface py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-3xl w-full">
          {/* Header da Página */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-3">
              <PartyPopper className="w-4 h-4" /> Personalize o Evento
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-secondary tracking-tight">
              Detalhes da <span className="text-accent">Sua Festa</span>
            </h1>
            <p className="text-secondary/70 font-medium text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Preencha as preferências de convites, menu, bolo e decoração para a celebração no Leni's FunPark.
            </p>
          </div>

          <div className="space-y-8">
            {/* Bloco 1: Aniversariante */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-surface-alt">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-alt">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    Dados do Aniversariante
                  </h3>
                  <p className="text-xs font-semibold text-secondary/50">
                    Informação principal do homenageado
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                    Primeiro Nome da Criança *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome_aniversariante}
                    onChange={(e) =>
                      handleInputChange("nome_aniversariante", e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur("nome_aniversariante", e.target.value)
                    }
                    placeholder="Ex: Gabriel"
                    className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-bold text-secondary placeholder:text-secondary/40 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                    Idade a Celebrar
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.idade}
                    onChange={(e) => handleInputChange("idade", e.target.value)}
                    onBlur={(e) => handleBlur("idade", e.target.value)}
                    placeholder="Ex: 8"
                    className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-bold text-secondary placeholder:text-secondary/40 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                    Nº Estimado de Crianças
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.num_criancas}
                    onChange={(e) =>
                      handleInputChange("num_criancas", e.target.value)
                    }
                    onBlur={(e) => handleBlur("num_criancas", e.target.value)}
                    placeholder="Ex: 15"
                    className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-bold text-secondary placeholder:text-secondary/40 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Convite Digital */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-surface-alt">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-alt">
                <div className="w-10 h-10 rounded-2xl bg-accent/15 flex items-center justify-center text-accent font-black shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    Convite Digital
                  </h3>
                  <p className="text-xs font-semibold text-secondary/50">
                    Escolha o tipo de convite para os convidados
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { id: "nenhum", label: "Sem Convite", desc: "Não necessito de convite" },
                  { id: "lenis", label: "Convite Leni's", desc: "Modelo padrão do parque" },
                  { id: "tematico", label: "Convite Temático", desc: "Design com tema à escolha" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      handleInputChange("tipo_convite", opt.id);
                      handleBlur("tipo_convite", opt.id);
                    }}
                    className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                      formData.tipo_convite === opt.id
                        ? "bg-primary/10 border-primary text-secondary shadow-md"
                        : "bg-surface-alt/60 hover:bg-surface-alt border-surface text-secondary/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm">{opt.label}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.tipo_convite === opt.id
                            ? "border-primary bg-primary text-white"
                            : "border-secondary/30 bg-white"
                        }`}
                      >
                        {formData.tipo_convite === opt.id && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-secondary/60">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {formData.tipo_convite === "tematico" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-surface-alt"
                  >
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                      Tema do Convite *
                    </label>
                    <input
                      type="text"
                      value={formData.tema_convite}
                      onChange={(e) =>
                        handleInputChange("tema_convite", e.target.value)
                      }
                      onBlur={(e) => handleBlur("tema_convite", e.target.value)}
                      placeholder="Ex: Homem-Aranha, Frozen, Minecraft, etc."
                      className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-bold text-secondary placeholder:text-secondary/40 outline-none transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bloco 3: Opção de Menu */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-surface-alt">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-alt">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 font-black shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    Opção de Menu
                  </h3>
                  <p className="text-xs font-semibold text-secondary/50">
                    Lanche e snack para as crianças
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "sem_menu",
                    title: "Sem Menu",
                    price: "11,50€ / criança",
                    desc: "Apenas lancheira base e entradas",
                  },
                  {
                    id: "com_menu",
                    title: "Com Menu Completo",
                    price: "13,50€ / criança",
                    desc: "Lanche sortido, bebidas e snacks incluídos",
                  },
                ].map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => {
                      handleInputChange("opcao_menu", menu.id);
                      handleBlur("opcao_menu", menu.id);
                    }}
                    className={`p-5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                      formData.opcao_menu === menu.id
                        ? "bg-primary/10 border-primary text-secondary shadow-md"
                        : "bg-surface-alt/60 hover:bg-surface-alt border-surface text-secondary/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-black text-base text-secondary">
                          {menu.title}
                        </h4>
                        <span className="text-xs font-extrabold text-primary">
                          {menu.price}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          formData.opcao_menu === menu.id
                            ? "border-primary bg-primary text-white"
                            : "border-secondary/30 bg-white"
                        }`}
                      >
                        {formData.opcao_menu === menu.id && (
                          <Check className="w-4 h-4 stroke-[3]" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-secondary/60 mt-1">{menu.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bloco 4: Extras de Menu */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-surface-alt">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-alt">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 font-black shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    Extras de Menu
                  </h3>
                  <p className="text-xs font-semibold text-secondary/50">
                    Reforce o lanche com snacks adicionais
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { field: "extra_pizza", name: "Pizza", price: "+1,50€ / criança" },
                  { field: "extra_cachorro", name: "Cachorro Quente", price: "+1,50€ / criança" },
                  { field: "extra_doces", name: "Doces Sortidos", price: "+1,00€ / criança" },
                  { field: "extra_fruta", name: "Prato de Fruta", price: "+1,00€ / criança" },
                  { field: "extra_gelatina", name: "Gelatina", price: "+1,00€ / criança" },
                ].map((item) => {
                  const isChecked = (formData as any)[item.field];
                  return (
                    <button
                      key={item.field}
                      type="button"
                      onClick={() => {
                        const nextVal = !isChecked;
                        handleInputChange(item.field, nextVal);
                        handleBlur(item.field, nextVal);
                      }}
                      className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs"
                          : "bg-surface-alt/60 hover:bg-surface-alt border-surface text-secondary/80"
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-sm">{item.name}</p>
                        <p className="text-[11px] font-bold text-emerald-700">
                          {item.price}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-secondary/30"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco 5: Animação & Decoração */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-surface-alt">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-alt">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 font-black shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    Animação & Decoração
                  </h3>
                  <p className="text-xs font-semibold text-secondary/50">
                    Ambiente e atividades para as crianças
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Decoração Temática */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !formData.decoracao_tematica;
                    handleInputChange("decoracao_tematica", nextVal);
                    handleBlur("decoracao_tematica", nextVal);
                  }}
                  className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                    formData.decoracao_tematica
                      ? "bg-purple-50 border-purple-300 text-purple-950 shadow-xs"
                      : "bg-surface-alt/60 hover:bg-surface-alt border-surface text-secondary/80"
                  }`}
                >
                  <span className="font-extrabold text-sm">
                    Decoração Temática da Mesa/Espaço
                  </span>
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      formData.decoracao_tematica
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white border-secondary/30"
                    }`}
                  >
                    {formData.decoracao_tematica && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {formData.decoracao_tematica && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 border-l-4 border-purple-400"
                    >
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                        Nome do Tema da Decoração
                      </label>
                      <input
                        type="text"
                        value={formData.decoracao_tema_nome}
                        onChange={(e) =>
                          handleInputChange("decoracao_tema_nome", e.target.value)
                        }
                        onBlur={(e) =>
                          handleBlur("decoracao_tema_nome", e.target.value)
                        }
                        placeholder="Ex: Safari, Dinossauros, Princesas Disney, etc."
                        className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-bold text-secondary placeholder:text-secondary/40 outline-none transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pinturas Faciais */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !formData.pinturas_faciais;
                    handleInputChange("pinturas_faciais", nextVal);
                    handleBlur("pinturas_faciais", nextVal);
                  }}
                  className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                    formData.pinturas_faciais
                      ? "bg-purple-50 border-purple-300 text-purple-950 shadow-xs"
                      : "bg-surface-alt/60 hover:bg-surface-alt border-surface text-secondary/80"
                  }`}
                >
                  <span className="font-extrabold text-sm">
                    Pinturas Faciais & Modelagem de Balões
                  </span>
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      formData.pinturas_faciais
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white border-secondary/30"
                    }`}
                  >
                    {formData.pinturas_faciais && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                </button>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                    Outros Serviços Adicionais (Pinhata, Lembranças, etc.)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.outros_servicos}
                    onChange={(e) =>
                      handleInputChange("outros_servicos", e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur("outros_servicos", e.target.value)
                    }
                    placeholder="Descreva se pretender contratar pinhata ou lembranças especiais."
                    className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Bloco 6: Bolo de Aniversário */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-surface-alt">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-alt">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/15 flex items-center justify-center text-pink-600 font-black shrink-0">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    Bolo de Aniversário
                  </h3>
                  <p className="text-xs font-semibold text-secondary/50">
                    Detalhes e composição do bolo
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !formData.inclui_bolo;
                    handleInputChange("inclui_bolo", nextVal);
                    handleBlur("inclui_bolo", nextVal);
                  }}
                  className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                    formData.inclui_bolo
                      ? "bg-pink-50 border-pink-300 text-pink-950 shadow-xs"
                      : "bg-surface-alt/60 hover:bg-surface-alt border-surface text-secondary/80"
                  }`}
                >
                  <span className="font-extrabold text-sm">
                    Incluir Bolo de Aniversário no Leni's FunPark
                  </span>
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      formData.inclui_bolo
                        ? "bg-pink-600 border-pink-600 text-white"
                        : "bg-white border-secondary/30"
                    }`}
                  >
                    {formData.inclui_bolo && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {formData.inclui_bolo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 border-l-4 border-pink-400 space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                          Massa do Bolo
                        </label>
                        <select
                          value={formData.bolo_massa}
                          onChange={(e) => handleInputChange("bolo_massa", e.target.value)}
                          onBlur={(e) => handleBlur("bolo_massa", e.target.value)}
                          className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary outline-none transition-all cursor-pointer"
                        >
                          <option value="">Selecione uma opção</option>
                          <option value="Pão de lo">Pão de ló</option>
                          <option value="Chocolate">Chocolate</option>
                          <option value="Iogurte">Iogurte</option>
                          <option value="Cenoura">Cenoura</option>
                          <option value="Red velvet">Red velvet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                          Recheio
                        </label>
                        <select
                          value={formData.bolo_recheio}
                          onChange={(e) => handleInputChange("bolo_recheio", e.target.value)}
                          onBlur={(e) => handleBlur("bolo_recheio", e.target.value)}
                          className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary outline-none transition-all cursor-pointer"
                        >
                          <option value="">Selecione uma opção</option>
                          <option value="Doce de ovo">Doce de ovo</option>
                          <option value="Nata">Nata</option>
                          <option value="Creme Russo">Creme Russo</option>
                          <option value="Frutos vermelhos">Frutos vermelhos</option>
                          <option value="Chocolate">Chocolate</option>
                          <option value="Fruta variada">Fruta variada</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                          Cobertura
                        </label>
                        <select
                          value={formData.bolo_cobertura}
                          onChange={(e) => handleInputChange("bolo_cobertura", e.target.value)}
                          onBlur={(e) => handleBlur("bolo_cobertura", e.target.value)}
                          className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary outline-none transition-all cursor-pointer"
                        >
                          <option value="">Selecione uma opção</option>
                          <option value="Imagem">Imagem</option>
                          <option value="Doce de ovo">Doce de ovo</option>
                          <option value="Nata">Nata</option>
                          <option value="Creme Russo">Creme Russo</option>
                          <option value="Frutos vermelhos">Frutos vermelhos</option>
                          <option value="Chocolate">Chocolate</option>
                          <option value="Fruta variada">Fruta variada</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary mb-2">
                          Especificações / Observações (Opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.bolo_composicao}
                          onChange={(e) =>
                            handleInputChange("bolo_composicao", e.target.value)
                          }
                          onBlur={(e) =>
                            handleBlur("bolo_composicao", e.target.value)
                          }
                          placeholder="Ex: Nome na imagem do bolo, ou detalhes específicos"
                          className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bloco 7: Notas Adicionais */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border-2 border-surface-alt">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-surface-alt">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-600 font-black shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">
                    Notas Adicionais Gerais
                  </h3>
                  <p className="text-xs font-semibold text-secondary/50">
                    Alergias alimentares, restrições ou pedidos especiais
                  </p>
                </div>
              </div>

              <textarea
                rows={3}
                value={formData.notas_adicionais}
                onChange={(e) =>
                  handleInputChange("notas_adicionais", e.target.value)
                }
                onBlur={(e) => handleBlur("notas_adicionais", e.target.value)}
                placeholder="Ex: 2 crianças com intolerância ao glúten, horário de chegada dos pais..."
                className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Bloco 8: Submissão Final */}
            <div className="mt-8">
              {error && (
                <div className="bg-rose-100 border-2 border-rose-300 text-rose-900 p-4 rounded-2xl text-sm font-bold text-center mb-6 flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className={`w-full py-4 px-8 rounded-2xl font-black text-lg transition-all uppercase tracking-wide shadow-lg ${
                  loading
                    ? "bg-surface-alt text-secondary/40 border-2 border-surface cursor-not-allowed"
                    : "bg-primary hover:bg-secondary text-white shadow-primary/20 cursor-pointer"
                }`}
              >
                {loading
                  ? "A guardar informações..."
                  : "Concluir Preenchimento da Reserva"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ECRÃ 3: LINK INVÁLIDO OU SUBMETIDO
  // -------------------------------------------------------------
  if (estadoFormulario !== "aberto") {
    return (
      <div className="min-h-screen bg-surface py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-4 border-surface-alt text-center">
          {estadoFormulario === "a_verificar" ? (
            <div className="py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-secondary/70 font-bold">
                A verificar a ligação...
              </p>
            </div>
          ) : estadoFormulario === "fechado" ? (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-700 mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-secondary mb-3">
                Formulário Já Submetido
              </h2>
              <p className="text-secondary/70 font-medium text-sm leading-relaxed">
                Os detalhes da sua festa já foram enviados ao Leni's FunPark. Se
                precisar de alterar alguma informação, contacte-nos para reabrir
                o formulário.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-700 mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-secondary mb-3">
                Link Inválido
              </h2>
              <p className="text-secondary/70 font-medium text-sm leading-relaxed">
                Este link expirou ou não é válido. Confirme a hiperligação
                recebida ou entre em contacto com a nossa equipa.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ECRÃ 4: AUTENTICAÇÃO INICIAL (OTP VIA SMS/EMAIL - STEP 1 & 2)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-surface py-20 px-4 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-4 border-primary/20 text-center"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
          <KeyRound className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-2">
          Leni's FunPark
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-secondary mb-3">
          Acesso à Reserva
        </h2>
        <p className="text-secondary/70 text-xs sm:text-sm font-medium mb-6">
          Solicite o seu código de validação de 6 dígitos enviado por SMS/Email.
        </p>

        {error && (
          <div className="bg-rose-100 border-2 border-rose-300 text-rose-900 p-3.5 rounded-2xl text-xs font-bold mb-6 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <button
            type="button"
            onClick={requestOTP}
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white py-4 px-6 rounded-2xl font-black text-base shadow-lg shadow-primary/20 transition-all uppercase tracking-wide cursor-pointer disabled:opacity-50"
          >
            {loading ? "A solicitar código..." : "Solicitar Código de Acesso"}
          </button>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-secondary/60 mb-2">
                Insira o Código (6 Dígitos)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-center text-3xl font-black tracking-[0.3em] text-secondary outline-none transition-all"
              />
            </div>

            <button
              type="button"
              onClick={validateOTP}
              disabled={loading || otp.length !== 6}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wide shadow-lg transition-all ${
                loading || otp.length !== 6
                  ? "bg-surface-alt text-secondary/40 border-2 border-surface cursor-not-allowed"
                  : "bg-primary hover:bg-secondary text-white shadow-primary/20 cursor-pointer"
              }`}
            >
              {loading ? "A validar código..." : "Validar e Entrar"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="text-xs font-bold text-secondary/60 hover:text-primary transition-colors block mx-auto pt-2"
            >
              Não recebeu o código? Clique para pedir novamente.
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

