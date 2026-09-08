import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export type NotificationType =
  | 'NOVA_RESERVA'
  | 'FORMULARIO_CONCLUIDO'
  | 'DEPOSITO_PENDENTE'
  | 'NOVO_CONTACTO';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  link: string;
  isRead: boolean;
  priority: 'high' | 'normal';
  rawId: string;
}

const STORAGE_KEY_READ = 'lenis_admin_notifications_read';
const STORAGE_KEY_MESSAGES = 'admin_mensagens';

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
  const [loading, setLoading] = useState(true);
  const [, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_READ);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isInitialMount = useRef(true);

  // Carrega as notificações atuais a partir da BD (reservas) e do storage (mensagens)
  const fetchNotifications = useCallback(async (isRealtimeUpdate = false) => {
    try {
      // 1. Reservas da base de dados Supabase
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('id, estado, nome_aniversariante, data_evento, num_criancas, is_locked, termos_veracidade, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar reservas para notificações:', error);
      }

      const items: AdminNotification[] = [];

      if (reservas) {
        reservas.forEach((r) => {
          const rawDate = r.created_at || r.updated_at || new Date().toISOString();

          // Evento 1: Nova Reserva Pendente de Aprovação
          if (r.estado === 'PENDING_APPROVAL') {
            const notifId = `nova-reserva-${r.id}`;
            items.push({
              id: notifId,
              type: 'NOVA_RESERVA',
              title: `Nova Reserva: ${r.nome_aniversariante || 'Sem Nome'}`,
              description: `${r.data_evento ? `Festa a ${r.data_evento}` : 'Data a definir'} • ${r.num_criancas || 0} crianças`,
              timestamp: rawDate,
              link: '/admin/reservas',
              isRead: false, // preenchido abaixo
              priority: 'high',
              rawId: r.id,
            });
          }

          // Evento 2: Formulário Selado / Concluído pelo Cliente
          if (r.is_locked || r.termos_veracidade || r.estado === 'COMPLETED') {
            const notifId = `selada-${r.id}`;
            items.push({
              id: notifId,
              type: 'FORMULARIO_CONCLUIDO',
              title: `Formulário Selado: ${r.nome_aniversariante || 'Cliente'}`,
              description: 'O cliente concluiu e confirmou a ficha de festa.',
              timestamp: r.updated_at || rawDate,
              link: '/admin/reservas',
              isRead: false,
              priority: 'normal',
              rawId: r.id,
            });
          }

          // Evento 3: Depósito Pendente (Aprovada a aguardar pagamento de sinal)
          if (r.estado === 'AWAITING_DEPOSIT') {
            const notifId = `deposito-${r.id}`;
            items.push({
              id: notifId,
              type: 'DEPOSITO_PENDENTE',
              title: `Sinal Pendente: ${r.nome_aniversariante || 'Cliente'}`,
              description: 'Reserva aprovada aguarda comprovativo de depósito.',
              timestamp: r.updated_at || rawDate,
              link: '/admin/reservas',
              isRead: false,
              priority: 'high',
              rawId: r.id,
            });
          }
        });
      }

      // Evento 4: Mensagens de Contacto pendentes (Escolas, Instituições, Geral)
      try {
        const { data: dbMsgs } = await supabase
          .from('mensagens_contacto')
          .select('id, nome, motivo, mensagem, created_at, respondido')
          .eq('respondido', false)
          .order('created_at', { ascending: false });

        if (dbMsgs && dbMsgs.length > 0) {
          dbMsgs.forEach((m) => {
            const notifId = `contacto-${m.id}`;
            items.push({
              id: notifId,
              type: 'NOVO_CONTACTO',
              title: `Mensagem: ${m.nome}`,
              description: m.motivo || (m.mensagem ? m.mensagem.slice(0, 50) + '...' : 'Novo pedido de contacto recebido.'),
              timestamp: m.created_at || new Date().toISOString(),
              link: '/admin/contactos',
              isRead: false,
              priority: 'normal',
              rawId: m.id,
            });
          });
        } else {
          // Fallback para localStorage caso ainda não haja dados no Supabase
          const savedMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
          if (savedMsgs) {
            const msgs = JSON.parse(savedMsgs);
            if (Array.isArray(msgs)) {
              msgs
                .filter((m: { respondido?: boolean }) => !m.respondido)
                .forEach((m: { id: string; nome: string; assunto?: string; mensagem?: string; data?: string }) => {
                  const notifId = `contacto-${m.id}`;
                  items.push({
                    id: notifId,
                    type: 'NOVO_CONTACTO',
                    title: `Mensagem: ${m.nome}`,
                    description: m.assunto || (m.mensagem ? m.mensagem.slice(0, 50) + '...' : 'Novo pedido de contacto recebido.'),
                    timestamp: m.data || new Date().toISOString(),
                    link: '/admin/contactos',
                    isRead: false,
                    priority: 'normal',
                    rawId: m.id,
                  });
                });
            }
          }
        }
      } catch (e) {
        console.error('Erro ao ler mensagens de contacto:', e);
      }

      // Ordenar por data mais recente
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Atribuir estado de leitura
      const savedReadIds = (() => {
        try {
          const s = localStorage.getItem(STORAGE_KEY_READ);
          return s ? JSON.parse(s) : [];
        } catch {
          return [];
        }
      })();

      const finalItems = items.map((item) => ({
        ...item,
        isRead: savedReadIds.includes(item.id),
      }));

      setNotifications(finalItems);

      // Tocar aviso sonoro se for um update em tempo real e existirem novos itens não lidos
      if (isRealtimeUpdate && !isInitialMount.current) {
        const hasUnread = finalItems.some((item) => !item.isRead);
        if (hasUnread) {
          playNotificationChime();
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar notificações:', err);
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, []);

  // Sincronizar leitura com localStorage
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(allIds));
    } catch (e) {
      console.error(e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [notifications]);

  // Efeito de inicialização e subscrição Realtime
  useEffect(() => {
    fetchNotifications();

    // 1. Subscrição Supabase Realtime para a tabela reservas
    const channel = supabase
      .channel('admin_notifs_reservas_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservas',
        },
        () => {
          fetchNotifications(true);
        }
      )
      .subscribe();

    // 2. Subscrição Supabase Realtime para a tabela mensagens_contacto
    const msgChannel = supabase
      .channel('admin_notifs_mensagens_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens_contacto',
        },
        () => {
          fetchNotifications(true);
        }
      )
      .subscribe();

    // 3. Ouvir evento de mensagens de contacto do admin (localStorage/custom)
    const handleMessagesUpdate = () => {
      fetchNotifications(false);
    };

    window.addEventListener('admin_messages_updated', handleMessagesUpdate);
    window.addEventListener('storage', handleMessagesUpdate);

    // 4. Fallback de polling a cada 30 segundos
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(msgChannel);
      window.removeEventListener('admin_messages_updated', handleMessagesUpdate);
      window.removeEventListener('storage', handleMessagesUpdate);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: () => fetchNotifications(false),
  };
}

export default useAdminNotifications;
