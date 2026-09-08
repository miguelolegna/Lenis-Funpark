import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONE = 'Europe/Lisbon';

/**
 * Constrói a string ISO garantindo o offset correto do fuso horário 'Europe/Lisbon'
 * para a data e hora selecionadas pelo utilizador.
 *
 * Exemplo em horário de verão (WEST / UTC+1):
 *   14 de Maio de 2027 às 14:00 -> '2027-05-14T14:00:00+01:00'
 *
 * Exemplo em horário de inverno (WET / UTC+0):
 *   15 de Janeiro de 2027 às 14:00 -> '2027-01-15T14:00:00Z'
 */
export function buildLisbonDateTime(date: Date, timeStr: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateFormatted = `${year}-${month}-${day}`;

  // Cria a data/hora assumindo estritamente o fuso horário de Lisboa
  return dayjs.tz(`${dateFormatted} ${timeStr}:00`, TIMEZONE).format();
}

export { dayjs };
