import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type ParkStatus = 'Livre' | 'Moderado' | 'Cheio' | 'Fechado';

export interface UseParkStatusResult {
  status: ParkStatus;
  loading: boolean;
}

/**
 * Converte o valor em maiúsculas da BD ('LIVRE', 'MODERADO', 'CHEIO', 'FECHADO')
 * para a capitalização esperada no frontend ('Livre' | 'Moderado' | 'Cheio' | 'Fechado').
 */
function parseParkStatus(rawEstado?: string | null): ParkStatus {
  switch (rawEstado?.toUpperCase()) {
    case 'MODERADO':
      return 'Moderado';
    case 'CHEIO':
      return 'Cheio';
    case 'FECHADO':
      return 'Fechado';
    case 'LIVRE':
    default:
      return 'Livre';
  }
}

export function useParkStatus(): UseParkStatusResult {
  const [status, setStatus] = useState<ParkStatus>('Livre');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Leitura inicial do estado atual (linha única id = 1)
    const fetchCurrentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('park_status')
          .select('estado')
          .eq('id', 1)
          .maybeSingle();

        if (error) {
          console.error('Erro ao ler estado do parque:', error);
        } else if (data?.estado && isMounted) {
          setStatus(parseParkStatus(data.estado));
        }
      } catch (err) {
        console.error('Erro inesperado ao consultar park_status:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentStatus();

    // 2. Subscrição Realtime para atualizações automáticas
    const channelId = Math.random().toString(36).substring(2, 9);
    const channel = supabase
      .channel(`park_status_realtime_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'park_status',
          filter: 'id=eq.1',
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'estado' in payload.new) {
            const novoEstado = (payload.new as { estado?: string }).estado;
            if (isMounted) {
              setStatus(parseParkStatus(novoEstado));
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { status, loading };
}

export default useParkStatus;
