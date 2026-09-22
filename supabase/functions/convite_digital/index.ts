import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
import { backgroundBase64, fontBase64 } from "./consts.ts";

let wasmInitialized = false;
let fontBuffer: Uint8Array | null = null;
let initPromise: Promise<void> | null = null;

async function ensureWasmAndFont() {
  if (wasmInitialized && fontBuffer) return;
  if (!initPromise) {
    initPromise = (async () => {
      const wasmRes = await fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm");
      await initWasm(wasmRes);
      
      const b64Data = fontBase64.split(',')[1];
      if (b64Data) {
        const binaryStr = atob(b64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        fontBuffer = bytes;
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
    .select('nome_aniversariante, data_evento, tipo_convite, contacto_cliente, idade')
    .eq('id', reservaId)
    .single();

  if (reservaError || !reserva) {
    return new Response(`Falha de integridade: ${reservaError?.message || 'Reserva não encontrada.'}`, { status: 404 });
  }

  // Interceção Condicional Absoluta
  if (reserva.tipo_convite !== 'lenis') {
    return new Response('Esta reserva possui um convite personalizado, o qual não é gerido por este sistema. O botão destina-se exclusivamente a convites automáticos Lenis."', { status: 403 });
  }

  // Extração e tratamento de dados antes da montagem do SVG
  const eventDateObj = new Date(reserva.data_evento);
  const dataFormatada = eventDateObj.toLocaleDateString('pt-PT', { timeZone: 'Europe/Lisbon' });
  const horaFormatada = eventDateObj.toLocaleTimeString('pt-PT', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit' });
  const parkLocation = Deno.env.get('PARK_LOCATION') || "Zona Industrial do Tortosendo lt.23B, Rua F, 6200-823";

  const [h, m] = horaFormatada.split(':').map(Number);
  const horaFim = `${String(h + 2).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  
  const formatTimeShort = (timeStr: string) => {
    const [th, tm] = timeStr.split(':');
    return tm === '00' ? `${th}h` : `${th}h${tm}`;
  };
  const horaInicioCurta = formatTimeShort(horaFormatada);
  const horaFimCurta = formatTimeShort(horaFim);
  const rotuloHora = `${horaInicioCurta} - ${horaFimCurta}`;

  // Nome do aniversariante (apenas o primeiro nome) em maiúsculas
  const nomeOriginal = (reserva.nome_aniversariante || '').trim();
  const primeiroNome = nomeOriginal.split(' ')[0] || '';
  const nomeDisplay = primeiroNome.toUpperCase();
  
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
    <svg width="1080" height="1527" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <style>
          @font-face {
            font-family: 'Obelix Pro';
            src: url('${fontBase64}') format('truetype');
            font-weight: 900;
            font-style: normal;
          }
        </style>
        <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#000000" flood-opacity="1"/>
        </filter>
      </defs>
      
      <image href="${backgroundBase64}" width="1080" height="1527" />
      
      <!-- NOME DO ANIVERSARIANTE -->
      <text x="576" y="460" font-family="'Obelix Pro', sans-serif" font-size="65" font-weight="900" fill="#FFFFFF" stroke="#000000" stroke-width="3" filter="url(#shadow3d)" text-anchor="middle" letter-spacing="2">
        ${escapeXml(nomeDisplay)}
      </text>
      
      <!-- DATA -->
      <text x="250" y="860" font-family="'Arial', 'Helvetica', sans-serif" font-size="28" font-weight="900" fill="#0f4c5c">
        ${escapeXml(dataFormatada)}
      </text>
      
      <!-- HORA -->
      <text x="285" y="950" font-family="'Arial', 'Helvetica', sans-serif" font-size="28" font-weight="900" fill="#0f4c5c">
        ${escapeXml(rotuloHora)}
      </text>
      
      <!-- IDADE -->
      ${reserva.idade ? `
      <text x="970" y="605" font-family="'Obelix Pro', 'Arial Black', sans-serif" font-size="90" font-weight="900" stroke="#000000" stroke-width="2" fill="#FFFFFF" text-anchor="middle">
        ${escapeXml(String(reserva.idade))}
      </text>
      <!-- ANOS -->
      <text x="965" y="655" font-family="'Obelix Pro', 'Arial Black', sans-serif" font-size="34" font-weight="900" stroke="#000000" stroke-width="2" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
        ANOS
      </text>` : ''}

      <!-- LOCAL: Linha 1 -->
      <text x="290" y="1040" font-family="'Arial', 'Helvetica', sans-serif" font-size="24" font-weight="900" fill="#0f4c5c">
        Leni's Funpark
      </text>

      <!-- LOCAL: Linha 2 -->
      <text x="180" y="1070" font-family="'Arial', 'Helvetica', sans-serif" font-size="18" font-weight="900" fill="#0f4c5c">
        Zona Industrial do Tortosendo
      </text>
      
      <!-- LOCAL: Linha 3 -->
      ${localLinha2 ? `
      <text x="180" y="1100" font-family="'Arial', 'Helvetica', sans-serif" font-size="18" font-weight="900" fill="#0f4c5c">
        lt.23B Rua F, 6200-823
      </text>` : ''}

      <!-- CONFIRMAÇÃO DE PRESENÇA -->
      ${contactoDisplay ? `
      <text x="367" y="1225" font-family="'Arial', 'Helvetica', sans-serif" font-size="28" font-weight="900" fill="#0f4c5c" text-anchor="middle">
        ${escapeXml(contactoDisplay)}
      </text>` : ''}
    </svg>
  `;

  // Converter de SVG para PNG usando Resvg com o buffer de fontes injetado
  try {
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
  } catch (error: any) {
    console.error('Erro na renderização do SVG:', error);
    return new Response(`Erro interno ao gerar o convite: ${error.message}`, { status: 500 });
  }
});