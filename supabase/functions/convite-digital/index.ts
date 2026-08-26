import sharp from "npm:sharp";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// 5. Limitador de Taxa (Rate Limit) no escopo global
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto

Deno.serve(async (req: Request) => {
  // 2. Contrato HTTP: Escuta exclusivamente GET
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Validação do Limitador de Taxa (Rate Limit)
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const clientRecord = rateLimitMap.get(clientIp);

  if (clientRecord) {
    if (now - clientRecord.timestamp < RATE_LIMIT_WINDOW_MS) {
      if (clientRecord.count >= RATE_LIMIT_MAX) {
        return new Response("Too Many Requests", { status: 429 });
      }
      clientRecord.count++;
    } else {
      // Janela expirou, reinicia a contagem
      rateLimitMap.set(clientIp, { count: 1, timestamp: now });
    }
  } else {
    // Primeiro pedido deste IP
    rateLimitMap.set(clientIp, { count: 1, timestamp: now });
  }

  // 3. Extração de Dados
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("O parâmetro '?token=' é obrigatório.", { status: 400 });
  }

  // Variáveis injetadas nativamente no Edge Runtime
  // @ts-ignore: process.env is injected by Supabase Deno runtime
  const supabaseUrl = process.env.SUPABASE_URL || Deno.env.get("SUPABASE_URL");
  // @ts-ignore
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response("Configuração de ambiente em falta.", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Extrair data, hora e nome associados ao token (assumindo token = id da reserva)
  const { data: reserva, error } = await supabase
    .from("reservas")
    .select("nome_aniversariante, data_evento")
    .eq("id", token)
    .single();

  if (error || !reserva) {
    return new Response("Token inválido ou reserva não encontrada.", { status: 404 });
  }

  const nome = reserva.nome_aniversariante;
  const dataObject = new Date(reserva.data_evento);
  const data = dataObject.toLocaleDateString("pt-PT");
  const hora = dataObject.toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' });
  
  // @ts-ignore
  const parkLocation = process.env.PARK_LOCATION || Deno.env.get("PARK_LOCATION") || "Local a definir";

  // 4. Motor SVG e Fusão
  const width = 1080;
  const height = 1920;
  
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <foreignObject x="100" y="600" width="880" height="1000">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: sans-serif; font-size: 60px; text-align: center; word-wrap: break-word;">
          <h1 style="font-size: 100px; margin-bottom: 20px;">${nome}</h1>
          <p><strong>Data:</strong> ${data}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Local:</strong> ${parkLocation}</p>
        </div>
      </foreignObject>
    </svg>
  `;

  const svgBuffer = new TextEncoder().encode(svgText);

  try {
    const backgroundImage = Deno.readFileSync('./covite_lennis.jpeg');
    const finalImageBuffer = await sharp(backgroundImage)
      .composite([{ input: svgBuffer }])
      .jpeg()
      .toBuffer();

    // 6. Resposta: output final com buffer binário e headers específicos
    return new Response(finalImageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="convite.jpg"',
      },
    });
  } catch (imgError) {
    console.error("Erro na fusão com sharp:", imgError);
    return new Response("Erro ao processar a imagem.", { status: 500 });
  }
});
