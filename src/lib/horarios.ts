import { supabase } from './supabase';

function dataISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Festas de 2h. Os horários podem sobrepor-se entre si (ex.: 10:00 e 11:30). */
const HORARIOS_FIM_DE_SEMANA = ['10:00', '11:30', '14:00', '16:00', '18:00'];
const HORARIOS_SEMANA = ['14:00', '16:00', '18:00'];

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). Igual a domingo_pascoa() na BD. */
function domingoPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

const FERIADOS_FIXOS = ['01-01', '04-25', '05-01', '06-10', '08-15', '10-05', '11-01', '12-01', '12-08', '12-25'];

/** Feriados nacionais. Igual a e_feriado() na BD. */
export function eFeriado(date: Date): boolean {
  const mmdd = dataISO(date).slice(5);
  if (FERIADOS_FIXOS.includes(mmdd)) return true;
  const pascoa = domingoPascoa(date.getFullYear());
  const moveis = [-2, 0, 60].map((dias) => dataISO(new Date(pascoa.getFullYear(), pascoa.getMonth(), pascoa.getDate() + dias)));
  return moveis.includes(dataISO(date));
}

/** Horários de início permitidos num dia. Igual a horarios_festa_dia() na BD. */
export function horariosFestaDia(date: Date): string[] {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 1) return []; // Segunda-feira: encerrado
  if (dayOfWeek === 0 || dayOfWeek === 6 || eFeriado(date)) return HORARIOS_FIM_DE_SEMANA;
  return HORARIOS_SEMANA;
}

export interface HorarioFuncionamento {
  abertura: string;
  fecho: string;
}

/** Horário de funcionamento do parque num dia, ou null se estiver encerrado. */
export function horarioFuncionamentoDia(date: Date): HorarioFuncionamento | null {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 1) return null; // Segunda-feira: encerrado
  if (dayOfWeek === 0 || dayOfWeek === 6 || eFeriado(date)) return { abertura: '10:00', fecho: '20:00' };
  return { abertura: '14:00', fecho: '20:00' };
}

/** Data e hora atuais em Lisboa, independentemente do fuso do dispositivo. */
function agoraEmLisboa(agora: Date): { dia: Date; minutos: number } {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Lisbon',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(agora)
      .map((p) => [p.type, p.value])
  );
  return {
    dia: new Date(Number(partes.year), Number(partes.month) - 1, Number(partes.day)),
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

function paraMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export interface EstadoHorarioParque {
  aberto: boolean;
  /** Horário de hoje, ou null se hoje estiver encerrado. */
  hoje: HorarioFuncionamento | null;
  /** Próxima abertura, quando o parque está fechado (ex.: "amanhã às 14:00"). */
  proximaAbertura: string | null;
}

/** Indica se o parque está dentro do horário de funcionamento (hora de Lisboa). */
export function estadoHorarioParque(agora: Date = new Date()): EstadoHorarioParque {
  const { dia, minutos } = agoraEmLisboa(agora);
  const hoje = horarioFuncionamentoDia(dia);
  const aberto = !!hoje && minutos >= paraMinutos(hoje.abertura) && minutos < paraMinutos(hoje.fecho);
  if (aberto) return { aberto, hoje, proximaAbertura: null };

  if (hoje && minutos < paraMinutos(hoje.abertura)) {
    return { aberto, hoje, proximaAbertura: `hoje às ${hoje.abertura}` };
  }

  for (let i = 1; i <= 7; i++) {
    const outroDia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + i);
    const horario = horarioFuncionamentoDia(outroDia);
    if (!horario) continue;
    const quando =
      i === 1 ? 'amanhã' : outroDia.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
    return { aberto, hoje, proximaAbertura: `${quando} às ${horario.abertura}` };
  }
  return { aberto, hoje, proximaAbertura: null };
}

/** "14:00" → "14:00 – 16:00" */
export function rotuloHorario(inicio: string): string {
  const [h, m] = inicio.split(':').map(Number);
  return `${inicio} – ${String(h + 2).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Horários de início livres para festas num dia. Só o próprio horário de uma festa
 * confirmada fica ocupado; horários diferentes podem sobrepor-se.
 */
export async function obterHorariosDisponiveis(date: Date): Promise<string[]> {
  const allSlots = horariosFestaDia(date);
  if (allSlots.length === 0) return [];

  const { data, error } = await supabase.rpc('obter_horarios_ocupados', { p_data: dataISO(date) });
  if (error) throw error;

  const occupiedHours = ((data as { hora: string }[]) || []).map((r) => r.hora);
  return allSlots.filter((slot) => !occupiedHours.includes(slot));
}

export interface ResumoDia {
  horasPendentes: string[];
  festasConfirmadas: number;
}

/** Pedidos pendentes e festas confirmadas num dia, para o aviso da página de marcação. */
export async function obterResumoDia(date: Date): Promise<ResumoDia> {
  const { data, error } = await supabase.rpc('resumo_marcacoes_dia', { p_data: dataISO(date) });
  if (error) throw error;

  const linha = (data as { horas_pendentes: string[] | null; festas_confirmadas: number }[] | null)?.[0];
  return {
    horasPendentes: linha?.horas_pendentes ?? [],
    festasConfirmadas: linha?.festas_confirmadas ?? 0,
  };
}
