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
