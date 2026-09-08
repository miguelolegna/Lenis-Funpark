import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  TrendingUp,
  Activity,
  Users,
  Clock,
  ArrowUpRight,
  Eye,
  Calendar,
} from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useParkStatus } from '../../hooks/useParkStatus';
import ReservaAdminView from '../../sections/admin/dashboard/ReservaAdminView';

export default function Dashboard() {
  const { status: parkStatus } = useParkStatus();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservaModal, setReservaModal] = useState<any>(null);
  const [adminCount, setAdminCount] = useState<number>(1);

  const fetchReservas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('data_evento', { ascending: true });

    if (error) {
      console.error('Erro ao buscar reservas:', error);
    } else {
      setReservas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();

    // Contagem de admins
    const fetchAdminStats = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setAdminCount(1);
        }
      } catch {
        setAdminCount(1);
      }
    };
    fetchAdminStats();
  }, []);

  // Cálculos de Métricas
  const stats = useMemo(() => {
    const total = reservas.length;
    const pending = reservas.filter((r) => r.estado === 'PENDING_APPROVAL').length;
    const awaitingDeposit = reservas.filter((r) => r.estado === 'AWAITING_DEPOSIT').length;
    const inProgress = reservas.filter((r) => r.estado === 'IN_PROGRESS').length;
    const completed = reservas.filter((r) => r.estado === 'COMPLETED' || r.estado === 'LOCKED').length;
    const rejected = reservas.filter((r) => r.estado === 'REJECTED').length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const thisMonthReservas = reservas.filter((r) => {
      const d = new Date(r.data_evento);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthReservas = reservas.filter((r) => {
      const d = new Date(r.data_evento);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    const percentChange =
      lastMonthReservas > 0
        ? Math.round(((thisMonthReservas - lastMonthReservas) / lastMonthReservas) * 100)
        : thisMonthReservas > 0
        ? 100
        : 0;

    // Próximas 3 reservas a partir de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = reservas
      .filter((r) => new Date(r.data_evento) >= today && r.estado !== 'REJECTED')
      .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())
      .slice(0, 3);

    // Se houver menos de 3 futuras, preencher com as mais recentes que não estejam rejeitadas
    const proximas =
      upcoming.length > 0
        ? upcoming
        : reservas.slice(0, 3);

    return {
      total,
      pending,
      awaitingDeposit,
      inProgress,
      completed,
      rejected,
      thisMonthReservas,
      lastMonthReservas,
      percentChange,
      proximas,
    };
  }, [reservas]);

  // Cores do semáforo pequeno (só leitura)
  const getSemaforoColor = () => {
    switch (parkStatus) {
      case 'Livre':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'Moderado':
        return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'Cheio':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'Fechado':
      default:
        return 'text-secondary/70 bg-gray-100 border-gray-300';
    }
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
      {/* Top Header / Boas-vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-surface-alt">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Visão Geral
            </span>
            <span className="text-xs font-semibold text-secondary/50">
              {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary mt-1">Dashboard Geral</h1>
          <p className="text-sm text-secondary/60 font-medium mt-0.5">
            Métricas executivas em tempo real e estado operacional do parque
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/reservas"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary transition-colors shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Gerir Reservas</span>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total de Reservas & Breakdown */}
        <div className="bg-white p-6 rounded-3xl border-2 border-surface-alt shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-secondary/60">
                Total de Reservas
              </span>
              <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-secondary">{stats.total}</span>
              <span className="text-xs font-medium text-secondary/50 ml-2">registadas</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-alt grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-orange-50 p-1.5 rounded-lg border border-orange-200">
              <span className="block font-black text-orange-700">{stats.pending}</span>
              <span className="text-[10px] text-orange-600 font-bold">Pend.</span>
            </div>
            <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-200">
              <span className="block font-black text-blue-700">{stats.awaitingDeposit}</span>
              <span className="text-[10px] text-blue-600 font-bold">Sinal</span>
            </div>
            <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
              <span className="block font-black text-emerald-700">{stats.completed}</span>
              <span className="text-[10px] text-emerald-600 font-bold">Concl.</span>
            </div>
          </div>
        </div>

        {/* 2. Comparativo Mensal */}
        <div className="bg-white p-6 rounded-3xl border-2 border-surface-alt shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-secondary/60">
                Reservas do Mês
              </span>
              <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-secondary">{stats.thisMonthReservas}</span>
              <span className="text-xs font-medium text-secondary/50 ml-2">este mês</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-alt flex items-center justify-between text-xs">
            <span className="text-secondary/60 font-semibold">Mês anterior: {stats.lastMonthReservas}</span>
            <span
              className={`px-2 py-0.5 rounded-full font-black flex items-center gap-0.5 ${
                stats.percentChange >= 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {stats.percentChange >= 0 ? '+' : ''}
              {stats.percentChange}%
            </span>
          </div>
        </div>

        {/* 3. Estado do Semáforo (Mini-widget só de leitura) */}
        <div className="bg-white p-6 rounded-3xl border-2 border-surface-alt shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-secondary/60">
                Lotação Atual
              </span>
              <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              {/* Mini 3 bolinhas visuais só leitura */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-surface-alt border border-surface-alt">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    parkStatus === 'Livre'
                      ? 'bg-primary shadow-[0_0_8px_var(--color-primary)] ring-2 ring-primary/40'
                      : 'bg-primary/20'
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    parkStatus === 'Moderado'
                      ? 'bg-yellow-400 shadow-[0_0_8px_#facc15] ring-2 ring-yellow-400/40'
                      : 'bg-yellow-400/20'
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    parkStatus === 'Cheio'
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444] ring-2 ring-red-500/40'
                      : 'bg-red-500/20'
                  }`}
                />
              </div>

              <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${getSemaforoColor()}`}>
                {parkStatus}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-alt">
            <Link
              to="/admin/semaforo"
              className="text-xs font-bold text-primary hover:text-secondary flex items-center justify-between transition-colors"
            >
              <span>Gerir semáforo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Admins Ativos */}
        <div className="bg-white p-6 rounded-3xl border-2 border-surface-alt shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-secondary/60">
                Admins Ativos
              </span>
              <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-secondary">{adminCount}</span>
              <span className="text-xs font-medium text-secondary/50 ml-2">com acesso</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-alt">
            <Link
              to="/admin/admins"
              className="text-xs font-bold text-primary hover:text-secondary flex items-center justify-between transition-colors"
            >
              <span>Gerir acessos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secção Próximas 3 Reservas */}
      <div className="bg-white rounded-3xl border-2 border-surface-alt shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-alt bg-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-secondary">Próximas 3 Reservas</h2>
            <p className="text-xs font-semibold text-secondary/60">
              Eventos imediatos a requerer atenção operacional
            </p>
          </div>
          <Link
            to="/admin/reservas"
            className="text-xs font-bold text-primary hover:text-secondary transition-colors"
          >
            Ver todas as reservas ({stats.total}) →
          </Link>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="py-8 text-center text-secondary/50 font-medium">A carregar marcações...</p>
          ) : stats.proximas.length === 0 ? (
            <div className="py-12 text-center text-secondary/50">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-secondary/30" />
              <p className="font-semibold text-sm">Sem próximas reservas registadas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.proximas.map((reserva) => {
                const dataEvento = new Date(reserva.data_evento);
                return (
                  <div
                    key={reserva.id}
                    className="p-5 rounded-2xl bg-surface-alt/40 border border-surface-alt hover:border-primary/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            reserva.estado === 'PENDING_APPROVAL'
                              ? 'bg-orange-100 text-orange-700'
                              : reserva.estado === 'AWAITING_DEPOSIT'
                              ? 'bg-blue-100 text-blue-700'
                              : reserva.estado === 'IN_PROGRESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reserva.estado === 'REJECTED'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-surface text-secondary'
                          }`}
                        >
                          {reserva.estado === 'PENDING_APPROVAL'
                            ? 'Pendente'
                            : reserva.estado === 'AWAITING_DEPOSIT'
                            ? 'Aguarda Depósito'
                            : reserva.estado === 'IN_PROGRESS'
                            ? 'Em Curso'
                            : reserva.estado === 'REJECTED'
                            ? 'Cancelada'
                            : 'Concluída'}
                        </span>

                        <span className="text-xs font-bold text-secondary/50 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {dataEvento.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-secondary truncate">
                        {reserva.nome_aniversariante || 'Reserva sem nome'}
                      </h3>

                      <p className="text-xs font-bold text-primary mt-0.5">
                        {dataEvento.toLocaleDateString('pt-PT', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>

                      <div className="mt-3 text-xs text-secondary/70 space-y-1">
                        <p className="truncate">
                          <span className="font-semibold text-secondary/50">Contacto:</span>{' '}
                          {reserva.contacto_cliente}
                        </p>
                        <p>
                          <span className="font-semibold text-secondary/50">Crianças:</span>{' '}
                          {reserva.num_criancas || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-alt flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setReservaModal(reserva)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-surface-alt hover:bg-surface-alt text-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Formulário</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Atalhos Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/admin/convites"
          className="p-5 rounded-3xl bg-white border-2 border-surface-alt shadow-sm hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">
              Criar Convite Avulso
            </span>
            <ArrowUpRight className="w-4 h-4 text-secondary/40 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs text-secondary/60 mt-1">
            Gere links de convite digital sem marcação de festa.
          </p>
        </Link>

        <Link
          to="/admin/semaforo"
          className="p-5 rounded-3xl bg-white border-2 border-surface-alt shadow-sm hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">
              Atualizar Lotação
            </span>
            <ArrowUpRight className="w-4 h-4 text-secondary/40 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs text-secondary/60 mt-1">
            Altere em tempo real as luzes do semáforo público.
          </p>
        </Link>

        <Link
          to="/admin/contactos"
          className="p-5 rounded-3xl bg-white border-2 border-surface-alt shadow-sm hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">
              Pedidos de Contacto
            </span>
            <ArrowUpRight className="w-4 h-4 text-secondary/40 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs text-secondary/60 mt-1">
            Consulte mensagens e pedidos de visitas escolares.
          </p>
        </Link>
      </div>

      {/* Modal de Leitura de Reserva */}
      {reservaModal && (
        <ReservaAdminView
          reserva={reservaModal}
          onClose={() => setReservaModal(null)}
        />
      )}
    </motion.div>
  );
}
