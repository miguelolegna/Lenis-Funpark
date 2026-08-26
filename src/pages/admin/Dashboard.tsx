import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../lib/animations';

import HeaderSection from '../../sections/admin/dashboard/HeaderSection';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<any>(null);

  const fetchReservas = async () => {
    setLoading(true);
    // 1. SELECT: Fetch à tabela com RLS ativo para a role 'authenticated'
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('data_evento', { ascending: true });
      
    if (error) {
      console.error('Erro ao buscar reservas:', error);
    } else {
      setReservas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  // 2. UPDATE (Aprovação)
  const handleAprovar = async (id: string) => {
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'AWAITING_DEPOSIT' })
      .eq('id', id);

    if (error) {
      console.error('Erro ao aprovar reserva:', error);
      alert('Erro ao aprovar a reserva.');
    } else {
      // O motor SQL já resolveu colisões de agenda via trigger
      fetchReservas(); 
    }
  };

  // 3. Formulário Complementar (Edição via modal inline)
  const handleUpdateReserva = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedReserva) return;

    const formData = new FormData(e.currentTarget);
    const bolo = formData.get('bolo') === 'on';
    const boloComposicao = formData.get('bolo_composicao') as string;
    const numCriancas = parseInt(formData.get('num_criancas') as string, 10);
    const menuEscolhido = formData.get('menu_escolhido') as string;

    const updates: any = {
      bolo,
      bolo_composicao: boloComposicao || null,
      num_criancas: isNaN(numCriancas) ? null : numCriancas,
    };

    if (menuEscolhido) {
      updates.menu_escolhido = menuEscolhido;
    }

    const { error } = await supabase
      .from('reservas')
      .update(updates)
      .eq('id', selectedReserva.id);

    if (error) {
      console.error("Erro de Transação SQL:", error);
      
      // Captura da violação da CHECK constraint
      if (error.message.includes('check_bolo_composicao')) {
        alert("A composição do bolo é obrigatória quando a opção de bolo está ativa.");
      } else {
        alert("Ocorreu um erro ao atualizar a reserva: " + error.message);
      }
    } else {
      alert("Reserva atualizada com sucesso!");
      setSelectedReserva(null);
      fetchReservas();
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full min-h-screen bg-surface p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <HeaderSection onLogout={async () => {
          await supabase.auth.signOut();
          window.location.href = '/admin';
        }} />

        <div className="bg-white rounded-3xl shadow-sm border-2 border-surface-alt overflow-hidden">
          <div className="p-6 border-b border-surface-alt bg-surface">
            <h2 className="text-xl font-black text-secondary">Marcações e Estado</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-8 text-center text-secondary/50 font-medium">A carregar registos autorizados...</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white text-secondary/60 text-sm border-b border-surface-alt">
                  <tr>
                    <th className="p-4 font-bold">Data Evento</th>
                    <th className="p-4 font-bold">Aniversariante</th>
                    <th className="p-4 font-bold">Contacto</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold">Ações Restritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-alt">
                  {reservas.map(r => (
                    <tr key={r.id} className="hover:bg-surface-alt transition-colors">
                      <td className="p-4 font-medium">{new Date(r.data_evento).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short'})}</td>
                      <td className="p-4">{r.nome_aniversariante}</td>
                      <td className="p-4">{r.contacto_cliente}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.estado === 'PENDING_APPROVAL' ? 'bg-orange-100 text-orange-700' :
                          r.estado === 'AWAITING_DEPOSIT' ? 'bg-blue-100 text-blue-700' :
                          r.estado === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-surface-alt text-secondary'
                        }`}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="p-4 space-x-2 flex items-center">
                        {r.estado === 'PENDING_APPROVAL' && (
                          <button 
                            onClick={() => handleAprovar(r.id)}
                            className="px-3 py-1 bg-primary text-white text-sm font-bold rounded-lg hover:bg-secondary transition-colors shadow-sm"
                          >
                            Aprovar Reserva
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedReserva(r)}
                          className="px-3 py-1 bg-surface border-2 border-surface-alt text-secondary text-sm font-bold rounded-lg hover:bg-surface-alt transition-colors"
                        >
                          Adicionar Complementos
                        </button>
                        <a 
                          href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convite-digital?token=${r.id}`}
                          download
                          className="inline-block px-3 py-1 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent/80 transition-colors shadow-sm"
                        >
                          Transferir Convite
                        </a>
                      </td>
                    </tr>
                  ))}
                  {reservas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-secondary/50 font-medium">Sem registos encontrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Interativo do Formulário Complementar */}
        {selectedReserva && (
          <div className="fixed inset-0 bg-secondary/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border-4 border-surface-alt">
              <h3 className="text-2xl font-black text-secondary mb-6">
                Construção do Evento: <span className="text-primary">{selectedReserva.nome_aniversariante}</span>
              </h3>
              
              <form onSubmit={handleUpdateReserva} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Número Fixo de Crianças</label>
                  <input 
                    name="num_criancas" 
                    type="number" 
                    defaultValue={selectedReserva.num_criancas || ''}
                    className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Atribuição de Menu</label>
                  <select 
                    name="menu_escolhido" 
                    defaultValue={selectedReserva.menu_escolhido || ''}
                    className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-medium"
                  >
                    <option value="">Sem menu definido</option>
                    <option value="MENU_11_50">Menu Base (11.50€)</option>
                    <option value="MENU_13_50">Menu Premium (13.50€)</option>
                  </select>
                </div>

                <div className="p-4 bg-surface rounded-xl border-2 border-surface-alt">
                  <div className="flex items-center space-x-3 mb-3">
                    <input 
                      type="checkbox" 
                      name="bolo" 
                      id="bolo"
                      defaultChecked={selectedReserva.bolo}
                      className="w-5 h-5 accent-primary cursor-pointer" 
                    />
                    <label htmlFor="bolo" className="font-bold text-secondary cursor-pointer">Requer Bolo de Aniversário</label>
                  </div>

                  <div>
                    <input 
                      name="bolo_composicao" 
                      type="text"
                      placeholder="Ex: Pão de ló com morangos e cobertura de chocolate"
                      defaultValue={selectedReserva.bolo_composicao || ''}
                      className="w-full bg-white border-2 border-surface-alt rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors placeholder-secondary/40" 
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedReserva(null)}
                    className="flex-1 py-4 bg-surface text-secondary font-bold rounded-xl border-2 border-surface-alt hover:bg-surface-alt transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-colors"
                  >
                    Comitar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
