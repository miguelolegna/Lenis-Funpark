import { useState, useEffect } from 'react';

type LotacaoStatus = 'livre' | 'composto' | 'cheio';

export function useParkStatus() {
  const [status, setStatus] = useState<LotacaoStatus>(
    (localStorage.getItem('mock_park_status') as LotacaoStatus) || 'livre'
  );

  useEffect(() => {
    // Simulador de Supabase Realtime via Eventos locais
    const handleStatusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.status) {
        setStatus(customEvent.detail.status);
      }
    };

    window.addEventListener('mock_park_status_update', handleStatusUpdate);
    return () => window.removeEventListener('mock_park_status_update', handleStatusUpdate);
  }, []);

  return status;
}
