import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Search,
  Eye,
  CheckCircle2,
  DollarSign,
  RotateCcw,
  Clock,
  Phone,
  Users,
  Trash2,
  Link2,
  Check,
  Eraser,
  Wallet,
  ArrowLeft,
} from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { nomeMetodoPagamento } from '../../lib/pagamentos';
import { separarContacto } from '../../lib/contactos';
import { supabase } from '../../lib/supabase';
import ReservaAdminView from '../../sections/admin/dashboard/ReservaAdminView';

interface ReservaKanban {
  id: string;
  estado: string;
  data_evento: string;
  nome_aniversariante?: string | null;
  reserva_tokens?: { token_opaco: string }[];
}

function chaveDia(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const eDiaDaFesta = (r: ReservaKanban, hoje: string) => chaveDia(new Date(r.data_evento)) === hoje;

interface ColunaKanban {
  id: string;
  titulo: string;
  pertence: (r: ReservaKanban, hoje: string) => boolean;
  badgeClass: string;
  headerBg: string;
  limpavel?: boolean;
}

const colunasKanban: ColunaKanban[] = [
  {
    id: 'pendente',
    titulo: 'Pendente',
    pertence: (r) => r.estado === 'PENDING_APPROVAL',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    headerBg: 'border-t-4 border-orange-500',
  },
  {
    id: 'aguarda-pagamento',
    titulo: 'A aguardar pagamento',
    pertence: (r) => r.estado === 'AWAITING_DEPOSIT',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    headerBg: 'border-t-4 border-blue-500',
  },
  {
    id: 'em-preenchimento',
    titulo: 'Em preenchimento',
    pertence: (r, hoje) => r.estado === 'IN_PROGRESS' && !eDiaDaFesta(r, hoje),
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerBg: 'border-t-4 border-emerald-500',
  },
  {
    id: 'formulario-preenchido',
    titulo: 'Formulário preenchido',
    pertence: (r, hoje) => r.estado === 'LOCKED' && !eDiaDaFesta(r, hoje),
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    headerBg: 'border-t-4 border-indigo-500',
  },
  {
    id: 'festa-em-curso',
    titulo: 'Festa em curso',
    pertence: (r, hoje) => (r.estado === 'IN_PROGRESS' || r.estado === 'LOCKED') && eDiaDaFesta(r, hoje),
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
    headerBg: 'border-t-4 border-violet-500',
  },
  {
    id: 'concluido',
    titulo: 'Concluído',
    pertence: (r) => r.estado === 'COMPLETED',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    headerBg: 'border-t-4 border-teal-600',
    limpavel: true,
  },
  {
    id: 'canceladas',
    titulo: 'Canceladas',
    pertence: (r) => r.estado === 'CANCELLED' || r.estado === 'REJECTED',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    headerBg: 'border-t-4 border-rose-500',
    limpavel: true,
  },
];

const estadoInfo: Record<string, { label: string; className: string }> = {
  PENDING_APPROVAL: { label: 'Pendente', className: 'bg-orange-100 text-orange-700' },
  AWAITING_DEPOSIT: { label: 'A aguardar pagamento', className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Em preenchimento', className: 'bg-emerald-100 text-emerald-800' },
  LOCKED: { label: 'Formulário preenchido', className: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Concluído', className: 'bg-teal-100 text-teal-800' },
  CANCELLED: { label: 'Cancelada', className: 'bg-rose-100 text-rose-700' },
  REJECTED: { label: 'Recusada', className: 'bg-rose-100 text-rose-700' },
};

const ESTADOS_ATIVOS = ['PENDING_APPROVAL', 'AWAITING_DEPOSIT', 'IN_PROGRESS', 'LOCKED'];

const NOTA_CONVITE_AVULSO = 'Convite avulso emitido manualmente pelo Back-Office.';

interface Recuo {
  estado: string;
  coluna: string;
  aviso?: string;
}

// Para onde vai o card ao carregar na seta "voltar". "Festa em curso" depende só da data,
// por isso não tem coluna anterior; "Concluído" só recua festas que ainda não passaram
// (as passadas voltariam a ser concluídas automaticamente pela tarefa horária).
function recuoDoCard(colunaId: string, r: ReservaKanban & { notas_adicionais?: string | null }): Recuo | null {
  switch (colunaId) {
    case 'aguarda-pagamento':
      return { estado: 'PENDING_APPROVAL', coluna: 'Pendente' };
    case 'em-preenchimento':
      return {
        estado: 'AWAITING_DEPOSIT',
        coluna: 'A aguardar pagamento',
        aviso: 'O cliente deixa de poder preencher o formulário até marcares o pagamento outra vez.',
      };
    case 'formulario-preenchido':
      return {
        estado: 'IN_PROGRESS',
        coluna: 'Em preenchimento',
        aviso: 'O formulário é reaberto: o cliente pode voltar a editar e submeter.',
      };
    case 'concluido':
      if (r.notas_adicionais === NOTA_CONVITE_AVULSO || new Date(r.data_evento) <= new Date()) return null;
      return { estado: 'LOCKED', coluna: 'Formulário preenchido' };
    case 'canceladas':
      return {
        estado: 'PENDING_APPROVAL',
        coluna: 'Pendente',
        aviso: 'A reserva é reativada como pedido pendente.',
      };
    default:
      return null;
  }
}

const nomesConvite: Record<string, string> = { lenis: 'Lénis', tematico: 'Temático' };

interface ReservaLinha {
  data_evento: string;
  created_at?: string | null;
  contacto_cliente?: string | null;
  idade?: number | string | null;
  metodo_pagamento?: string | null;
  decoracao_tematica?: boolean | null;
  decoracao?: boolean | null;
  decoracao_tema_nome?: string | null;
  inclui_bolo?: boolean | null;
  bolo?: boolean | null;
  tipo_convite?: string | null;
  tema_convite?: string | null;
  notas_adicionais?: string | null;
  outros_servicos?: string | null;
}

// Dados de uma reserva já prontos para a tabela e para o CSV (sem os dados do menu)
function dadosTabela(r: ReservaLinha) {
  const dataEvento = new Date(r.data_evento);
  const { telemovel, email } = separarContacto(r.contacto_cliente);
  const decoracao = Boolean(r.decoracao_tematica ?? r.decoracao);
  const temIdade = r.idade !== null && r.idade !== undefined && r.idade !== '';
  const notas = r.notas_adicionais === NOTA_CONVITE_AVULSO ? 'Convite avulso' : r.notas_adicionais;
  return {
    data: dataEvento.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    diaSemana: dataEvento.toLocaleDateString('pt-PT', { weekday: 'short' }),
    hora: dataEvento.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    idade: temIdade ? `${r.idade} anos` : '',
    telemovel,
    email,
    caucao: nomeMetodoPagamento(r.metodo_pagamento) ?? '',
    decoracao,
    temaDecoracao: decoracao ? r.decoracao_tema_nome || '' : '',
    bolo: Boolean(r.inclui_bolo ?? r.bolo),
    convite: nomesConvite[r.tipo_convite ?? ''] ?? 'Nenhum',
    temaConvite: r.tipo_convite === 'tematico' ? r.tema_convite || '' : '',
    observacoes: [notas, r.outros_servicos && `Outros serviços: ${r.outros_servicos}`].filter(Boolean).join('\n'),
    pedidoEm: r.created_at
      ? new Date(r.created_at).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })
      : '',
  };
}

function SimNao({ valor }: { valor: boolean }) {
  return valor ? (
    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Sim</span>
  ) : (
    <span className="text-[11px] font-medium text-secondary/40">Não</span>
  );
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reservaModal, setReservaModal] = useState<any>(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select('*, reserva_tokens(token_opaco)')
      .order('data_evento', { ascending: true });

    if (error) {
      console.error('Erro ao buscar reservas:', error);
      setActionError('Erro ao carregar reservas: ' + error.message);
    } else {
      setReservas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleUpdateEstado = async (id: string, novoEstado: string) => {
    setActionError(null);
    const { error } = await supabase
      .from('reservas')
      .update({ estado: novoEstado })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar estado:', error);
      setActionError('Erro ao mover reserva: ' + error.message);
    } else {
      fetchReservas();
    }
  };

  const handleCancelar = async (reserva: ReservaKanban) => {
    const nome = reserva.nome_aniversariante || 'sem nome';
    if (!window.confirm(`Cancelar a reserva de "${nome}"? O link do formulário deixa de funcionar.`)) return;
    await handleUpdateEstado(reserva.id, 'CANCELLED');
  };

  const handleReabrirFormulario = async (id: string) => {
    if (!window.confirm('Reabrir o formulário? A reserva volta a "Em preenchimento" e o cliente pode voltar a editar e submeter.')) return;
    setActionError(null);
    const { error } = await supabase.rpc('reabrir_formulario_b2c', { p_reserva_id: id });
    if (error) {
      console.error('Erro ao reabrir formulário:', error);
      setActionError('Erro ao reabrir formulário: ' + error.message);
    } else {
      fetchReservas();
    }
  };

  const handleRecuar = async (reserva: ReservaKanban, recuo: Recuo) => {
    const nome = reserva.nome_aniversariante || 'sem nome';
    const pergunta = `Voltar a reserva de "${nome}" para "${recuo.coluna}"?${recuo.aviso ? `\n\n${recuo.aviso}` : ''}`;
    if (!window.confirm(pergunta)) return;
    setActionError(null);

    // LOCKED → IN_PROGRESS passa pela função própria (reabre o formulário do cliente)
    const { error } =
      reserva.estado === 'LOCKED' && recuo.estado === 'IN_PROGRESS'
        ? await supabase.rpc('reabrir_formulario_b2c', { p_reserva_id: reserva.id })
        : await supabase
            .from('reservas')
            // updated_at novo: o cancelamento automático de "A aguardar pagamento" conta 48h a partir daqui
            .update({ estado: recuo.estado, updated_at: new Date().toISOString() })
            .eq('id', reserva.id);

    if (error) {
      console.error('[Reservas] Erro ao recuar reserva:', error.code, error.message);
      setActionError(
        error.message.includes('Horário indisponível')
          ? 'Não é possível reativar: já existe uma festa confirmada neste horário.'
          : error.message.includes('Horário fora do horário de funcionamento')
          ? 'Não é possível reativar: o horário desta reserva está fora do horário de funcionamento.'
          : `Não foi possível voltar a reserva para "${recuo.coluna}". Tenta novamente.`
      );
      return;
    }
    fetchReservas();
  };

  const handleCopiarLink = async (reserva: ReservaKanban) => {
    setActionError(null);
    const token = reserva.reserva_tokens?.[0]?.token_opaco;
    if (!token) {
      setActionError('Esta reserva ainda não tem link. Recarrega a página e tenta de novo.');
      return;
    }
    const link = `${window.location.origin}/reserva/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(reserva.id);
      setTimeout(() => setCopiedId((atual) => (atual === reserva.id ? null : atual)), 2000);
    } catch {
      setActionError(`Não foi possível copiar automaticamente. Link: ${link}`);
    }
  };

  const handleLimparColuna = async (coluna: ColunaKanban, reservasDaColuna: ReservaKanban[]) => {
    const total = reservasDaColuna.length;
    const texto = total === 1 ? '1 reserva' : `${total} reservas`;
    if (!window.confirm(`Apagar definitivamente ${texto} da coluna "${coluna.titulo}"? Esta ação não pode ser desfeita.`)) return;
    setActionError(null);
    const { error } = await supabase
      .from('reservas')
      .delete()
      .in('id', reservasDaColuna.map((r) => r.id));
    if (error) {
      console.error('Erro ao limpar coluna:', error);
      setActionError('Erro ao apagar reservas: ' + error.message);
    } else {
      fetchReservas();
    }
  };

  // Filtragem de reservas
  const hoje = chaveDia(new Date());

  const reservasFiltradas = useMemo(() => {
    if (!filtroTexto.trim()) return reservas;
    const termo = filtroTexto.toLowerCase();
    return reservas.filter(
      (r) =>
        r.nome_aniversariante?.toLowerCase().includes(termo) ||
        r.contacto_cliente?.toLowerCase().includes(termo)
    );
  }, [reservas, filtroTexto]);

  // Exportação para CSV
  const exportarCSV = () => {
    if (reservas.length === 0) {
      alert('Não há reservas para exportar.');
      return;
    }

    const headers = [
      'Data da festa',
      'Hora',
      'Aniversariante',
      'Idade',
      'Estado',
      'Telemóvel',
      'Email',
      'Nº Crianças',
      'Caução',
      'Decoração',
      'Tema da decoração',
      'Pinturas faciais',
      'Bolo',
      'Convite',
      'Tema do convite',
      'Observações',
      'Pedido feito a',
    ];

    const celula = (valor: unknown) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const rows = reservas.map((r) => {
      const d = dadosTabela(r);
      return [
        d.data,
        d.hora,
        r.nome_aniversariante || '',
        d.idade,
        estadoInfo[r.estado]?.label ?? r.estado,
        d.telemovel,
        d.email,
        r.num_criancas ?? '',
        d.caucao,
        d.decoracao ? 'Sim' : 'Não',
        d.temaDecoracao,
        r.pinturas_faciais ? 'Sim' : 'Não',
        d.bolo ? 'Sim' : 'Não',
        d.convite,
        d.temaConvite,
        d.observacoes,
        d.pedidoEm,
      ].map(celula);
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_lenisfunpark_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-surface-alt">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary">Reservas & Marcações</h1>
          <p className="text-sm text-secondary/60 font-medium mt-1">
            Gestão operacional por fluxo Kanban e tabela integral com exportação
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar aniversariante..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-alt/50 border border-surface-alt rounded-xl text-xs sm:text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={exportarCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-secondary/90 transition-colors shadow-sm cursor-pointer"
            title="Descarregar ficheiro CSV com todas as reservas"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-red-100 text-red-800 rounded-2xl text-sm font-medium border border-red-200 flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* SECÇÃO 1: KANBAN DE RESERVAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-secondary">Quadro Kanban</h2>
            <p className="text-xs font-medium text-secondary/60">
              Usa os botões de cada cartão para avançar as reservas no fluxo
            </p>
          </div>
          <span className="text-xs font-bold text-secondary/50">
            {reservasFiltradas.length} {reservasFiltradas.length === 1 ? 'reserva' : 'reservas'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-secondary/50 font-semibold bg-white rounded-3xl border-2 border-surface-alt">
            A carregar quadro de reservas...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-none md:grid-flow-col md:auto-cols-[minmax(13rem,1fr)] md:overflow-x-auto gap-4 pb-2">
            {colunasKanban.map((coluna) => {
              const reservasDaColuna = reservasFiltradas.filter((r) => coluna.pertence(r, hoje));

              return (
                <div
                  key={coluna.id}
                  className={`bg-white rounded-3xl p-4 border-2 border-surface-alt flex flex-col justify-between min-h-[420px] shadow-sm ${coluna.headerBg}`}
                >
                  <div>
                    {/* Header da Coluna */}
                    <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-surface-alt">
                      <h3 className="font-extrabold text-sm text-secondary truncate" title={coluna.titulo}>
                        {coluna.titulo}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {coluna.limpavel && reservasDaColuna.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleLimparColuna(coluna, reservasDaColuna)}
                            className="p-1 rounded-md text-secondary/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={`Limpar coluna "${coluna.titulo}" (apaga definitivamente)`}
                            aria-label={`Limpar coluna ${coluna.titulo}`}
                          >
                            <Eraser className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${coluna.badgeClass}`}>
                          {reservasDaColuna.length}
                        </span>
                      </div>
                    </div>

                    {/* Lista de Cards da Coluna */}
                    <div className="space-y-3">
                      {reservasDaColuna.length === 0 ? (
                        <p className="text-center py-8 text-xs font-medium text-secondary/30 italic">
                          Sem registos
                        </p>
                      ) : (
                        reservasDaColuna.map((reserva) => {
                          const dataEvento = new Date(reserva.data_evento);
                          const isAtiva = ESTADOS_ATIVOS.includes(reserva.estado);
                          const mostraConvite =
                            (reserva.estado === 'LOCKED' || reserva.estado === 'COMPLETED') && reserva.convite_token;
                          const recuo = recuoDoCard(coluna.id, reserva);

                          return (
                            <div
                              key={reserva.id}
                              className="p-3.5 bg-surface-alt/50 hover:bg-surface-alt rounded-2xl border border-surface-alt transition-all shadow-xs flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-black text-sm text-secondary truncate" title={reserva.nome_aniversariante}>
                                    {reserva.nome_aniversariante || 'Sem Nome'}
                                  </h4>
                                  {recuo && (
                                    <button
                                      type="button"
                                      onClick={() => handleRecuar(reserva, recuo)}
                                      className="-mt-1 -mr-1 p-1 rounded-md text-secondary/40 hover:text-secondary hover:bg-white transition-colors cursor-pointer flex-shrink-0"
                                      title={`Voltar para "${recuo.coluna}"`}
                                      aria-label={`Voltar a reserva de ${reserva.nome_aniversariante || 'sem nome'} para ${recuo.coluna}`}
                                    >
                                      <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-[11px] font-bold text-primary mt-0.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {dataEvento.toLocaleDateString('pt-PT', {
                                      day: 'numeric',
                                      month: 'short',
                                    })}{' '}
                                    •{' '}
                                    {dataEvento.toLocaleTimeString('pt-PT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </p>

                                <div className="mt-2 text-[11px] text-secondary/70 space-y-0.5">
                                  <p className="flex items-center gap-1 truncate">
                                    <Phone className="w-3 h-3 text-secondary/50 flex-shrink-0" />
                                    <span className="truncate">{reserva.contacto_cliente}</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-secondary/50 flex-shrink-0" />
                                    <span>{reserva.num_criancas || '—'} crianças</span>
                                  </p>
                                  {nomeMetodoPagamento(reserva.metodo_pagamento) && (
                                    <p className="flex items-center gap-1">
                                      <Wallet className="w-3 h-3 text-secondary/50 flex-shrink-0" />
                                      <span>Caução: {nomeMetodoPagamento(reserva.metodo_pagamento)}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Ações Específicas do Card */}
                              <div className="mt-3 pt-2.5 border-t border-surface-alt space-y-1.5">
                                {reserva.estado === 'PENDING_APPROVAL' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateEstado(reserva.id, 'AWAITING_DEPOSIT')}
                                    className="w-full py-1.5 px-2 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Aprovar</span>
                                  </button>
                                )}

                                {reserva.estado === 'AWAITING_DEPOSIT' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateEstado(reserva.id, 'IN_PROGRESS')}
                                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                    <span>Marcar como Pago</span>
                                  </button>
                                )}

                                {reserva.reserva_tokens?.[0]?.token_opaco && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopiarLink(reserva)}
                                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    title="Copiar o link do formulário para enviar ao cliente"
                                  >
                                    {copiedId === reserva.id ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Link copiado!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Link2 className="w-3 h-3" />
                                        <span>Copiar link</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {reserva.estado === 'LOCKED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleReabrirFormulario(reserva.id)}
                                    className="w-full py-1.5 px-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    title="Devolve a reserva a Em preenchimento para o cliente voltar a editar"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reabrir formulário</span>
                                  </button>
                                )}

                                {mostraConvite && (
                                  <a
                                    href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convite_digital?token=${reserva.convite_token}`}
                                    download
                                    className="w-full py-1 px-2 bg-accent hover:bg-accent/80 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                    title="Transferir convite digital"
                                  >
                                    Convite
                                  </a>
                                )}

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setReservaModal(reserva)}
                                    className="flex-1 py-1 px-2 bg-white hover:bg-surface-alt border border-surface-alt text-secondary text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3 text-secondary/60" />
                                    <span>Ver Formulário</span>
                                  </button>
                                  {isAtiva && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelar(reserva)}
                                      className="p-1.5 bg-white hover:bg-rose-50 border border-surface-alt hover:border-rose-200 text-secondary/50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                      title="Cancelar reserva"
                                      aria-label={`Cancelar reserva de ${reserva.nome_aniversariante || 'sem nome'}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECÇÃO 2: TABELA DETALHADA (SÓ LEITURA) — tudo o que importa numa linha, sem botões */}
      <div className="bg-white rounded-3xl border-2 border-surface-alt shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-alt bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-secondary">Tabela Global de Registos</h2>
            <p className="text-xs font-semibold text-secondary/60">
              Todos os dados de cada reserva numa só linha. Desliza para o lado para ver todas as colunas.
            </p>
          </div>
          <span className="text-xs font-bold text-secondary/60">
            Total listado: {reservasFiltradas.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-secondary/60 border-b border-surface-alt">
              <tr className="whitespace-nowrap">
                <th className="p-3 font-bold sticky left-0 bg-white z-10">Data da festa</th>
                <th className="p-3 font-bold">Aniversariante</th>
                <th className="p-3 font-bold">Estado</th>
                <th className="p-3 font-bold">Telemóvel</th>
                <th className="p-3 font-bold">Email</th>
                <th className="p-3 font-bold text-center">Crianças</th>
                <th className="p-3 font-bold">Caução</th>
                <th className="p-3 font-bold">Decoração</th>
                <th className="p-3 font-bold text-center">Pinturas faciais</th>
                <th className="p-3 font-bold text-center">Bolo</th>
                <th className="p-3 font-bold">Convite</th>
                <th className="p-3 font-bold">Observações</th>
                <th className="p-3 font-bold">Pedido feito a</th>
                <th className="p-3 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-alt">
              {reservasFiltradas.map((r) => {
                const d = dadosTabela(r);

                return (
                  <tr key={r.id} className="group hover:bg-surface-alt/50 transition-colors align-top">
                    <td className="p-3 font-bold text-secondary whitespace-nowrap sticky left-0 bg-white group-hover:bg-surface-alt z-10">
                      <span className="block">{d.data}</span>
                      <span className="text-secondary/50 font-semibold">{d.diaSemana} • {d.hora}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="block font-bold text-secondary">{r.nome_aniversariante || '—'}</span>
                      {d.idade && <span className="text-secondary/50 font-semibold">{d.idade}</span>}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                          estadoInfo[r.estado]?.className ?? 'bg-surface-alt text-secondary'
                        }`}
                      >
                        {estadoInfo[r.estado]?.label ?? r.estado}
                      </span>
                    </td>
                    <td className="p-3 text-secondary font-medium whitespace-nowrap">{d.telemovel || '—'}</td>
                    <td className="p-3 text-secondary font-medium whitespace-nowrap">{d.email || '—'}</td>
                    <td className="p-3 text-center font-bold text-secondary">{r.num_criancas || '—'}</td>
                    <td className="p-3 text-secondary font-medium whitespace-nowrap">{d.caucao || '—'}</td>
                    <td className="p-3 whitespace-nowrap">
                      {d.decoracao ? (
                        <>
                          <SimNao valor />
                          {d.temaDecoracao && <span className="ml-1.5 font-semibold text-secondary">{d.temaDecoracao}</span>}
                        </>
                      ) : (
                        <SimNao valor={false} />
                      )}
                    </td>
                    <td className="p-3 text-center"><SimNao valor={Boolean(r.pinturas_faciais)} /></td>
                    <td className="p-3 text-center"><SimNao valor={d.bolo} /></td>
                    <td className="p-3 text-secondary font-medium whitespace-nowrap">
                      {d.convite}
                      {d.temaConvite && <span className="text-secondary/60"> • {d.temaConvite}</span>}
                    </td>
                    <td className="p-3 text-secondary/80 font-medium min-w-[16rem] max-w-[24rem] whitespace-pre-wrap">
                      {d.observacoes || '—'}
                    </td>
                    <td className="p-3 text-secondary/60 font-medium whitespace-nowrap">{d.pedidoEm || '—'}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReservaModal(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-alt text-secondary border border-surface-alt rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Ver formulário completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Form</span>
                        </button>
                        {r.reserva_tokens?.[0]?.token_opaco ? (
                          <button
                            type="button"
                            onClick={() => handleCopiarLink(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-alt hover:bg-primary/10 text-secondary hover:text-primary border border-surface rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="Copiar link do formulário da reserva"
                          >
                            {copiedId === r.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Link2 className="w-3.5 h-3.5 text-primary" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-secondary/40 font-medium inline-block w-[80px]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reservasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-secondary/50 font-medium">
                    Nenhum registo encontrado com o filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Leitura do Formulário */}
      {reservaModal && (
        <ReservaAdminView
          reserva={reservaModal}
          onClose={() => setReservaModal(null)}
        />
      )}
    </motion.div>
  );
}
