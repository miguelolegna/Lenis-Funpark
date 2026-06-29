import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [eventQuotes, setEventQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [resBookings, resQuotes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('event_quotes').select('*').order('created_at', { ascending: false }),
    ]);

    if (resBookings.data) setBookings(resBookings.data);
    if (resQuotes.data) setEventQuotes(resQuotes.data);
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      alert('Erro ao atualizar: ' + error.message);
    } else {
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('event_quotes').update({ status }).eq('id', id);
    if (error) {
      alert('Erro ao atualizar: ' + error.message);
    } else {
      setEventQuotes(eventQuotes.map(q => q.id === id ? { ...q, status } : q));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">A carregar leads...</div>;

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 gap-4">
          <h1 className="text-3xl font-black text-secondary">Backoffice</h1>
          <button 
            onClick={handleLogout} 
            className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-black text-secondary">Marcações B2C (Particulares)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold">Data / Turno</th>
                  <th className="p-4 font-bold">Cliente</th>
                  <th className="p-4 font-bold">Telemóvel</th>
                  <th className="p-4 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{b.target_date} <span className="text-gray-400 font-normal">({b.shift})</span></td>
                    <td className="p-4">{b.client_name}</td>
                    <td className="p-4">{b.client_phone}</td>
                    <td className="p-4">
                      <select 
                        value={b.status || 'pendente'} 
                        onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                        className="border-2 border-gray-200 rounded-lg p-2 text-sm bg-white font-medium focus:border-primary outline-none"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="contactado">Contactado</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">Sem registos encontrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-black text-secondary">Pedidos de Orçamento B2B (Empresas/Grupos)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold">Data / PAX</th>
                  <th className="p-4 font-bold">Empresa / Responsável</th>
                  <th className="p-4 font-bold">Contactos</th>
                  <th className="p-4 font-bold">Observações</th>
                  <th className="p-4 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventQuotes.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium whitespace-nowrap">{q.target_date} <br/><span className="text-sm text-gray-400 font-normal">{q.estimated_participants} pax</span></td>
                    <td className="p-4 font-medium">{q.company_name} <br/><span className="font-normal text-sm text-gray-400">{q.responsible_name}</span></td>
                    <td className="p-4">{q.client_email} <br/><span className="text-sm text-gray-400">{q.client_phone}</span></td>
                    <td className="p-4 max-w-[200px] truncate text-sm text-gray-600" title={q.observations}>{q.observations || '-'}</td>
                    <td className="p-4">
                      <select 
                        value={q.status || 'pendente'} 
                        onChange={(e) => updateQuoteStatus(q.id, e.target.value)}
                        className="border-2 border-gray-200 rounded-lg p-2 text-sm bg-white font-medium focus:border-primary outline-none"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_negociacao">Em Negociação</option>
                        <option value="fechado">Fechado</option>
                        <option value="perdido">Perdido</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {eventQuotes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">Sem registos encontrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
