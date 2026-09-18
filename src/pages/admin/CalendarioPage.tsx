import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, CalendarPlus, Clock, Eye, Trash2, X, StickyNote } from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import ReservaAdminView from '../../sections/admin/dashboard/ReservaAdminView';
import NovoEventoModal from '../../sections/admin/calendario/NovoEventoModal';

// Só aparecem festas com o pagamento confirmado
const ESTADOS_PAGOS = ['IN_PROGRESS', 'LOCKED', 'COMPLETED'];

// Os convites avulsos (página Convites) são guardados como reservas concluídas com esta nota
const NOTA_CONVITE_AVULSO = 'Convite avulso emitido manualmente pelo Back-Office.';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const estiloFesta: Record<string, { label: string; chip: string; dot: string }> = {
  IN_PROGRESS: { label: 'Em preenchimento', chip: 'bg-emerald-100 text-emerald-900 border-emerald-200', dot: 'bg-emerald-500' },
  LOCKED: { label: 'Formulário preenchido', chip: 'bg-indigo-100 text-indigo-900 border-indigo-200', dot: 'bg-indigo-500' },
  COMPLETED: { label: 'Concluído', chip: 'bg-teal-100 text-teal-900 border-teal-200', dot: 'bg-teal-600' },
};
const estiloInterno = { label: 'Evento interno', chip: 'bg-amber-100 text-amber-900 border-amber-200', dot: 'bg-amber-500' };

interface EventoInterno {
  id: string;
  titulo: string;
  inicio: string;
  fim: string | null;
  dia_inteiro: boolean;
  notas: string | null;
}

interface NotaDia {
  id: string;
  dia: string;
  texto: string;
}

interface ItemCalendario {
  id: string;
  tipo: 'festa' | 'interno';
  titulo: string;
  inicio: Date;
  fim: Date | null;
  diaInteiro: boolean;
  estado?: string;
  contacto?: string;
  notas?: string | null;
  reserva?: Record<string, unknown>;
}

