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
} from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import ReservaAdminView from '../../sections/admin/dashboard/ReservaAdminView';

type EstadoKey = 'PENDING_APPROVAL' | 'AWAITING_DEPOSIT' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

interface ColunaKanban {
  id: EstadoKey;
  titulo: string;
  badgeClass: string;
  headerBg: string;
}

const colunasKanban: ColunaKanban[] = [
  {
    id: 'PENDING_APPROVAL',
    titulo: 'Pendente',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    headerBg: 'border-t-4 border-orange-500',
  },
  {
    id: 'AWAITING_DEPOSIT',
    titulo: 'Aguarda Depósito',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    headerBg: 'border-t-4 border-blue-500',
  },
  {
    id: 'IN_PROGRESS',
    titulo: 'Em Curso',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerBg: 'border-t-4 border-emerald-500',
  },
  {
    id: 'COMPLETED',
    titulo: 'Concluída',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    headerBg: 'border-t-4 border-teal-600',
  },
  {
    id: 'REJECTED',
    titulo: 'Cancelada / Recusada',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    headerBg: 'border-t-4 border-rose-500',
  },
];

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reservaModal, setReservaModal] = useState<any>(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const fetchReservas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
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

  // Transição de estado via botão ou Drag & Drop
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

  // Reativar B2C
  const handleReativarToken = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja reativar o acesso de edição para o cliente?')) return;
    setActionError(null);
    const { error } = await supabase.rpc('reativar_token_b2c', { p_reserva_id: id });
    if (error) {
      console.error('Erro ao reativar token:', error);
      setActionError('Erro ao reativar acesso B2C: ' + error.message);
    } else {
      alert('Acesso B2C reativado com sucesso. O cliente já pode voltar a editar.');
      fetchReservas();
    }
  };

  // Drag & Drop handlers nativos
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, colunaEstado: EstadoKey) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    setDraggingId(null);
    if (!id) return;

    const reserva = reservas.find((r) => r.id === id);
    if (reserva && reserva.estado !== colunaEstado) {
      await handleUpdateEstado(id, colunaEstado);
    }
  };

  // Filtragem de reservas
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
      'ID',
      'Data do Evento',
      'Aniversariante',
      'Contacto',
      'Estado',
      'Pacote / Menu',
      'Nº Crianças',
      'Bolo',
      'Convite Digital',
    ];

    const rows = reservas.map((r) => [
      `"${r.id}"`,
      `"${new Date(r.data_evento).toLocaleString('pt-PT')}"`,
      `"${(r.nome_aniversariante || '').replace(/"/g, '""')}"`,
      `"${(r.contacto_cliente || '').replace(/"/g, '""')}"`,
      `"${r.estado || ''}"`,
      `"${(r.opcao_menu || r.menu_escolhido || '—').replace(/"/g, '""')}"`,
      `"${r.num_criancas || '—'}"`,
      `"${r.inclui_bolo || r.bolo ? 'Sim' : 'Não'}"`,
      `"${r.tipo_convite || (r.convite_lenis ? 'Lénis' : 'Nenhum')}"`,
    ]);

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
              Arrasta os cartões entre colunas ou usa os botões rápidos de ação
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
            {colunasKanban.map((coluna) => {
              const reservasDaColuna = reservasFiltradas.filter((r) => {
                if (coluna.id === 'COMPLETED') {
                  return r.estado === 'COMPLETED' || r.estado === 'LOCKED';
                }
                return r.estado === coluna.id;
              });

              return (
                <div
                  key={coluna.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, coluna.id)}
                  className={`bg-white rounded-3xl p-4 border-2 border-surface-alt flex flex-col justify-between min-h-[420px] shadow-sm ${coluna.headerBg}`}
                >
                  <div>
                    {/* Header da Coluna */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-alt">
                      <h3 className="font-extrabold text-sm text-secondary truncate" title={coluna.titulo}>
                        {coluna.titulo}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${coluna.badgeClass}`}>
                        {reservasDaColuna.length}
                      </span>
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
                          const isCompletedOrLocked =
                            reserva.estado === 'COMPLETED' || reserva.estado === 'LOCKED';

                          return (
                            <div
                              key={reserva.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, reserva.id)}
                              className={`p-3.5 bg-surface-alt/50 hover:bg-surface-alt rounded-2xl border border-surface-alt transition-all shadow-xs flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                                draggingId === reserva.id ? 'opacity-50 scale-95 ring-2 ring-primary' : ''
                              }`}
                            >
                              <div>
                                <h4 className="font-black text-sm text-secondary truncate" title={reserva.nome_aniversariante}>
                                  {reserva.nome_aniversariante || 'Sem Nome'}
                                </h4>

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

                                <button
                                  type="button"
                                  onClick={() => setReservaModal(reserva)}
                                  className="w-full py-1 px-2 bg-white hover:bg-surface-alt border border-surface-alt text-secondary text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-secondary/60" />
                                  <span>Ver Formulário</span>
                                </button>

                                {isCompletedOrLocked && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleReativarToken(reserva.id)}
                                      className="flex-1 py-1 px-1 bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-0.5 cursor-pointer"
                                      title="Reativar acesso do cliente"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" />
                                      <span>Reativar</span>
                                    </button>
                                    {reserva.convite_token && (
                                      <a
                                        href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convite_digital?token=${reserva.convite_token}`}
                                        download
                                        className="flex-1 py-1 px-1 bg-accent hover:bg-accent/80 text-white text-[10px] font-bold rounded-lg transition-colors text-center truncate cursor-pointer"
                                        title="Transferir convite digital"
                                      >
                                        Convite
                                      </a>
                                    )}
                                  </div>
                                )}
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

      {/* SECÇÃO 2: TABELA DETALHADA (SÓ LEITURA) */}
      <div className="bg-white rounded-3xl border-2 border-surface-alt shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-alt bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-secondary">Tabela Global de Registos</h2>
            <p className="text-xs font-semibold text-secondary/60">
              Visão consolidada para consulta, auditoria e conferência
            </p>
          </div>
          <span className="text-xs font-bold text-secondary/60">
            Total listado: {reservasFiltradas.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white text-secondary/60 border-b border-surface-alt">
              <tr>
                <th className="p-4 font-bold">Data</th>
                <th className="p-4 font-bold">Aniversariante</th>
                <th className="p-4 font-bold">Contacto</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold">Pacote / Menu</th>
                <th className="p-4 font-bold text-center">Nº Crianças</th>
                <th className="p-4 font-bold text-center">Bolo</th>
                <th className="p-4 font-bold">Convite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-alt">
              {reservasFiltradas.map((r) => {
                const dataEvento = new Date(r.data_evento);
                const temBolo = r.inclui_bolo || r.bolo;

                return (
                  <tr key={r.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="p-4 font-bold text-secondary whitespace-nowrap">
                      {dataEvento.toLocaleDateString('pt-PT', { dateStyle: 'short' })}{' '}
                      <span className="text-secondary/50 font-normal">
                        ({dataEvento.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </td>
                    <td className="p-4 font-bold text-secondary">{r.nome_aniversariante || '—'}</td>
                    <td className="p-4 text-secondary/80 font-medium">{r.contacto_cliente}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          r.estado === 'PENDING_APPROVAL'
                            ? 'bg-orange-100 text-orange-700'
                            : r.estado === 'AWAITING_DEPOSIT'
                            ? 'bg-blue-100 text-blue-700'
                            : r.estado === 'IN_PROGRESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.estado === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-secondary">
                      {r.opcao_menu === 'com_menu' || r.menu_escolhido === 'MENU_13_50'
                        ? 'Menu 13,50€'
                        : r.opcao_menu === 'sem_menu' || r.menu_escolhido === 'MENU_11_50'
                        ? 'Menu 11,50€'
                        : '—'}
                    </td>
                    <td className="p-4 text-center font-bold text-secondary">
                      {r.num_criancas || '—'}
                    </td>
                    <td className="p-4 text-center">
                      {temBolo ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Sim
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-secondary/40">Não</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-secondary">
                        {r.tipo_convite === 'lenis'
                          ? 'Lénis'
                          : r.tipo_convite === 'tematico'
                          ? 'Temático'
                          : 'Nenhum'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {reservasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-secondary/50 font-medium">
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
