import { supabase } from './supabase';

function dataISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Horários de início livres para festas num dia. O parque fecha à segunda; o último
 * slot é às 18:00 porque as festas duram 2h e o parque fecha às 20:00.
 * Os horários a menos de 3h de uma festa confirmada vêm da base de dados como ocupados.
 */
export async function obterHorariosDisponiveis(date: Date): Promise<string[]> {
  const { data, error } = await supabase.rpc('obter_horarios_ocupados', { p_data: dataISO(date) });
  if (error) throw error;

  const occupiedHours = ((data as { hora: string }[]) || []).map((r) => r.hora);

  const dayOfWeek = date.getDay();
  let allSlots: string[] = [];
  if (dayOfWeek >= 2 && dayOfWeek <= 5) {
    allSlots = ['14:00', '15:00', '16:00', '17:00', '18:00'];
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  }

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
