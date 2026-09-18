// Formulário de contacto: grava a mensagem por verificar e envia um código de 6 dígitos
// para o email do visitante (Resend). A mensagem só chega ao admin quando o código for
// validado (RPC verificar_mensagem_contacto); se não for validada em 5 minutos, é apagada
// (cron limpar_mensagens_por_verificar).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const VALIDADE_MS = 5 * 60 * 1000;
const MAX_POR_IP_HORA = 5;
const MAX_POR_EMAIL_HORA = 3;
const MAX_ENVIOS = 3;
const ESPERA_REENVIO_MS = 60 * 1000;

class ErroPedido extends Error {
  constructor(public codigo: string, message: string, public status = 400) {
    super(message);
  }
}

function resposta(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

// Aceita 912345678, +351 912 345 678, 00351912345678 ou números internacionais com indicativo.
// Devolve no formato +351912345678, que é como o admin o lê e usa no WhatsApp.
function normalizarTelemovel(valor: string): string | null {
  let digitos = valor.replace(/[\s().-]/g, "");
  if (digitos.startsWith("+")) digitos = digitos.slice(1);
  else if (digitos.startsWith("00")) digitos = digitos.slice(2);
  else if (/^9\d{8}$/.test(digitos)) digitos = "351" + digitos;

  if (!/^\d{9,15}$/.test(digitos)) return null;
  if (digitos.startsWith("351") && !/^3519\d{8}$/.test(digitos)) return null;
  return `+${digitos}`;
}

function validarEmail(valor: string): string | null {
  const email = valor.toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

function mascararEmail(email: string): string {
  const [utilizador, dominio] = email.split("@");
  return `${utilizador.slice(0, 2)}***@${dominio}`;
}

async function enviarCodigo(para: string, codigo: string) {
  if (!RESEND_API_KEY) {
    console.log(`[MENSAGEM LOCAL] Código ${codigo} para ${para}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: Deno.env.get("RESEND_FROM") ?? "Leni's FunPark <noreply@lenisfunpark.com>",
      to: [para],
      subject: "Código de verificação - Leni's FunPark",
      html: `<p>Olá!</p><p>Para enviarmos a sua mensagem, introduza este código no site: <strong style="font-size:20px;letter-spacing:3px">${codigo}</strong></p><p>O código é válido durante 5 minutos. Se não pediu este código, ignore este email.</p>`,
    }),
  });
  if (!res.ok) {
    console.error("[Resend]", res.status, await res.text());
    throw new Error("Falha no envio do email");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;

  try {
    const body = await req.json().catch(() => ({}));

    // ---------------------------------------------------------------- Reenviar
    if (body.acao === "reenviar") {
      const mensagemId = texto(body.mensagem_id, 64);
      const { data: mensagem } = await supabase
        .from("mensagens_contacto")
        .select("id, email, verificada, created_at")
        .eq("id", mensagemId)
        .maybeSingle();

      if (!mensagem?.email || mensagem.verificada ||
          Date.now() - new Date(mensagem.created_at).getTime() > VALIDADE_MS) {
        throw new ErroPedido("expirado", "O código expirou. Envie a mensagem novamente.");
      }

      const { data: registo } = await supabase
        .from("codigos_mensagem")
        .select("envios, ultimo_envio")
        .eq("mensagem_id", mensagemId)
        .maybeSingle();
      if (registo && registo.envios >= MAX_ENVIOS) {
        throw new ErroPedido("limite", "Já reenviámos o código várias vezes. Verifique a caixa de spam.", 429);
      }
      if (registo && Date.now() - new Date(registo.ultimo_envio).getTime() < ESPERA_REENVIO_MS) {
        throw new ErroPedido("espera", "Aguarde um minuto antes de pedir um novo código.", 429);
      }

      const { data: codigo, error: erroCodigo } = await supabase.rpc("gerar_codigo_mensagem", {
        p_mensagem_id: mensagemId,
        p_ip: ip,
      });
      if (erroCodigo) throw erroCodigo;
      await enviarCodigo(mensagem.email, codigo as string);
      return resposta({ ok: true });
    }

    // ---------------------------------------------------------------- Enviar
    // Campo invisível no formulário: só um bot o preenche
    if (texto(body.website, 200)) {
      return resposta({ mensagem_id: crypto.randomUUID(), destino: "" });
    }

    const nome = texto(body.nome, 100);
    const motivo = texto(body.motivo, 100);
    const mensagemTexto = texto(body.mensagem, 2000);
    const preferencia = ["whatsapp", "email", "telefone"].includes(body.preferencia) ? body.preferencia : null;
    if (!nome || !motivo || !mensagemTexto || !preferencia) {
      throw new ErroPedido("dados", "Preencha todos os campos obrigatórios.");
    }

    // O código vai sempre por email; quem prefere WhatsApp ou chamada indica também o telemóvel
    const email = validarEmail(texto(body.email, 200));
    if (!email) throw new ErroPedido("email", "Indique um email válido.");

    let telemovel: string | null = null;
    if (preferencia !== "email") {
      telemovel = normalizarTelemovel(texto(body.telemovel, 40));
      if (!telemovel) throw new ErroPedido("telemovel", "Indique um número de telemóvel válido.");
    }

    // Limites anti-abuso
    const umaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    if (ip) {
      const { count } = await supabase
        .from("codigos_mensagem")
        .select("mensagem_id", { count: "exact", head: true })
        .eq("ip", ip)
        .gte("created_at", umaHora);
      if ((count ?? 0) >= MAX_POR_IP_HORA) {
        throw new ErroPedido("limite", "Enviou várias mensagens seguidas. Tente novamente mais tarde.", 429);
      }
    }
    const { count: porEmail } = await supabase
      .from("mensagens_contacto")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", umaHora);
    if ((porEmail ?? 0) >= MAX_POR_EMAIL_HORA) {
      throw new ErroPedido("limite", "Já recebemos várias mensagens deste email. Tente novamente mais tarde.", 429);
    }

    const categoria = motivo === "Visitas Escolares" ? "escola"
      : motivo === "Traga a sua Instituição" ? "instituicao"
      : "geral";

    const { data: nova, error: erroInsert } = await supabase
      .from("mensagens_contacto")
      .insert({
        nome,
        contacto: telemovel ?? email,
        email,
        motivo,
        categoria,
        mensagem: mensagemTexto,
        preferencia_resposta: preferencia,
        respondido: false,
        verificada: false,
      })
      .select("id")
      .single();
    if (erroInsert) throw erroInsert;

    try {
      const { data: codigo, error: erroCodigo } = await supabase.rpc("gerar_codigo_mensagem", {
        p_mensagem_id: nova.id,
        p_ip: ip,
      });
      if (erroCodigo) throw erroCodigo;
      await enviarCodigo(email, codigo as string);
    } catch (erroEnvio) {
      await supabase.from("mensagens_contacto").delete().eq("id", nova.id);
      console.error("[enviar_codigo_mensagem] Envio falhou:", erroEnvio);
      throw new ErroPedido(
        "envio",
        "Não conseguimos enviar o código para esse email. Confirme o endereço e tente novamente.",
        502,
      );
    }

    return resposta({ mensagem_id: nova.id, destino: mascararEmail(email) });
  } catch (erro) {
    if (erro instanceof ErroPedido) {
      return resposta({ error: erro.codigo, message: erro.message }, erro.status);
    }
    console.error("[enviar_codigo_mensagem]", erro);
    return resposta({ error: "interno", message: "Não foi possível enviar a mensagem. Tente novamente." }, 500);
  }
});
