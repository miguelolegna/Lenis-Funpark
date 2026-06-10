import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LogOut, Calendar, Briefcase, RefreshCcw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'b2c' | 'b2b';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('b2c');
  const [bookings, setBookings] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      if (activeTab === 'b2c') {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setBookings(data || []);
      } else {
        const { data, error } = await supabase
          .from('event_quotes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setQuotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Erro ao carregar dados. Verifica a consola.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar estado.');
    }
  };

  const updateQuoteStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('event_quotes')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar estado.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'contactado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': case 'convertido': return 'bg-green-100 text-green-800';
      case 'cancelado': case 'recusado': return 'bg-red-100 text-red-800';
      case 'em_analise': return 'bg-purple-100 text-purple-800';
      case 'proposta_enviada': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-primary/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-inner">
            <span className="text-white font-extrabold text-lg">LF</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-secondary leading-tight">Área Reservada</h1>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Gestão Leni's FunPark</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-dark/70 hover:text-accent hover:bg-accent/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('b2c')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
              activeTab === 'b2c' 
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-white text-dark/60 hover:bg-white hover:text-secondary hover:shadow-sm'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Reservas Diretas (B2C)
          </button>
          <button
            onClick={() => setActiveTab('b2b')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
              activeTab === 'b2b' 
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-white text-dark/60 hover:bg-white hover:text-secondary hover:shadow-sm'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Orçamentos B2B
          </button>
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-primary/10 overflow-hidden">
          <div className="p-5 border-b border-primary/10 flex justify-between items-center bg-surface-alt/50">
            <h2 className="font-bold text-secondary text-lg">
              {activeTab === 'b2c' ? 'Últimas Reservas Submetidas' : 'Pedidos de Orçamento (Grupos/Escolas)'}
            </h2>
            <button onClick={fetchLeads} className="p-2.5 text-dark/50 hover:text-primary transition-colors rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-primary/10">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-dark/80">
                <thead className="bg-surface-alt/30 text-xs uppercase font-bold text-secondary">
                  <tr>
                    <th className="px-6 py-4">Data Submissão</th>
                    <th className="px-6 py-4">Cliente / Contacto</th>
                    <th className="px-6 py-4">Evento (Data/Turno)</th>
                    <th className="px-6 py-4">Detalhes</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {activeTab === 'b2c' ? (
                    bookings.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center font-medium text-dark/50">Nenhuma reserva encontrada.</td></tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-alt/20 transition-colors">
                          <td className="px-6 py-4 font-semibold whitespace-nowrap text-dark/70">
                            {new Date(b.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-secondary text-base">{b.client_name}</div>
                            <div className="text-xs font-semibold text-primary mt-0.5">{b.client_phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-dark">{new Date(b.target_date).toLocaleDateString('pt-PT')}</div>
                            <div className="text-xs font-bold text-secondary uppercase mt-0.5">{b.shift}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1.5 rounded-lg bg-surface-alt text-xs font-bold capitalize text-secondary border border-dark/5">
                              {b.party_type}
                            </span>
                            {b.participants_count && <div className="text-xs mt-1 text-dark/60 font-medium">{b.participants_count} pax</div>}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={b.status}
                              onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                              className={`text-sm font-bold border-0 rounded-xl py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none ${getStatusColor(b.status)}`}
                            >
                              <option value="pendente">Pendente</option>
                              <option value="contactado">Contactado</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    quotes.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center font-medium text-dark/50">Nenhum orçamento encontrado.</td></tr>
                    ) : (
                      quotes.map((q) => (
                        <tr key={q.id} className="hover:bg-surface-alt/20 transition-colors">
                          <td className="px-6 py-4 font-semibold whitespace-nowrap text-dark/70">
                            {new Date(q.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-secondary text-base">{q.company_name || q.responsible_name}</div>
                            <div className="text-xs font-semibold text-primary mt-0.5">{q.client_email}</div>
                            <div className="text-xs text-dark/60">{q.client_phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-dark">{new Date(q.target_date).toLocaleDateString('pt-PT')}</div>
                            <div className="text-xs font-bold text-secondary mt-0.5">{q.estimated_participants} pax</div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-medium text-dark/70 max-w-[250px] truncate" title={q.observations}>{q.observations || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={q.status}
                              onChange={(e) => updateQuoteStatus(q.id, e.target.value)}
                              className={`text-sm font-bold border-0 rounded-xl py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none ${getStatusColor(q.status)}`}
                            >
                              <option value="pendente">Pendente</option>
                              <option value="em_analise">Em Análise</option>
                              <option value="proposta_enviada">Proposta Enviada</option>
                              <option value="convertido">Convertido</option>
                              <option value="recusado">Recusado</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
