// Exportação da vista ativa do calendário do admin: CSV (análise), PDF (relatório para imprimir)
// e ICS (importar noutros calendários: Google, Outlook, Apple).

export interface LinhaExportacao {
  id: string;
  tipo: 'festa' | 'interno';
  titulo: string;
  estado: string; // etiqueta legível: "Em preenchimento", "Evento interno", ...
  inicio: Date;
  fim: Date | null;
  diaInteiro: boolean;
  telemovel: string;
  email: string;
  criancas: string;
  notas: string;
}

export interface Exportacao {
  vista: string; // "Mensal", "Semanal", ...
  periodo: string; // texto legível do intervalo
  nomeFicheiro: string; // sem extensão
  linhas: LinhaExportacao[];
}

const DURACAO_FESTA_MS = 2 * 60 * 60 * 1000;

function descarregar(conteudo: BlobPart, tipo: string, nome: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const dataPT = (d: Date) => d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const horaPT = (d: Date) => d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

function fimDe(l: LinhaExportacao) {
  if (l.fim) return l.fim;
  return new Date(l.inicio.getTime() + (l.tipo === 'festa' ? DURACAO_FESTA_MS : 60 * 60 * 1000));
}

function horario(l: LinhaExportacao) {
  if (l.diaInteiro) return 'Dia inteiro';
  return `${horaPT(l.inicio)} – ${horaPT(fimDe(l))}`;
}

// ------------------------------------------------------------------ CSV
export function exportarCSV({ linhas, nomeFicheiro }: Exportacao) {
  const cabecalho = ['Data', 'Dia da semana', 'Horário', 'Tipo', 'Estado', 'Título', 'Telemóvel', 'Email', 'Crianças', 'Notas'];
  const celula = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const corpo = linhas.map((l) =>
    [
      dataPT(l.inicio),
      l.inicio.toLocaleDateString('pt-PT', { weekday: 'long' }),
      horario(l),
      l.tipo === 'festa' ? 'Festa' : 'Evento interno',
      l.estado,
      l.titulo,
      l.telemovel,
      l.email,
      l.criancas,
      l.notas,
    ]
      .map(celula)
      .join(';')
  );
  // BOM + ";" para o Excel em português abrir com acentos e colunas certas
  descarregar('\uFEFF' + [cabecalho.join(';'), ...corpo].join('\r\n'), 'text/csv;charset=utf-8', `${nomeFicheiro}.csv`);
}

// ------------------------------------------------------------------ PDF
const CORES_PDF: Record<string, [number, number, number]> = {
  'Em preenchimento': [16, 185, 129],
  'Formulário preenchido': [99, 102, 241],
  Concluído: [100, 116, 139],
  'Evento interno': [245, 158, 11],
};

export async function exportarPDF({ linhas, vista, periodo, nomeFicheiro }: Exportacao) {
  // Carregado só quando é preciso: não pesa no resto do site
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text("Leni's FunPark — Calendário", 14, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Vista ${vista.toLowerCase()} • ${periodo}`, 14, 23);
  const festas = linhas.filter((l) => l.tipo === 'festa').length;
  doc.text(
    `${festas} ${festas === 1 ? 'festa' : 'festas'} • ${linhas.length - festas} ${linhas.length - festas === 1 ? 'evento interno' : 'eventos internos'} • Gerado a ${dataPT(new Date())} às ${horaPT(new Date())}`,
    14,
    28
  );

  autoTable(doc, {
    startY: 33,
    head: [['Data', 'Horário', 'Estado', 'Título', 'Contacto', 'Crianças', 'Notas']],
    body: linhas.map((l) => [
      `${dataPT(l.inicio)}\n${l.inicio.toLocaleDateString('pt-PT', { weekday: 'short' })}`,
      horario(l),
      l.estado,
      l.titulo,
      [l.telemovel, l.email].filter(Boolean).join('\n'),
      l.criancas,
      l.notas,
    ]),
    styles: { fontSize: 8.5, cellPadding: 2, valign: 'top' },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 26 },
      2: { cellWidth: 34, fontStyle: 'bold' },
      3: { cellWidth: 45 },
      4: { cellWidth: 50 },
      5: { cellWidth: 18, halign: 'center' },
    },
    didParseCell: (dado) => {
      if (dado.section === 'body' && dado.column.index === 2) {
        const cor = CORES_PDF[String(dado.cell.raw)];
        if (cor) dado.cell.styles.textColor = cor;
      }
    },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${doc.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 8, {
        align: 'right',
      });
    },
  });

  if (linhas.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text('Sem eventos neste período.', 14, 45);
  }

  doc.save(`${nomeFicheiro}.pdf`);
}

// ------------------------------------------------------------------ ICS
function textoICS(v: string) {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

const utcICS = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const diaICS = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

// RFC 5545: linhas com mais de 75 octetos são dobradas (continuação começa com espaço)
function dobrar(linha: string) {
  const bytes = new TextEncoder();
  if (bytes.encode(linha).length <= 75) return linha;
  const partes: string[] = [];
  let atual = '';
  for (const ch of linha) {
    if (bytes.encode(atual + ch).length > (partes.length ? 74 : 75)) {
      partes.push(atual);
      atual = ch;
    } else {
      atual += ch;
    }
  }
  partes.push(atual);
  return partes.join('\r\n ');
}

export function exportarICS({ linhas, nomeFicheiro }: Exportacao) {
  const agora = utcICS(new Date());
  const eventos = linhas.flatMap((l) => {
    const datas = l.diaInteiro
      ? [
          `DTSTART;VALUE=DATE:${diaICS(l.inicio)}`,
          `DTEND;VALUE=DATE:${diaICS(new Date(l.inicio.getFullYear(), l.inicio.getMonth(), l.inicio.getDate() + 1))}`,
        ]
      : [`DTSTART:${utcICS(l.inicio)}`, `DTEND:${utcICS(fimDe(l))}`];
    const descricao = [
      l.estado,
      l.telemovel && `Telemóvel: ${l.telemovel}`,
      l.email && `Email: ${l.email}`,
      l.criancas && `Crianças: ${l.criancas}`,
      l.notas,
    ]
      .filter(Boolean)
      .join('\n');
    return [
      'BEGIN:VEVENT',
      `UID:${l.tipo}-${l.id}@lenisfunpark`,
      `DTSTAMP:${agora}`,
      ...datas,
      `SUMMARY:${textoICS(l.tipo === 'festa' ? `Festa: ${l.titulo}` : l.titulo)}`,
      `DESCRIPTION:${textoICS(descricao)}`,
      `CATEGORIES:${textoICS(l.estado)}`,
      "LOCATION:Leni's FunPark",
      'END:VEVENT',
    ];
  });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    "PRODID:-//Leni's FunPark//Calendario Admin//PT",
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    "X-WR-CALNAME:Leni's FunPark",
    'X-WR-TIMEZONE:Europe/Lisbon',
    ...eventos,
    'END:VCALENDAR',
  ]
    .map(dobrar)
    .join('\r\n');

  descarregar(ics + '\r\n', 'text/calendar;charset=utf-8', `${nomeFicheiro}.ics`);
}
