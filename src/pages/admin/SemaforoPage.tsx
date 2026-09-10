import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useParkStatus } from '../../hooks/useParkStatus';

export default function SemaforoPage() {
  const { status: parkStatus } = useParkStatus();
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);

  // Garante que a sessão de admin guardada no browser é restaurada no cliente Supabase
  const ensureAuthenticatedSession = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        return sessionData.session;
      }
      const saved = localStorage.getItem('admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.access_token && parsed?.refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          });
          if (!error && data?.session) {
            return data.session;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar sessão de admin:', e);
    }
    return null;
  };

  // Buscar metadados de última alteração
  const fetchStatusMeta = useCallback(async () => {
    try {
      await ensureAuthenticatedSession();
      const { data, error } = await supabase
        .from('park_status')
        .select('updated_at, updated_by')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        setUpdatedAt(data.updated_at);
        if (data.updated_by) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user && userData.user.id === data.updated_by) {
            setUpdatedBy(userData.user.email || 'Administrador');
          } else {
            setUpdatedBy('Equipa Leni\'s');
          }
        } else {
          setUpdatedBy('Sistema');
        }
      }
    } catch (err) {
      console.error('Erro ao consultar metadados do semáforo:', err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStatusMeta();
  }, [fetchStatusMeta, parkStatus]);

  const handleUpdateStatus = async (novoEstadoDB: 'LIVRE' | 'MODERADO' | 'CHEIO' | 'FECHADO') => {
    setUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // 1. Assegurar sessão ativa para passar a política RLS (authenticated)
      const session = await ensureAuthenticatedSession();
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = session?.user?.id || userData?.user?.id || null;

      // 2. Executar update e verificar linhas alteradas via .select()
      const { data: updatedRows, error } = await supabase
        .from('park_status')
        .update({
          estado: novoEstadoDB,
          updated_by: currentUserId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select();

      if (error) {
        console.error('Erro ao atualizar estado:', error);
        setErrorMsg('Falha ao atualizar: ' + error.message);
      } else if (!updatedRows || updatedRows.length === 0) {
        console.warn('Nenhuma linha foi alterada no park_status. Verifique a sessão admin.');
        setErrorMsg('Sem permissão de escrita na BD. Inicie sessão como Admin (/admin/login) para renovar as credenciais.');
      } else {
        setSuccessMsg(`Estado alterado para ${novoEstadoDB}`);
        fetchStatusMeta();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      console.error('Erro de ligação:', err);
      setErrorMsg('Erro de ligação ao tentar atualizar.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-4 sm:p-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center"
    >
      <div className="relative w-full max-w-md bg-white p-8 rounded-3xl border-2 border-surface-alt shadow-sm text-center">
        {/* Caixa flutuante de verificação que sobrepõe o componente */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 left-6 right-6 z-30 p-3 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 left-6 right-6 z-30 p-3 bg-rose-600 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs font-bold"
            >
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Título Direto */}
        <h1 className="text-2xl font-black text-secondary">Definir Novo Estado</h1>
        <p className="text-xs text-secondary/60 font-medium mt-1 mb-6">
          Clica diretamente na cor para atualizar a lotação pública
        </p>

        {/* O Semáforo Interativo */}
        <div
          role="group"
          aria-label="Controlo de Lotação"
          className="bg-secondary p-6 rounded-3xl shadow-xl border-4 border-surface-alt w-48 mx-auto flex flex-col items-center gap-5"
        >
          {/* Luz Verde: LIVRE */}
          <button
            type="button"
            role="button"
            aria-pressed={parkStatus === 'Livre'}
            aria-label="Definir lotação como Livre"
            disabled={updating}
            onClick={() => handleUpdateStatus('LIVRE')}
            title="Definir como Livre (Verde)"
            className="relative rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-primary focus-visible:outline-none"
          >
            {parkStatus === 'Livre' ? (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full bg-primary shadow-[0_0_35px_var(--color-primary)] ring-4 ring-primary/50 flex items-center justify-center text-[11px] font-black text-white uppercase tracking-wider"
              >
                Livre
              </motion.div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/25 hover:bg-primary/50 transition-colors flex items-center justify-center text-[11px] font-bold text-white/50 uppercase tracking-wider">
                Livre
              </div>
            )}
          </button>

          {/* Luz Amarela: MODERADO */}
          <button
            type="button"
            role="button"
            aria-pressed={parkStatus === 'Moderado'}
            aria-label="Definir lotação como Moderado"
            disabled={updating}
            onClick={() => handleUpdateStatus('MODERADO')}
            title="Definir como Moderado (Amarelo)"
            className="relative rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            {parkStatus === 'Moderado' ? (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full bg-yellow-400 shadow-[0_0_35px_#facc15] ring-4 ring-yellow-400/50 flex items-center justify-center text-[10px] font-black text-secondary uppercase tracking-wider"
              >
                Moderado
              </motion.div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-yellow-400/25 hover:bg-yellow-400/50 transition-colors flex items-center justify-center text-[10px] font-bold text-white/50 uppercase tracking-wider">
                Moderado
              </div>
            )}
          </button>

          {/* Luz Vermelha: CHEIO */}
          <button
            type="button"
            role="button"
            aria-pressed={parkStatus === 'Cheio'}
            aria-label="Definir lotação como Cheio"
            disabled={updating}
            onClick={() => handleUpdateStatus('CHEIO')}
            title="Definir como Cheio (Vermelho)"
            className="relative rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-red-500 focus-visible:outline-none"
          >
            {parkStatus === 'Cheio' ? (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full bg-red-500 shadow-[0_0_35px_#ef4444] ring-4 ring-red-500/50 flex items-center justify-center text-[11px] font-black text-white uppercase tracking-wider"
              >
                Cheio
              </motion.div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-500/25 hover:bg-red-500/50 transition-colors flex items-center justify-center text-[11px] font-bold text-white/50 uppercase tracking-wider">
                Cheio
              </div>
            )}
          </button>

          {/* Botão Fechado */}
          <button
            type="button"
            role="button"
            aria-pressed={parkStatus === 'Fechado'}
            aria-label="Definir parque como Fechado"
            disabled={updating}
            onClick={() => handleUpdateStatus('FECHADO')}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
              parkStatus === 'Fechado'
                ? 'bg-white text-secondary shadow-md ring-2 ring-white/60'
                : 'bg-white/15 text-white/60 hover:bg-white/30 hover:text-white'
            }`}
          >
            Fechado
          </button>
        </div>

        {/* Estado Ativo e Auditoria */}
        <div className="mt-6 pt-5 border-t border-surface-alt space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-secondary">
            <span className="text-secondary/60">Estado ativo:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black ${
                parkStatus === 'Livre'
                  ? 'bg-primary/15 text-primary border border-primary/25'
                  : parkStatus === 'Moderado'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : parkStatus === 'Cheio'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-secondary border border-gray-300'
              }`}
            >
              {parkStatus}
            </span>
          </div>

          {updatedAt && (
            <p className="text-[11px] font-medium text-secondary/50">
              Última alteração:{' '}
              {new Date(updatedAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}{' '}
              ({new Date(updatedAt).toLocaleDateString('pt-PT')})
              {updatedBy ? ` por ${updatedBy}` : ''}
            </p>
          )}

          {updating && (
            <p className="text-xs font-bold text-primary animate-pulse">
              A atualizar na base de dados...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
