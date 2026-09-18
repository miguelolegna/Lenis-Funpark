import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Lock,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { pageVariants, pageTransition } from '../../lib/animations';
import { supabase } from '../../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_current: boolean;
}

async function callManageAdmins<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('manage_admins', { body });
  if (error) {
    let message = error.message;
    try {
      const payload = await (error as { context?: Response }).context?.json();
      if (payload?.error) message = payload.error;
    } catch { /* manter a mensagem genérica */ }
    throw new Error(message);
  }
  return data as T;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { admins: list } = await callManageAdmins<{ admins: AdminUser[] }>({ action: 'list' });
      setAdmins(list);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao carregar admins: ' + (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = newEmail.trim().toLowerCase();
    if (!emailTrimmed || !newPassword) return;

    setActionLoading(true);
    setFeedback(null);

    try {
      await callManageAdmins({ action: 'create', email: emailTrimmed, password: newPassword });
      await fetchAdmins();
      setFeedback({
        type: 'success',
        message: `Administrador "${emailTrimmed}" criado com sucesso.`,
      });
      setNewEmail('');
      setNewPassword('');
      setModalOpen(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao criar admin: ' + (err as Error).message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (admin.is_current) {
      alert('Não podes remover a tua própria conta de administrador enquanto a sessão estiver ativa.');
      return;
    }

    const confirmou = window.confirm(
      `Tens a certeza absoluta que desejas revogar o acesso do administrador ${admin.email}?`
    );
    if (!confirmou) return;

    try {
      await callManageAdmins({ action: 'delete', id: admin.id });
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      setFeedback({
        type: 'success',
        message: `Acesso do administrador ${admin.email} revogado com sucesso.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao remover admin: ' + (err as Error).message });
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-surface-alt">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Segurança & Acessos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary mt-1">
            Gestão de Administradores
          </h1>
          <p className="text-sm text-secondary/60 font-medium mt-0.5">
            Controlo de acessos, contas ativas e permissões de back-office
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setNewEmail('');
              setNewPassword('');
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Admin</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-red-100 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-700" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline cursor-pointer">
            Dispensar
          </button>
        </div>
      )}

      {/* Tabela de Administradores */}
      <div className="bg-white rounded-3xl border-2 border-surface-alt shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-alt bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-secondary">Utilizadores com Permissão</h2>
              <p className="text-xs text-secondary/60">
                Lista de contas autorizadas no sistema de autenticação
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-secondary/60">
            {admins.length} {admins.length === 1 ? 'admin registado' : 'admins registados'}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-secondary/50 font-medium">A carregar administradores...</p>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-white text-secondary/60 border-b border-surface-alt">
                <tr>
                  <th className="p-4 font-bold">Email do Administrador</th>
                  <th className="p-4 font-bold">Identificador (UUID)</th>
                  <th className="p-4 font-bold">Data de Criação</th>
                  <th className="p-4 font-bold">Último Login</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-alt">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-surface-alt/50 transition-colors">
                    {/* Email e Badge de Sessão */}
                    <td className="p-4 font-bold text-secondary">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-secondary/40 flex-shrink-0" />
                        <span>{adm.email}</span>
                        {adm.is_current && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                            Sessão Atual
                          </span>
                        )}
                      </div>
                    </td>

                    {/* UUID */}
                    <td className="p-4 font-mono text-[11px] text-secondary/60">
                      <span className="bg-surface-alt/70 px-2 py-1 rounded-md border border-surface-alt">
                        {adm.id}
                      </span>
                    </td>

                    {/* Data de Criação */}
                    <td className="p-4 text-secondary/70 font-medium whitespace-nowrap">
                      {new Date(adm.created_at).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Último Login */}
                    <td className="p-4 text-secondary/70 font-medium whitespace-nowrap">
                      {adm.last_sign_in_at ? (
                        <span>
                          {new Date(adm.last_sign_in_at).toLocaleDateString('pt-PT', { dateStyle: 'short' })}{' '}
                          <span className="text-secondary/50 text-[11px]">
                            ({new Date(adm.last_sign_in_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </span>
                      ) : (
                        <span className="text-secondary/40 italic">Nunca acedeu</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={adm.is_current}
                        onClick={() => handleRemoveAdmin(adm)}
                        title={adm.is_current ? 'Não podes remover a sessão atual' : 'Revogar acesso deste administrador'}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          adm.is_current
                            ? 'opacity-30 cursor-not-allowed text-secondary/50'
                            : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Adicionar Admin */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-secondary/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-surface-alt space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-alt pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-primary">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-secondary">Novo Administrador</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-secondary/60 hover:text-secondary rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-secondary/70 leading-relaxed font-medium">
              A nova conta pode entrar logo no painel de administração com este email e password.
            </p>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1">
                  Email de Acesso *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="exemplo@lenisfunpark.pt"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold text-secondary placeholder-secondary/40 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-surface-alt text-secondary text-xs sm:text-sm font-bold rounded-xl hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-secondary transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'A adicionar...' : 'Adicionar Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