function chaveDia(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function horaCurta(d: Date) {
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function estiloDe(item: ItemCalendario) {
  return item.tipo === 'interno' ? estiloInterno : estiloFesta[item.estado ?? ''] ?? estiloFesta.COMPLETED;
}

export default function CalendarioPage() {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [diaSelecionado, setDiaSelecionado] = useState<string>(chaveDia(hoje));
  const [itens, setItens] = useState<ItemCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pesquisa, setPesquisa] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [reservaModal, setReservaModal] = useState<Record<string, unknown> | null>(null);
  const [novoEventoAberto, setNovoEventoAberto] = useState(false);
  const [notas, setNotas] = useState<NotaDia[]>([]);
  const [aEscreverNota, setAEscreverNota] = useState(false);
  const [textoNota, setTextoNota] = useState('');
  const [aGravarNota, setAGravarNota] = useState(false);

  const carregar = async () => {
    const [reservasRes, eventosRes, notasRes] = await Promise.all([
      supabase.from('reservas').select('*').in('estado', ESTADOS_PAGOS),
      supabase.from('eventos_calendario').select('*'),
      supabase.from('notas_calendario').select('id, dia, texto').order('created_at'),
    ]);

    const novos: ItemCalendario[] = [];
    const avisos: string[] = [];

    if (reservasRes.error) {
      console.error('[Calendário] Erro ao carregar festas:', reservasRes.error.code, reservasRes.error.message);
      avisos.push('Não foi possível carregar as festas.');
    } else {
      for (const r of reservasRes.data ?? []) {
        if (r.notas_adicionais === NOTA_CONVITE_AVULSO) continue;
        novos.push({
          id: r.id,
          tipo: 'festa',
          titulo: r.nome_aniversariante || 'Sem nome',
          inicio: new Date(r.data_evento),
          fim: null,
          diaInteiro: false,
          estado: r.estado,
          contacto: r.contacto_cliente,
          reserva: r,
        });
      }
    }

    if (eventosRes.error) {
      console.error('[Calendário] Erro ao carregar eventos internos:', eventosRes.error.code, eventosRes.error.message);
      avisos.push('Não foi possível carregar os eventos internos.');
    } else {
      for (const ev of (eventosRes.data ?? []) as EventoInterno[]) {
        novos.push({
          id: ev.id,
          tipo: 'interno',
          titulo: ev.titulo,
          inicio: new Date(ev.inicio),
          fim: ev.fim ? new Date(ev.fim) : null,
          diaInteiro: ev.dia_inteiro,
          notas: ev.notas,
        });
      }
    }

    if (notasRes.error) {
      console.error('[Calendário] Erro ao carregar notas do dia:', notasRes.error.code, notasRes.error.message);
      avisos.push('Não foi possível carregar as notas do dia.');
    } else {
      setNotas((notasRes.data ?? []) as NotaDia[]);
    }

    novos.sort((a, b) => {
      if (a.diaInteiro !== b.diaInteiro) return a.diaInteiro ? -1 : 1;
      return a.inicio.getTime() - b.inicio.getTime();
    });
    setItens(novos);
    setErro(avisos.length ? avisos.join(' ') : null);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar();
  }, []);

  const itensPorDia = useMemo(() => {
    const mapa = new Map<string, ItemCalendario[]>();
    for (const item of itens) {
      const chave = chaveDia(item.inicio);
      mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
    }
    return mapa;
  }, [itens]);

  const notasPorDia = useMemo(() => {
    const mapa = new Map<string, NotaDia[]>();
    for (const nota of notas) {
      mapa.set(nota.dia, [...(mapa.get(nota.dia) ?? []), nota]);
    }
    return mapa;
  }, [notas]);

  const resultadosPesquisa = useMemo(() => {
    const termo = normalizar(pesquisa.trim());
    if (!termo) return [];
    return itens
      .filter((item) => normalizar(`${item.titulo} ${item.contacto ?? ''}`).includes(termo))
      .slice(0, 8);
  }, [itens, pesquisa]);

  const celulas = useMemo(() => {
    const deslocamento = (mesAtual.getDay() + 6) % 7;
    const inicioGrelha = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1 - deslocamento);
    return Array.from({ length: 42 }, (_, i) =>
      new Date(inicioGrelha.getFullYear(), inicioGrelha.getMonth(), inicioGrelha.getDate() + i)
    );
  }, [mesAtual]);

  // Fecha o editor de notas ao mudar de dia, para uma nota nunca ser gravada no dia errado
  const selecionarDia = (chave: string) => {
    setDiaSelecionado(chave);
    setAEscreverNota(false);
    setTextoNota('');
  };

  const irPara = (data: Date) => {
    setMesAtual(new Date(data.getFullYear(), data.getMonth(), 1));
    selecionarDia(chaveDia(data));
  };

  const handleGuardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    const texto = textoNota.trim();
    if (!texto) return;

    setAGravarNota(true);
    const { error } = await supabase.from('notas_calendario').insert([{ dia: diaSelecionado, texto }]);
    setAGravarNota(false);

    if (error) {
      console.error('[Calendário] Erro ao guardar nota:', error.code, error.message);
      setErro('Não foi possível guardar a nota. Tenta novamente.');
      return;
    }
    setTextoNota('');
    setAEscreverNota(false);
    void carregar();
  };

  const handleApagarNota = async (nota: NotaDia) => {
    if (!window.confirm('Apagar esta nota?')) return;
    const { error } = await supabase.from('notas_calendario').delete().eq('id', nota.id);
    if (error) {
      console.error('[Calendário] Erro ao apagar nota:', error.code, error.message);
      setErro('Não foi possível apagar a nota. Tenta novamente.');
    } else {
      void carregar();
    }
  };

  const mudarMes = (delta: number) => {
    setMesAtual((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1));
  };

  const handleApagarEvento = async (item: ItemCalendario) => {
    if (!window.confirm(`Apagar o evento "${item.titulo}"?`)) return;
    const { error } = await supabase.from('eventos_calendario').delete().eq('id', item.id);
    if (error) {
      console.error('[Calendário] Erro ao apagar evento interno:', error.code, error.message);
      setErro('Não foi possível apagar o evento. Tenta novamente.');
    } else {
      void carregar();
    }
  };

  const [anoSel, mesSel, diaSel] = diaSelecionado.split('-').map(Number);
  const dataSelecionada = new Date(anoSel, mesSel - 1, diaSel);
  const itensDoDia = itensPorDia.get(diaSelecionado) ?? [];
  const notasDoDia = notasPorDia.get(diaSelecionado) ?? [];
  const chaveHoje = chaveDia(hoje);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Cabeçalho, pesquisa e ações */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-surface-alt">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary">Calendário</h1>
          <p className="text-sm text-secondary/60 font-medium mt-1">
            Festas com pagamento confirmado e eventos internos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar festa ou contacto..."
              value={pesquisa}
              onChange={(e) => {
                setPesquisa(e.target.value);
                setMostrarResultados(true);
              }}
              onFocus={() => setMostrarResultados(true)}
              onBlur={() => setTimeout(() => setMostrarResultados(false), 150)}
              className="w-64 max-w-full pl-9 pr-8 py-2 bg-surface-alt/50 border border-surface-alt rounded-xl text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors"
              aria-label="Pesquisar festa ou contacto"
            />
            {pesquisa && (
              <button
                type="button"
                onClick={() => setPesquisa('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary cursor-pointer"
                aria-label="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {mostrarResultados && pesquisa.trim() && (
              <div className="absolute z-30 mt-2 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl border-2 border-surface-alt overflow-hidden">
                {resultadosPesquisa.length === 0 ? (
                  <p className="p-4 text-xs font-medium text-secondary/50 text-center">Nenhum evento encontrado.</p>
                ) : (
                  resultadosPesquisa.map((item) => {
                    const estilo = estiloDe(item);
                    return (
                      <button
                        key={`${item.tipo}-${item.id}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          irPara(item.inicio);
                          setMostrarResultados(false);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-surface-alt/60 transition-colors cursor-pointer border-b border-surface-alt last:border-b-0"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${estilo.dot}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-secondary truncate">{item.titulo}</span>
                          <span className="block text-[11px] font-medium text-secondary/60">
                            {item.inicio.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {!item.diaInteiro && ` • ${horaCurta(item.inicio)}`} • {estilo.label}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <input
            type="date"
            value={diaSelecionado}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-').map(Number);
              if (y && m && d) irPara(new Date(y, m - 1, d));
            }}
            className="px-3 py-2 bg-surface-alt/50 border border-surface-alt rounded-xl text-sm font-semibold text-secondary focus:outline-none focus:border-primary transition-colors"
            aria-label="Ir para a data"
          />
        </div>
      </div>

      {erro && (
        <div className="p-4 bg-red-100 text-red-800 rounded-2xl text-sm font-medium border border-red-200 flex items-center justify-between gap-3">
          <span>{erro}</span>
          <button onClick={() => setErro(null)} className="text-xs font-bold underline cursor-pointer flex-shrink-0">
            Dispensar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Calendário mensal */}
        <div className="bg-white rounded-3xl border-2 border-surface-alt shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-secondary">
              {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => irPara(hoje)}
                className="px-3 py-1.5 rounded-lg bg-surface-alt hover:bg-surface text-secondary text-xs font-bold transition-colors cursor-pointer"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => mudarMes(-1)}
                className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors cursor-pointer"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => mudarMes(1)}
                className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors cursor-pointer"
                aria-label="Mês seguinte"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="text-center text-[11px] sm:text-xs font-bold text-secondary/50 uppercase py-1">
                {dia}
              </div>
            ))}
          </div>

          {loading ? (
            <p className="py-24 text-center text-secondary/50 font-semibold">A carregar calendário...</p>
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {celulas.map((dia) => {
                const chave = chaveDia(dia);
                const doDia = itensPorDia.get(chave) ?? [];
                const temNotas = notasPorDia.has(chave);
                const foraDoMes = dia.getMonth() !== mesAtual.getMonth();
                const selecionado = chave === diaSelecionado;
                const eHoje = chave === chaveHoje;

                return (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => selecionarDia(chave)}
                    aria-pressed={selecionado}
                    aria-label={`${dia.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}: ${doDia.length} ${doDia.length === 1 ? 'evento' : 'eventos'}${temNotas ? ', com notas' : ''}`}
                    className={`min-h-[64px] sm:min-h-[112px] p-1.5 sm:p-2 rounded-xl border text-left flex flex-col gap-1 transition-colors cursor-pointer ${
                      selecionado
                        ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                        : 'border-surface-alt hover:border-primary/40 bg-white'
                    } ${foraDoMes ? 'opacity-45' : ''}`}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs sm:text-sm font-black w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                          eHoje ? 'bg-primary text-white' : 'text-secondary'
                        }`}
                      >
                        {dia.getDate()}
                      </span>
                      {temNotas && <StickyNote className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" aria-hidden="true" />}
                    </span>

                    {/* Mobile: pontos */}
                    {doDia.length > 0 && (
                      <span className="flex flex-wrap gap-0.5 sm:hidden">
                        {doDia.slice(0, 4).map((item) => (
                          <span key={`${item.tipo}-${item.id}`} className={`w-1.5 h-1.5 rounded-full ${estiloDe(item).dot}`} />
                        ))}
                      </span>
                    )}

                    {/* Desktop: etiquetas */}
                    <span className="hidden sm:flex flex-col gap-1 min-w-0">
                      {doDia.slice(0, 3).map((item) => (
                        <span
                          key={`${item.tipo}-${item.id}`}
                          className={`block truncate px-1.5 py-0.5 rounded-md border text-[11px] font-bold ${estiloDe(item).chip}`}
                          title={item.titulo}
                        >
                          {!item.diaInteiro && <span className="font-black">{horaCurta(item.inicio)} </span>}
                          {item.titulo}
                        </span>
                      ))}
                      {doDia.length > 3 && (
                        <span className="text-[11px] font-bold text-secondary/50 px-1">+{doDia.length - 3} mais</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-surface-alt">
            {[estiloFesta.IN_PROGRESS, estiloFesta.LOCKED, estiloFesta.COMPLETED, estiloInterno].map((estilo) => (
              <span key={estilo.label} className="flex items-center gap-1.5 text-xs font-semibold text-secondary/70">
                <span className={`w-2.5 h-2.5 rounded-full ${estilo.dot}`} />
                {estilo.label}
              </span>
            ))}
          </div>
        </div>

        {/* Eventos do dia selecionado */}
        <div className="bg-white rounded-3xl border-2 border-surface-alt shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-secondary/50 uppercase">
                {dataSelecionada.toLocaleDateString('pt-PT', { weekday: 'long' })}
              </p>
              <h3 className="text-lg font-black text-secondary">
                {dataSelecionada.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setAEscreverNota(true)}
                className="p-2 rounded-lg bg-surface-alt hover:bg-amber-400 hover:text-white text-secondary transition-colors cursor-pointer"
                title="Adicionar nota neste dia"
                aria-label="Adicionar nota neste dia"
              >
                <StickyNote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setNovoEventoAberto(true)}
                className="p-2 rounded-lg bg-surface-alt hover:bg-primary hover:text-white text-secondary transition-colors cursor-pointer"
                title="Adicionar evento neste dia"
                aria-label="Adicionar evento neste dia"
              >
                <CalendarPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {aEscreverNota && (
            <form onSubmit={handleGuardarNota} className="space-y-2">
              <textarea
                autoFocus
                rows={3}
                value={textoNota}
                onChange={(e) => setTextoNota(e.target.value)}
                placeholder="Ex: Hoje é preciso esperar pelo carteiro"
                className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-secondary placeholder-secondary/40 focus:outline-none focus:border-amber-400 resize-none"
                aria-label="Texto da nota"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAEscreverNota(false);
                    setTextoNota('');
                  }}
                  className="flex-1 py-1.5 bg-surface-alt text-secondary text-xs font-bold rounded-lg hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={aGravarNota || !textoNota.trim()}
                  className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {aGravarNota ? 'A guardar...' : 'Guardar nota'}
                </button>
              </div>
            </form>
          )}

          {notasDoDia.length > 0 && (
            <div className="space-y-2">
              {notasDoDia.map((nota) => (
                <div
                  key={nota.id}
                  className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="flex-1 min-w-0 text-sm font-medium text-amber-950 whitespace-pre-line break-words">{nota.texto}</p>
                  <button
                    type="button"
                    onClick={() => handleApagarNota(nota)}
                    className="p-0.5 rounded-md text-amber-700/50 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer flex-shrink-0"
                    title="Apagar nota"
                    aria-label="Apagar nota"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {itensDoDia.length === 0 ? (
            <p className="py-8 text-center text-sm font-medium text-secondary/40">Sem eventos neste dia.</p>
          ) : (
            <div className="space-y-3">
              {itensDoDia.map((item) => {
                const estilo = estiloDe(item);
                return (
                  <div key={`${item.tipo}-${item.id}`} className="p-3.5 rounded-2xl bg-surface-alt/40 border border-surface-alt space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs font-black text-primary">
                        <Clock className="w-3.5 h-3.5" />
                        {item.diaInteiro
                          ? 'Dia inteiro'
                          : `${horaCurta(item.inicio)}${item.fim ? ` – ${horaCurta(item.fim)}` : ''}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${estilo.chip}`}>{estilo.label}</span>
                    </div>
                    <h4 className="font-black text-sm text-secondary break-words">{item.titulo}</h4>
                    {item.contacto && <p className="text-xs text-secondary/60 break-words">{item.contacto}</p>}
                    {item.notas && <p className="text-xs text-secondary/60 whitespace-pre-line break-words">{item.notas}</p>}

                    {item.tipo === 'festa' ? (
                      <button
                        type="button"
                        onClick={() => setReservaModal(item.reserva ?? null)}
                        className="w-full py-1.5 px-2 bg-white hover:bg-surface-alt border border-surface-alt text-secondary text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-secondary/60" />
                        <span>Ver Formulário</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApagarEvento(item)}
                        className="w-full py-1.5 px-2 bg-white hover:bg-rose-50 border border-surface-alt hover:border-rose-200 text-secondary/70 hover:text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Apagar evento</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {novoEventoAberto && (
        <NovoEventoModal
          dataInicial={diaSelecionado}
          onClose={() => setNovoEventoAberto(false)}
          onCreated={() => void carregar()}
        />
      )}

      {reservaModal && <ReservaAdminView reserva={reservaModal} onClose={() => setReservaModal(null)} />}
    </motion.div>
  );
}
