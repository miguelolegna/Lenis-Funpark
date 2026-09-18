import { useEffect, useState } from 'react';
import { X, CalendarPlus, PartyPopper, CalendarClock, Link2, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { buildLisbonDateTime } from '../../../lib/dateUtils';
import { obterHorariosDisponiveis } from '../../../lib/horarios';

type TipoEvento = 'festa' | 'interno';

// Erros com mensagem pensada para o admin; tudo o resto vai para a consola
class ErroAmigavel extends Error {}

export interface NovoEventoModalProps {
  dataInicial?: string;
  onClose: () => void;
  onCreated: () => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50';
const labelClass = 'block text-xs font-bold text-secondary uppercase mb-1';

function parseDataInput(value: string): Date | null {
  const [y, m, d] = value.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

export default function NovoEventoModal({ dataInicial = '', onClose, onCreated }: NovoEventoModalProps) {
  const [tipo, setTipo] = useState<TipoEvento>('festa');
  const [data, setData] = useState(dataInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, setAGravar] = useState(false);

  // Festa
  const [nome, setNome] = useState('');
  const [hora, setHora] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [numCriancas, setNumCriancas] = useState('');
  const [notas, setNotas] = useState('');
  const [horarios, setHorarios] = useState<string[]>([]);
  const [aCarregarHorarios, setACarregarHorarios] = useState(false);
  const [festaCriada, setFestaCriada] = useState(false);
  const [linkFesta, setLinkFesta] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  // Evento interno
  const [titulo, setTitulo] = useState('');
  const [diaInteiro, setDiaInteiro] = useState(false);
  const [horaInicio, setHoraInicio] = useState('10:00');
  const [horaFim, setHoraFim] = useState('');

  useEffect(() => {
    if (tipo !== 'festa') return;
    const dia = parseDataInput(data);
    if (!dia) return;

    let cancelado = false;
    const carregar = async () => {
      setACarregarHorarios(true);
      setHora('');
      try {
        const livres = await obterHorariosDisponiveis(dia);
        if (!cancelado) setHorarios(livres);
      } catch (err) {
        console.error('[Calendário] Erro ao carregar horários livres:', err);
        if (!cancelado) {
          setHorarios([]);
          setErro('Não foi possível carregar os horários livres.');
        }
      } finally {
        if (!cancelado) setACarregarHorarios(false);
      }
    };
    void carregar();
    return () => {
      cancelado = true;
    };
  }, [data, tipo]);

  const criarFesta = async (dia: Date) => {
    const { data: criada, error } = await supabase
      .from('reservas')
      .insert([
        {
          data_evento: buildLisbonDateTime(dia, hora),
          contacto_cliente: `Tel: ${telefone.trim()} | Email: ${email.trim()}`,
          nome_aniversariante: nome.trim(),
          num_criancas: parseInt(numCriancas, 10),
          notas_adicionais: notas.trim() || null,
          tipo_convite: 'lenis',
          estado: 'IN_PROGRESS',
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('[Calendário] Erro ao criar festa:', error.code, error.message);
      const horarioInvalido =
        error.message.includes('Horário indisponível') || error.message.includes('chk_horario_funcionamento');
      throw new ErroAmigavel(
        horarioInvalido
          ? 'Esse horário já não está disponível ou está fora do horário de funcionamento.'
          : 'Não foi possível criar a festa. Tenta novamente.'
      );
    }

    onCreated();
    setFestaCriada(true);

    // O link é criado por um trigger depois do insert, por isso lê-se num segundo pedido
    const { data: token, error: tokenError } = await supabase
      .from('reserva_tokens')
      .select('token_opaco')
      .eq('reserva_id', criada.id)
      .maybeSingle();

    if (tokenError) {
      console.error('[Calendário] Erro ao obter o link da festa criada:', tokenError.code, tokenError.message);
    } else if (!token) {
      console.error('[Calendário] Festa criada sem link do formulário (trigger_emissao_token não criou o token). Reserva:', criada.id);
    }
    if (token?.token_opaco) {
      setLinkFesta(`${window.location.origin}/reserva/${token.token_opaco}`);
    }
  };

  const criarEventoInterno = async (dia: Date) => {
    if (!diaInteiro && horaFim && horaFim <= horaInicio) {
      throw new ErroAmigavel('A hora de fim tem de ser depois da hora de início.');
    }

    const { error } = await supabase.from('eventos_calendario').insert([
      {
        titulo: titulo.trim(),
        dia_inteiro: diaInteiro,
        inicio: buildLisbonDateTime(dia, diaInteiro ? '00:00' : horaInicio),
        fim: !diaInteiro && horaFim ? buildLisbonDateTime(dia, horaFim) : null,
        notas: notas.trim() || null,
      },
    ]);
    if (error) {
      console.error('[Calendário] Erro ao criar evento interno:', error.code, error.message);
      throw new ErroAmigavel('Não foi possível criar o evento. Tenta novamente.');
    }

    onCreated();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dia = parseDataInput(data);
    if (!dia) {
      setErro('Escolhe uma data.');
      return;
    }

    setAGravar(true);
    setErro(null);
    try {
      if (tipo === 'festa') {
        await criarFesta(dia);
      } else {
        await criarEventoInterno(dia);
      }
    } catch (err) {
      if (err instanceof ErroAmigavel) {
        setErro(err.message);
      } else {
        console.error('[Calendário] Erro inesperado ao criar evento:', err);
        setErro('Ocorreu um erro inesperado. Tenta novamente.');
      }
    } finally {
      setAGravar(false);
    }
  };

  const copiarLink = async () => {
    if (!linkFesta) return;
    try {
      await navigator.clipboard.writeText(linkFesta);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      setErro(`Não foi possível copiar automaticamente. Link: ${linkFesta}`);
    }
  };

  const diaSemHorario = tipo === 'festa' && !!parseDataInput(data) && !aCarregarHorarios && horarios.length === 0;

  return (
    <div
      className="fixed inset-0 bg-secondary/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-surface-alt space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-alt pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-secondary">Adicionar Evento</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-secondary/60 hover:text-secondary rounded-lg cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {festaCriada ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800 font-medium">
              {linkFesta ? (
                <>Festa criada em <strong>Em preenchimento</strong>. Envia o link ao cliente para ele preencher o formulário.</>
              ) : (
                <>Festa criada em <strong>Em preenchimento</strong>, mas não foi possível obter o link agora. Podes copiá-lo no kanban das Reservas.</>
              )}
            </div>
            <div className="flex gap-2">
              {linkFesta && (
                <button
                  type="button"
                  onClick={copiarLink}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {linkCopiado ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  <span>{linkCopiado ? 'Link copiado!' : 'Copiar link do formulário'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-surface-alt text-secondary text-sm font-bold rounded-xl hover:bg-surface transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
            {erro && <p className="text-xs font-medium text-red-700 break-all">{erro}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-alt/60 rounded-2xl">
              {([
                { id: 'festa', label: 'Festa', icon: PartyPopper },
                { id: 'interno', label: 'Evento interno', icon: CalendarClock },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTipo(id);
                    setErro(null);
                  }}
                  aria-pressed={tipo === id}
                  className={`py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    tipo === id ? 'bg-white text-secondary shadow-sm' : 'text-secondary/60 hover:text-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-secondary/70 leading-relaxed font-medium">
              {tipo === 'festa'
                ? 'Para festas marcadas fora do site e já pagas. A reserva entra no kanban em "Em preenchimento", bloqueia o horário no site e gera o link do formulário para o cliente.'
                : 'Manutenção, parque fechado, eventos privados... Aparece só no calendário e não bloqueia horários de reserva no site.'}
            </p>

            {tipo === 'festa' ? (
              <>
                <div>
                  <label className={labelClass}>Nome do Aniversariante *</label>
                  <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Ex: Martim Santos" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Data *</label>
                    <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Hora *</label>
                    <select
                      required
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      disabled={!data || aCarregarHorarios || horarios.length === 0}
                      className={inputClass}
                    >
                      <option value="" disabled>
                        {!data ? 'Escolhe a data' : aCarregarHorarios ? 'A carregar...' : horarios.length === 0 ? 'Sem horários' : 'Escolhe'}
                      </option>
                      {horarios.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {diaSemHorario && (
                  <p className="text-xs font-medium text-amber-700">
                    Não há horários livres neste dia (o parque fecha à segunda-feira).
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Telemóvel *</label>
                    <input type="tel" required value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} placeholder="912 345 678" />
                  </div>
                  <div>
                    <label className={labelClass}>Nº de Crianças *</label>
                    <input type="number" min={1} required value={numCriancas} onChange={(e) => setNumCriancas(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="cliente@exemplo.com" />
                  <p className="text-[11px] text-secondary/50 mt-1">O código de acesso ao formulário é enviado para este email.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelClass}>Título *</label>
                  <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} placeholder="Ex: Manutenção dos insufláveis" />
                </div>
                <div>
                  <label className={labelClass}>Data *</label>
                  <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className={inputClass} />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-secondary cursor-pointer">
                  <input type="checkbox" checked={diaInteiro} onChange={(e) => setDiaInteiro(e.target.checked)} className="w-4 h-4 accent-primary" />
                  Dia inteiro
                </label>
                {!diaInteiro && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Início *</label>
                      <input type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Fim</label>
                      <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className={labelClass}>Notas</label>
              <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} className={`${inputClass} resize-none`} />
            </div>

            {erro && <p className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">{erro}</p>}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-surface-alt text-secondary text-sm font-bold rounded-xl hover:bg-surface transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={aGravar || (tipo === 'festa' && !hora)}
                className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {aGravar ? 'A gravar...' : tipo === 'festa' ? 'Criar festa' : 'Criar evento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
