import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/atoms/Button';

type Lead = {
  id: number;
  created_at: string;
  nome: string;
  email: string;
  telefone: string;
  tipo_festa: string;
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      setLeads(mockLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (status: 'livre' | 'composto' | 'cheio') => {
    if (!window.confirm(`Tem a certeza que deseja forçar o estado para ${status.toUpperCase()}?`)) {
      return;
    }

    try {
      localStorage.setItem('mock_park_status', status);
      window.dispatchEvent(new CustomEvent('mock_park_status_update', { detail: { status } }));

      alert(`Estado atualizado para ${status.toUpperCase()} com sucesso.`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar o estado.');
    }
  };

  return (
    <div className="space-y-12 animate-mount-section">
      <section>
        <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-2">Controlo de Lotação</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => setStatus('livre')}
            className="h-24 text-xl bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-transform hover:scale-[1.02]"
          >
            Forçar Estado: LIVRE
          </Button>
          <Button 
            onClick={() => setStatus('composto')}
            className="h-24 text-xl bg-brand-yellow hover:bg-yellow-500 text-brand-dark font-bold rounded-xl transition-transform hover:scale-[1.02]"
          >
            Forçar Estado: COMPOSTO
          </Button>
          <Button 
            onClick={() => setStatus('cheio')}
            className="h-24 text-xl bg-brand-red hover:bg-red-600 text-white font-bold rounded-xl transition-transform hover:scale-[1.02]"
          >
            Forçar Estado: CHEIO
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-2">Dashboard de Leads</h2>
        
        {loading ? (
          <div className="text-center py-8 text-brand-light/70">A carregar leads...</div>
        ) : (
          <div className="overflow-x-auto bg-[#082E32] rounded-xl border border-white/10 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20">
                  <th className="p-4 font-semibold text-brand-yellow">Data</th>
                  <th className="p-4 font-semibold text-brand-yellow">Nome</th>
                  <th className="p-4 font-semibold text-brand-yellow">Email</th>
                  <th className="p-4 font-semibold text-brand-yellow">Telefone</th>
                  <th className="p-4 font-semibold text-brand-yellow">Tipo de Festa</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-brand-light/50">
                      Nenhuma lead encontrada.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 whitespace-nowrap text-sm text-brand-light/70">
                        {new Date(lead.created_at).toLocaleString('pt-PT')}
                      </td>
                      <td className="p-4 font-medium">{lead.nome}</td>
                      <td className="p-4 text-brand-light/80">{lead.email}</td>
                      <td className="p-4">{lead.telefone}</td>
                      <td className="p-4 capitalize">{lead.tipo_festa}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
