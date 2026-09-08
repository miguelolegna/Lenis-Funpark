import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquare,
  CheckCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAdminNotifications, type AdminNotification, type NotificationType } from '../../hooks/useAdminNotifications';

interface NotificationPopoverProps {
  variant?: 'sidebar' | 'icon';
  onCloseParentDrawer?: () => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return 'agora mesmo';
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

function getNotificationConfig(type: NotificationType) {
  switch (type) {
    case 'NOVA_RESERVA':
      return {
        icon: Sparkles,
        bgClass: 'bg-amber-100 text-amber-800 border-amber-200',
        badgeLabel: 'Nova Reserva',
      };
    case 'FORMULARIO_CONCLUIDO':
      return {
        icon: CheckCircle2,
        bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        badgeLabel: 'Formulário Selado',
      };
    case 'DEPOSITO_PENDENTE':
      return {
        icon: Clock,
        bgClass: 'bg-blue-100 text-blue-800 border-blue-200',
        badgeLabel: 'Sinal Pendente',
      };
    case 'NOVO_CONTACTO':
      return {
        icon: MessageSquare,
        bgClass: 'bg-purple-100 text-purple-800 border-purple-200',
        badgeLabel: 'Contacto',
      };
  }
}

export default function NotificationPopover({
  variant = 'sidebar',
  onCloseParentDrawer,
}: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectNotification = (item: AdminNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (onCloseParentDrawer) onCloseParentDrawer();
    navigate(item.link);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Botão Disparador */}
      {variant === 'sidebar' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-150 border ${
            isOpen
              ? 'bg-primary/10 border-primary/30 text-primary shadow-xs'
              : 'bg-surface-alt/70 hover:bg-surface-alt border-surface-alt text-secondary'
          }`}
          aria-expanded={isOpen}
          aria-label="Abrir painel de notificações"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className={`w-4 h-4 ${isOpen ? 'text-primary' : 'text-secondary/70'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              )}
            </div>
            <span className="text-xs font-bold">Notificações</span>
          </div>

          {unreadCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[11px] font-black tracking-tight shadow-xs">
              {unreadCount}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-secondary/40">0</span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 rounded-xl transition-colors ${
            isOpen ? 'bg-surface-alt text-primary' : 'text-secondary hover:bg-surface-alt'
          }`}
          aria-expanded={isOpen}
          aria-label="Ver notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Painel Flutuante (Popover) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 bg-white rounded-3xl shadow-2xl border-2 border-surface-alt w-[340px] sm:w-[380px] overflow-hidden ${
              variant === 'sidebar'
                ? 'left-0 sm:left-2 top-full mt-2'
                : 'right-0 top-full mt-2'
            }`}
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header do Popover */}
            <div className="p-4 border-b border-surface-alt bg-surface/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-secondary">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-accent/15 text-accent border border-accent/20">
                    {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1 rounded-lg"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Marcar lidas</span>
                </button>
              )}
            </div>

            {/* Lista de Alertas */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-alt p-2">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-3 text-secondary/40">
                    <BellOff className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-secondary">Tudo calmo por aqui!</h4>
                  <p className="text-xs text-secondary/60 mt-1">
                    Não existem novas reservas pendentes ou mensagens por responder.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const config = getNotificationConfig(item.type);
                  const Icon = config.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNotification(item)}
                      className={`group p-3 rounded-2xl cursor-pointer transition-all duration-150 flex items-start gap-3 hover:bg-surface-alt/70 ${
                        item.isRead ? 'opacity-70 bg-transparent' : 'bg-primary/5'
                      }`}
                    >
                      {/* Ícone contextual */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.bgClass}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary/50">
                            {config.badgeLabel}
                          </span>
                          <span className="text-[10px] font-medium text-secondary/40 shrink-0">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                        </div>

                        <h4
                          className={`text-xs truncate mt-0.5 ${
                            item.isRead ? 'font-semibold text-secondary' : 'font-black text-secondary'
                          }`}
                        >
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-secondary/70 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Indicador de não lida ou seta */}
                      <div className="self-center shrink-0">
                        {!item.isRead ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-accent block" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-secondary/30 group-hover:text-secondary/70 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer com atalhos rápidos */}
            <div className="p-3 border-t border-surface-alt bg-surface/50 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onCloseParentDrawer) onCloseParentDrawer();
                  navigate('/admin/reservas');
                }}
                className="font-bold text-secondary/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Gestão Reservas</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onCloseParentDrawer) onCloseParentDrawer();
                  navigate('/admin/contactos');
                }}
                className="font-bold text-secondary/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Mensagens</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
