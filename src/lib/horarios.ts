import { supabase } from './supabase';

/**
 * Horários de início livres para festas num dia. O parque fecha à segunda; o último
 * slot é às 18:00 porque as festas duram 2h e o parque fecha às 20:00.
 */
export async function obterHorariosDisponiveis(date: Date): Promise<string[]> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const { data, error } = await supabase.rpc('obter_horarios_ocupados', { p_data: `${year}-${month}-${day}` });
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
