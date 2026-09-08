import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
      setError(err.message || "Erro ao solicitar OTP.");
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Validar e obter ID
      const { data: reservaId, error: rpcError } = await supabase.rpc(
        "validar_otp_b2c",
        {
          p_token_opaco: token,
          p_otp_codigo: otp,
        },
      );
      if (rpcError) throw rpcError;
      if (!reservaId) throw new Error("Falha na extração do ID.");

      // 2. Extrair dados da base de dados contornando o RLS
      const { data: reservaData, error: fetchError } = await supabase.rpc(
        "obter_reserva_b2c",
        { p_token_opaco: token },
      );
      if (fetchError) throw fetchError;

      // 3. Hidratar a RAM do React com os dados absolutos do PostgreSQL
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
          bolo_composicao: reservaData.bolo_composicao || "",
          notas_adicionais: reservaData.notas_adicionais || "",
          termos_veracidade: reservaData.termos_veracidade || false,
          convite_token: reservaData.convite_token || "",
        });
      }

      setReservaId(reservaId);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "OTP Inválido ou Expirado.");
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
    if (!formData.nome_aniversariante || !formData.termos_veracidade) {
      setError(
        "O Nome do Aniversariante e a Aceitação dos Termos são estritamente obrigatórios para concluir.",
      );
      return;
    }
    setLoading(true);
    setError("");

    const { error: rpcError } = await supabase.rpc("selar_reserva_b2c", {
      p_token_opaco: token,
    });

    if (rpcError) {
      setError("Falha de sistema ao selar a reserva: " + rpcError.message);
      setLoading(false);
      return;
    }

    setIsCompleted(true);
    setLoading(false);
  };

  const handleBlur = async (field: string, value: any) => {
    if (!reservaId) return;
    console.log(`[PATCH request]: Atualizando ${field} para ${value}`);

    if (
      field === "inclui_bolo" &&
      value === true &&
      !formData.bolo_composicao
    ) {
      console.warn(
        "Bloqueio Síncrono: Composição do bolo não pode estar vazia.",
      );
      return;
    }

    const payload: Record<string, any> = { [field]: value };
    if (field === "tipo_convite" && value !== "tematico")
      payload.tema_convite = "";
    if (field === "decoracao_tematica" && value === false)
      payload.decoracao_tema_nome = "";
    if (field === "inclui_bolo" && value === false)
      payload.bolo_composicao = "";

    const { error: patchError } = await supabase.rpc("atualizar_reserva_b2c", {
      p_token_opaco: token,
      p_payload: payload,
    });

    if (patchError) {
      console.error(`Falha RPC ao gravar ${field}:`, patchError);
    } else {
      console.log(
        `[PATCH success]: ${field} atualizado com sucesso no backend.`,
      );
    }
  };

  if (isCompleted) {
    const conviteUrl = `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "")}/functions/v1/convite_digital?token=${conviteToken}`;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
        <div className="bg-white p-10 rounded-xl shadow-lg max-w-md text-center border-t-8 border-teal-600">
          <h2 className="text-3xl font-black text-slate-800 mb-4">
            Reserva Submetida
          </h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-6">
            Os detalhes da sua festa foram gravados com sucesso. A equipa do
            Leni's FunPark irá analisar a informação.
          </p>

          {formData.tipo_convite === 'lenis' && conviteToken && (
            <a 
              href={conviteUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-lg w-full font-bold text-lg transition-colors uppercase tracking-wide mb-4"
            >
              📥 Descarregar Convite Digital
            </a>
          )}

          {formData.tipo_convite === 'tematico' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm mb-4">
              🎨 <strong>Convite Temático ({formData.tema_convite}):</strong> A nossa equipa de design irá preparar o convite personalizado e enviá-lo por email.
            </div>
          )}

          <div className="mt-4 text-sm text-slate-400">
            Pode fechar esta janela de forma segura.
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 pt-24 flex justify-center">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-md p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Detalhes da Festa
          </h2>
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome do Aniversariante (Obrigatório)
                </label>
                <input
                  type="text"
                  value={formData.nome_aniversariante}
                  onChange={(e) =>
                    handleInputChange("nome_aniversariante", e.target.value)
                  }
                  onBlur={(e) =>
                    handleBlur("nome_aniversariante", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Idade a Celebrar
                </label>
                <input
                  type="number"
                  value={formData.idade}
                  onChange={(e) => handleInputChange("idade", e.target.value)}
                  onBlur={(e) => handleBlur("idade", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nº de Crianças
                </label>
                <input
                  type="number"
                  value={formData.num_criancas}
                  onChange={(e) =>
                    handleInputChange("num_criancas", e.target.value)
                  }
                  onBlur={(e) => handleBlur("num_criancas", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Convite Digital
              </h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo_convite"
                    value="nenhum"
                    checked={formData.tipo_convite === "nenhum"}
                    onChange={(e) =>
                      handleInputChange("tipo_convite", e.target.value)
                    }
                    onBlur={(e) => handleBlur("tipo_convite", e.target.value)}
                    className="w-4 h-4"
                  />
                  Sem Convite
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo_convite"
                    value="lenis"
                    checked={formData.tipo_convite === "lenis"}
                    onChange={(e) =>
                      handleInputChange("tipo_convite", e.target.value)
                    }
                    onBlur={(e) => handleBlur("tipo_convite", e.target.value)}
                    className="w-4 h-4"
                  />
                  Convite Leni's
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo_convite"
                    value="tematico"
                    checked={formData.tipo_convite === "tematico"}
                    onChange={(e) =>
                      handleInputChange("tipo_convite", e.target.value)
                    }
                    onBlur={(e) => handleBlur("tipo_convite", e.target.value)}
                    className="w-4 h-4"
                  />
                  Convite Temático
                </label>
              </div>
              {formData.tipo_convite === "tematico" && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tema do Convite
                  </label>
                  <input
                    type="text"
                    value={formData.tema_convite}
                    onChange={(e) =>
                      handleInputChange("tema_convite", e.target.value)
                    }
                    onBlur={(e) => handleBlur("tema_convite", e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ex: Homem-Aranha, Princesas, etc."
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800">Menu</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="opcao_menu"
                    value="sem_menu"
                    checked={formData.opcao_menu === "sem_menu"}
                    onChange={(e) =>
                      handleInputChange("opcao_menu", e.target.value)
                    }
                    onBlur={(e) => handleBlur("opcao_menu", e.target.value)}
                    className="w-4 h-4"
                  />
                  Sem Menu (11,50€/criança)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="opcao_menu"
                    value="com_menu"
                    checked={formData.opcao_menu === "com_menu"}
                    onChange={(e) =>
                      handleInputChange("opcao_menu", e.target.value)
                    }
                    onBlur={(e) => handleBlur("opcao_menu", e.target.value)}
                    className="w-4 h-4"
                  />
                  Com Menu (13,50€/criança)
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Extras de Menu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.extra_pizza}
                    onChange={(e) =>
                      handleInputChange("extra_pizza", e.target.checked)
                    }
                    onBlur={(e) => handleBlur("extra_pizza", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Pizza (+1.50€/criança)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.extra_cachorro}
                    onChange={(e) =>
                      handleInputChange("extra_cachorro", e.target.checked)
                    }
                    onBlur={(e) =>
                      handleBlur("extra_cachorro", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Cachorro (+1.50€/criança)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.extra_doces}
                    onChange={(e) =>
                      handleInputChange("extra_doces", e.target.checked)
                    }
                    onBlur={(e) => handleBlur("extra_doces", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Doces (+1.00€/criança)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.extra_fruta}
                    onChange={(e) =>
                      handleInputChange("extra_fruta", e.target.checked)
                    }
                    onBlur={(e) => handleBlur("extra_fruta", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Fruta (+1.00€/criança)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.extra_gelatina}
                    onChange={(e) =>
                      handleInputChange("extra_gelatina", e.target.checked)
                    }
                    onBlur={(e) =>
                      handleBlur("extra_gelatina", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Gelatina (+1.00€/criança)
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Animação & Decoração
              </h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.decoracao_tematica}
                    onChange={(e) =>
                      handleInputChange("decoracao_tematica", e.target.checked)
                    }
                    onBlur={(e) =>
                      handleBlur("decoracao_tematica", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Decoração Temática
                </label>
                {formData.decoracao_tematica && (
                  <div className="pl-6 border-l-2 border-slate-200 ml-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tema da Decoração
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
                      className="w-full p-2 border rounded"
                      placeholder="Ex: Safari, Dinossauros, etc."
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pinturas_faciais}
                    onChange={(e) =>
                      handleInputChange("pinturas_faciais", e.target.checked)
                    }
                    onBlur={(e) =>
                      handleBlur("pinturas_faciais", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Pinturas Faciais
                </label>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Outros Serviços (Pinhata, Lembranças, etc.)
                  </label>
                  <textarea
                    value={formData.outros_servicos}
                    onChange={(e) =>
                      handleInputChange("outros_servicos", e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur("outros_servicos", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    rows={2}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Bolo de Aniversário
              </h3>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inclui_bolo}
                  onChange={(e) =>
                    handleInputChange("inclui_bolo", e.target.checked)
                  }
                  onBlur={(e) => handleBlur("inclui_bolo", e.target.checked)}
                  className="w-4 h-4"
                />
                Incluir Bolo de Aniversário
              </label>
              {formData.inclui_bolo && (
                <div className="pl-6 border-l-2 border-slate-200 ml-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Composição / Recheio (Obrigatório)
                  </label>
                  <textarea
                    value={formData.bolo_composicao}
                    onChange={(e) =>
                      handleInputChange("bolo_composicao", e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur("bolo_composicao", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    rows={2}
                  ></textarea>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Notas Adicionais Gerais
              </label>
              <textarea
                value={formData.notas_adicionais}
                onChange={(e) =>
                  handleInputChange("notas_adicionais", e.target.value)
                }
                onBlur={(e) => handleBlur("notas_adicionais", e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              ></textarea>
            </div>

            <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
              {/* <div className="mb-4 text-sm text-teal-800 font-medium">
                ℹ️ Caução de 50€ obrigatória para validação da reserva.
              </div> */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termos_veracidade}
                  onChange={(e) =>
                    handleInputChange("termos_veracidade", e.target.checked)
                  }
                  onBlur={(e) =>
                    handleBlur("termos_veracidade", e.target.checked)
                  }
                  className="w-5 h-5 accent-teal-600"
                />
                <span className="text-sm font-bold text-slate-800">
                  Aceito os Termos e garanto a Veracidade dos dados
                </span>
              </label>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6">
            {error && (
              <div className="text-red-600 mb-4 text-center font-bold bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <button
              onClick={handleFinalSubmit}
              disabled={loading || !formData.termos_veracidade}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-lg w-full font-bold text-lg disabled:opacity-50 transition-colors uppercase tracking-wide"
            >
              {loading
                ? "A selar dados..."
                : "Concluir Preenchimento da Reserva"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 pt-24 p-4">
      <div className="p-8 max-w-md w-full bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Acesso à Reserva
        </h2>
        {error && (
          <div className="text-red-600 mb-4 bg-red-50 p-3 rounded border border-red-200 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <button
            onClick={requestOTP}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg w-full font-semibold"
          >
            {loading ? "A processar..." : "Solicitar Código de Acesso"}
          </button>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="border-2 border-slate-300 p-3 rounded-lg text-center text-3xl tracking-widest"
            />
            <button
              onClick={validateOTP}
              disabled={loading || otp.length !== 6}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg w-full font-semibold"
            >
              {loading ? "A validar..." : "Validar Acesso"}
            </button>
            <button
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="text-sm text-slate-500 hover:text-slate-800 underline mt-2"
            >
              Não recebeu ou o código expirou? Pedir novamente.
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
