// Ficha da reserva em PDF: usada pelo cliente no fim do formulário e pelo admin na vista da reserva
// Linha da tabela reservas (sem tipos gerados do Supabase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Reserva = Record<string, any>;

interface Opcoes {
  // "cliente" omite dados internos (ex.: método de caução)
  variante?: "cliente" | "admin";
}

type RGB = [number, number, number];
const COR_PRIMARIA: RGB = [19, 130, 117]; // #138275
const COR_SECUNDARIA: RGB = [3, 63, 71]; // #033f47
const COR_FUNDO: RGB = [236, 248, 246];
const COR_MUTED: RGB = [100, 116, 139];

const preenchido = (v: unknown) => v !== null && v !== undefined && v !== "";

const labelConvite = (tipo?: string) => {
  switch (tipo) {
    case "lenis": return "Convite Leni's";
    case "tematico": return "Convite Temático (+3,50€)";
    default: return "Sem convite";
  }
};

const labelMenu = (r: Reserva) => {
  if (r.opcao_menu === "com_menu" || r.menu_escolhido === "MENU_13_50") return "Com Menu Completo (13,50€ / criança)";
  if (r.opcao_menu === "sem_menu" || r.menu_escolhido === "MENU_11_50") return "Sem Menu (11,50€ / criança)";
  return r.opcao_menu ? String(r.opcao_menu) : "—";
};

export async function exportarReservaPDF(reserva: Reserva, { variante = "admin" }: Opcoes = {}) {
  if (!reserva) return;

  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();

  // Cabeçalho
  doc.setFillColor(...COR_PRIMARIA);
  doc.rect(0, 0, largura, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Leni's FunPark", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Reserva de Festa de Aniversário — Ficha Detalhada", 14, 21);
  const emitido = new Date().toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
  doc.setFontSize(8);
  doc.text(`Emitido em: ${emitido}`, largura - 14, 21, { align: "right" });

  const nome = reserva.nome_aniversariante || "Sem nome";
  const dataFesta = reserva.data_evento
    ? new Date(reserva.data_evento).toLocaleString("pt-PT", {
        weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

  const extras: string[] = [];
  if (reserva.extra_pizza) extras.push("Pizza (+2,00€ / criança)");
  if (reserva.extra_cachorro) extras.push("Cachorro Quente (+2,00€ / criança)");
  if (reserva.extra_doces) extras.push("Doces Sortidos (+1,00€ / criança)");
  if (reserva.extra_fruta) extras.push("Prato de Fruta (+1,50€ / criança)");
  if (reserva.extra_gelatina) extras.push("Gelatina (+1,00€ / criança)");

  const decoracao = Boolean(reserva.decoracao_tematica ?? reserva.decoracao);
  const temaDecoracao = reserva.decoracao_tema_nome || reserva.tema_personalizado;
  const bolo = Boolean(
    reserva.inclui_bolo || reserva.bolo || reserva.bolo_massa || reserva.bolo_recheio ||
    reserva.bolo_cobertura || reserva.bolo_cobertura_base || reserva.bolo_composicao,
  );
  const cobertura = reserva.bolo_cobertura === "Imagem"
    ? `${reserva.bolo_cobertura_base || "—"} + imagem personalizada`
    : reserva.bolo_cobertura || "—";
  const termos = Boolean(reserva.termos_veracidade ?? reserva.veracidade_confirmada);

  const dadosPrincipais: string[][] = [
    ["Nome do Aniversariante", nome],
    ["Idade a Celebrar", preenchido(reserva.idade) ? `${reserva.idade} anos` : "—"],
    ["Data e Hora da Festa", dataFesta],
    ["Número de Crianças", preenchido(reserva.num_criancas) ? `${reserva.num_criancas} crianças` : "—"],
  ];
  if (reserva.contacto_cliente) dadosPrincipais.push(["Contacto do Cliente", reserva.contacto_cliente]);
  if (variante === "admin" && reserva.metodo_pagamento) {
    dadosPrincipais.push(["Método de Caução", String(reserva.metodo_pagamento).toUpperCase()]);
  }

  const seccoes: [string, string[][]][] = [
    ["1. Dados do Aniversariante & Reserva", dadosPrincipais],
    ["2. Convite Digital", [
      ["Tipo de Convite", labelConvite(reserva.tipo_convite)],
      ...(reserva.tipo_convite === "tematico"
        ? [["Tema do Convite", reserva.tema_convite || reserva.tema_personalizado || "—"]]
        : []),
    ]],
    ["3. Menu & Extras", [
      ["Opção de Menu", labelMenu(reserva)],
      ["Extras de Menu", extras.length > 0 ? extras.join("\n") : "Sem extras"],
    ]],
    ["4. Animação & Decoração", [
      ["Decoração Temática", decoracao ? `Sim (+50,00€)${temaDecoracao ? ` — ${temaDecoracao}` : ""}` : "Não"],
      ["Pinturas Faciais", reserva.pinturas_faciais ? "Sim (+20,00€)" : "Não"],
      ["Outros Serviços", reserva.outros_servicos || "—"],
    ]],
    ["5. Bolo de Aniversário (22,00€ / kg)", bolo
      ? [
          ["Inclui Bolo", "Sim"],
          ["Massa", reserva.bolo_massa || "—"],
          ["Recheio", reserva.bolo_recheio || "—"],
          ["Cobertura", cobertura],
          ["Especificações", reserva.bolo_composicao || "—"],
        ]
      : [["Inclui Bolo", "Não"]]],
    ["6. Notas & Termos", [
      ["Notas Adicionais", reserva.notas_adicionais || "—"],
      ["Dados de Saúde", reserva.consentimento_saude ? "Tratamento autorizado pelo cliente" : "Sem autorização"],
      ["Termos & Condições", termos ? "Aceites pelo cliente" : "Pendentes"],
    ]],
  ];

  let y = 34;
  for (const [titulo, linhas] of seccoes) {
    autoTable(doc, {
      startY: y,
      head: [[{ content: titulo, colSpan: 2 }]],
      body: linhas,
      theme: "grid",
      margin: { bottom: 20 },
      headStyles: { fillColor: COR_SECUNDARIA, textColor: 255, fontStyle: "bold", fontSize: 9.5 },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: "bold", fillColor: COR_FUNDO, textColor: COR_SECUNDARIA },
        1: { textColor: COR_SECUNDARIA },
      },
      styles: { fontSize: 9, cellPadding: 2.2, overflow: "linebreak", lineColor: [226, 232, 240] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // Rodapé em todas as páginas
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, altura - 14, largura - 14, altura - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR_MUTED);
    doc.text("Leni's FunPark • Tortosendo, Covilhã • Tel/WhatsApp: (+351) 920 259 886", 14, altura - 8);
    doc.text(`Página ${i} de ${totalPaginas}`, largura - 14, altura - 8, { align: "right" });
  }

  const nomeLimpo = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const dataLimpa = reserva.data_evento ? new Date(reserva.data_evento).toISOString().slice(0, 10) : "reserva";
  doc.save(`Reserva_LenisFunPark_${nomeLimpo || "festa"}_${dataLimpa}.pdf`);
}
