export type MetodoPagamento = 'mbway' | 'transferencia' | 'dinheiro';

export const metodosPagamento: { id: MetodoPagamento; label: string; descricao: string }[] = [
  { id: 'mbway', label: 'MB WAY', descricao: 'Pagamento imediato pelo telemóvel' },
  { id: 'transferencia', label: 'Transferência', descricao: 'Transferência bancária por IBAN' },
  { id: 'dinheiro', label: 'Em dinheiro', descricao: 'Pagamento na receção do parque' },
];

export const MBWAY_NUMERO = '(+351) 911 855 496';
export const IBAN = 'PT50 3560 0001 9001 8810 5228 3';

export function eMetodoPagamento(valor: unknown): valor is MetodoPagamento {
  return valor === 'mbway' || valor === 'transferencia' || valor === 'dinheiro';
}

export function nomeMetodoPagamento(valor?: string | null) {
  return metodosPagamento.find((m) => m.id === valor)?.label ?? null;
}
