import { useState, useEffect, useCallback } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Registo partilhado por todos os admins: lida e apagada contam para toda a equipa.
// As notificações são criadas por triggers na base de dados (migração 41).
export interface AdminNotification {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  link: string | null;
  autor: string | null;
  lida: boolean;
  created_at: string;
}

const LIMITE = 100;

// O painel existe em duas instâncias (menu móvel e barra lateral): o som só toca uma vez por notificação
const notificacoesComSom = new Set<string>();

/**
 * Toca um aviso sonoro elegante e suave através da Web Audio API
 * (dois tons em harmonia de marimba: D5 -> A5)
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tom 1 (D5 ~ 587Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tom 2 (A5 ~ 880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch {
    // Ignorado se bloqueado pela política de reprodução automática do browser
  }
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const [lista, naoLidas] = await Promise.all([
      supabase.from('notificacoes').select('*').order('created_at', { ascending: false }).limit(LIMITE),
      supabase.from('notificacoes').select('id', { count: 'exact', head: true }).eq('lida', false),
    ]);
    setLoading(false);

    const falha = lista.error ?? naoLidas.error;
    if (falha) {
      console.error('[Notificações] Erro ao carregar notificações:', falha.code, falha.message);
      setErro('Não foi possível carregar as notificações.');
      return;
    }
    setErro(null);
    setNotifications((lista.data ?? []) as AdminNotification[]);
    setUnreadCount(naoLidas.count ?? 0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar();

    let emailAtual: string | null = null;
    void supabase.auth.getSession().then(({ data }) => {
      emailAtual = data.session?.user.email ?? null;
    });

    const channel = supabase
      .channel(`admin_notificacoes_${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const nova = payload.new as AdminNotification;
          // Sem som para as ações do próprio admin
          if (nova.autor !== emailAtual && !notificacoesComSom.has(nova.id)) {
            notificacoesComSom.add(nova.id);
            playNotificationChime();
          }
        }
        void carregar();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregar]);

  const executar = useCallback(
    async (pedido: PromiseLike<{ error: PostgrestError | null }>, descricao: string, mensagem: string) => {
      const { error } = await pedido;
      if (error) {
        console.error(`[Notificações] Erro ao ${descricao}:`, error.code, error.message);
        setErro(mensagem);
      }
      void carregar();
    },
    [carregar]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
      return executar(
        supabase.from('notificacoes').update({ lida: true }).eq('id', id),
        'marcar como lida',
        'Não foi possível marcar a notificação como lida.'
      );
    },
    [executar]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
    setUnreadCount(0);
    return executar(
      supabase.from('notificacoes').update({ lida: true }).eq('lida', false),
      'marcar todas como lidas',
      'Não foi possível marcar as notificações como lidas.'
    );
  }, [executar]);

  const remove = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      return executar(
        supabase.from('notificacoes').delete().eq('id', id),
        'apagar notificação',
        'Não foi possível apagar a notificação.'
      );
    },
    [executar]
  );

  const removeAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    return executar(
      supabase.from('notificacoes').delete().not('id', 'is', null),
      'apagar todas as notificações',
      'Não foi possível apagar as notificações.'
    );
  }, [executar]);

  return {
    notifications,
    unreadCount,
    loading,
    erro,
    markAsRead,
    markAllAsRead,
    remove,
    removeAll,
  };
}

export default useAdminNotifications;
