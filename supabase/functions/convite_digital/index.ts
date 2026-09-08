import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
import { backgroundBase64 } from "./consts.ts";

let wasmInitialized = false;
let fontBuffer: Uint8Array | null = null;
let initPromise: Promise<void> | null = null;

async function ensureWasmAndFont() {
  if (wasmInitialized && fontBuffer) return;
  if (!initPromise) {
    initPromise = (async () => {
      const [wasmRes, fontRes] = await Promise.all([
        fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm"),
        fetch("https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-normal.ttf")
      ]);
      await initWasm(wasmRes);
      if (fontRes.ok) {
        fontBuffer = new Uint8Array(await fontRes.arrayBuffer());
      }
      wasmInitialized = true;
    })();
  }
  await initPromise;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatPhone3by3(str: string): string {
  if (!str) return '';
  let phone = str.includes('|') ? str.split('|')[0].trim() : str.trim();

  // Preservar prefixos ou indicativos internacionais como Tel:, Contacto:, (+351), +351
  const prefixMatch = phone.match(/^((?:tel:|contacto:|telemóvel:)?\s*(?:\(\+?\d+\)|\+?\d{2,3})?)\s*(.*)$/i);
  if (prefixMatch) {
    const prefix = prefixMatch[1].trim();
    const rawRest = prefixMatch[2].trim();
    const digits = rawRest.replace(/\D/g, '');
    if (digits.length >= 6) {
      const formatted = (digits.match(/.{1,3}/g) || []).join(' ');
      return prefix ? `${prefix} ${formatted}`.trim() : formatted;
    }
  }

  // Fallback: agrupar qualquer bloco contínuo de dígitos de 3 em 3
  return phone.replace(/\b\d{6,14}\b/g, (num) => {
    return (num.match(/.{1,3}/g) || []).join(' ');
  });
}

serve(async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) return new Response('Acesso negado: Token ausente.', { status: 400 });

  // Lazy loading do WebAssembly e da Fonte TTF no primeiro pedido
  await ensureWasmAndFont();

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let reservaId: string | null = null;

  const { data: resPorConvite } = await supabaseAdmin
    .from('reservas')
    .select('id')
    .eq('convite_token', token)
    .single();

  if (resPorConvite) {
    reservaId = resPorConvite.id;
  } else {
    const { data: resPorTokenOpaco } = await supabaseAdmin
      .from('reserva_tokens')
      .select('reserva_id')
      .eq('token_opaco', token)
      .single();

    if (resPorTokenOpaco) {
      reservaId = resPorTokenOpaco.reserva_id;
    }
  }

  if (!reservaId) {
    return new Response('Acesso negado: Token inválido ou reserva não encontrada.', { status: 403 });
  }

  const { data: reserva, error: reservaError } = await supabaseAdmin
    .from('reservas')
    .select('nome_aniversariante, data_evento, tipo_convite, contacto_cliente')
    .eq('id', reservaId)
    .single();

  if (reservaError || !reserva) {
    return new Response(`Falha de integridade: ${reservaError?.message || 'Reserva não encontrada.'}`, { status: 404 });
  }

  // Interceção Condicional Absoluta
  if (reserva.tipo_convite !== 'lenis') {
    return new Response('Acesso negado: O convite digital automático não está disponível para esta reserva.', { status: 403 });
  }

  // Extração e tratamento de dados antes da montagem do SVG
  const eventDateObj = new Date(reserva.data_evento);
  const dataFormatada = eventDateObj.toLocaleDateString('pt-PT');
  const horaFormatada = eventDateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const parkLocation = Deno.env.get('PARK_LOCATION') || "Zona Industrial do Tortosendo lt.23B Rua F, 6200-823";

  // Nome do aniversariante em maiúsculas
  const nomeOriginal = (reserva.nome_aniversariante || '').trim();
  const nomeDisplay = nomeOriginal.toUpperCase();
  
  // Ajuste dinâmico de tamanho de fonte para acomodar nomes longos na faixa (base: 48px)
  const nomeFontSize = nomeDisplay.length > 20 ? 36 : (nomeDisplay.length > 14 ? 42 : 48);

  // Divisão do endereço para duas linhas no espaço "LOCAL"
  let localLinha1 = parkLocation;
  let localLinha2 = "";
  if (parkLocation.includes(',')) {
    const parts = parkLocation.split(',');
    localLinha1 = parts[0].trim();
    localLinha2 = parts.slice(1).join(',').trim();
  } else if (parkLocation.length > 30) {
    const splitIndex = parkLocation.lastIndexOf(' ', 30);
    localLinha1 = parkLocation.substring(0, splitIndex).trim();
    localLinha2 = parkLocation.substring(splitIndex).trim();
  }

  // Normalização do contacto de confirmação (dividido de 3 em 3 números)
  let contactoDisplay = formatPhone3by3(reserva.contacto_cliente || '');
  if (contactoDisplay && !contactoDisplay.toLowerCase().startsWith('tel') && !contactoDisplay.toLowerCase().startsWith('contacto')) {
    contactoDisplay = `${contactoDisplay}`;
  }

  const svg = `
    <svg width="1080" height="1527" viewBox="0 0 1080 1527" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <image href="${backgroundBase64}" width="1080" height="1527" />
      
      <!-- NOME DO ANIVERSARIANTE: Texto Principal em Branco -->
      <text x="576" y="425" font-family="'Arial Black', Impact, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
        ${escapeXml(nomeDisplay.toUpperCase())}
      </text>
      
      <!-- DATA: Alinhamento pela base para pousar na linha -->
      <text x="250" y="853" font-family="'Arial Black', Impact, sans-serif" font-size="26" font-weight="900" fill="#0f4c5c">
        ${escapeXml(dataFormatada)}
      </text>
      
      <!-- HORA: Alinhamento pela base -->
      <text x="285" y="942" font-family="'Arial Black', Impact, sans-serif" font-size="26" font-weight="900" fill="#0f4c5c">
        ${escapeXml(horaFormatada)}
      </text>
      
      <!-- LOCAL: Linha 1 indentada após "LOCAL: " -->
      <text x="290" y="1030" font-family="'Arial Black', Impact, sans-serif" font-size="19" font-weight="900" fill="#0f4c5c">
        ${escapeXml(localLinha1)}
      </text>
      <!-- LOCAL: Linha 2 com margem a 170px -->
      ${localLinha2 ? `
      <text x="190" y="1095" font-family="'Arial Black', Impact, sans-serif" font-size="19" font-weight="900" fill="#0f4c5c">
        ${escapeXml(localLinha2)}
      </text>` : ''}

      <!-- CONFIRMAÇÃO DE PRESENÇA -->
      ${contactoDisplay ? `
            <text x="367" y="1230" font-family="'Arial Black', Impact, sans-serif" font-size="24" font-weight="900" fill="#0f4c5c" text-anchor="middle">
        ${escapeXml(contactoDisplay)}
      </text>` : ''}
    </svg>
  `;

  // Converter de SVG para PNG usando Resvg com o buffer de fontes injetado
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'original' },
    font: {
      loadSystemFonts: false,
      fontBuffers: fontBuffer ? [fontBuffer] : [],
      defaultFontFamily: 'sans-serif'
    }
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="convite_lenis.png"',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});