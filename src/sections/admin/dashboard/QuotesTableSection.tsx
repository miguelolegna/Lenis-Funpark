export interface Quote {
  id: string;
  target_date: string;
  estimated_participants: string;
  company_name: string;
  responsible_name: string;
  client_email: string;
  client_phone: string;
  observations: string;
  status: string;
}

export interface QuotesTableSectionProps {
  quotes: Quote[];
  onStatusChange: (id: string, status: string) => void;
}

export default function QuotesTableSection({ quotes, onStatusChange }: QuotesTableSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border-2 border-surface-alt overflow-hidden">
      <div className="p-6 border-b border-surface-alt bg-surface">
        <h2 className="text-xl font-black text-secondary">Pedidos de Orçamento B2B (Empresas/Grupos)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-secondary/60 text-sm border-b border-surface-alt">
            <tr>
              <th className="p-4 font-bold">Data / PAX</th>
              <th className="p-4 font-bold">Empresa / Responsável</th>
              <th className="p-4 font-bold">Contactos</th>
              <th className="p-4 font-bold">Observações</th>
              <th className="p-4 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-alt">
            {quotes.map(q => (
              <tr key={q.id} className="hover:bg-surface-alt transition-colors">
                <td className="p-4 font-medium whitespace-nowrap">{q.target_date} <br/><span className="text-sm text-secondary/50 font-normal">{q.estimated_participants} pax</span></td>
                <td className="p-4 font-medium">{q.company_name} <br/><span className="font-normal text-sm text-secondary/50">{q.responsible_name}</span></td>
                <td className="p-4">{q.client_email} <br/><span className="text-sm text-secondary/50">{q.client_phone}</span></td>
                <td className="p-4 max-w-[200px] truncate text-sm text-secondary/70" title={q.observations}>{q.observations || '-'}</td>
                <td className="p-4">
                  <select 
                    value={q.status || 'pendente'} 
                    onChange={(e) => onStatusChange(q.id, e.target.value)}
                    className="border-2 border-surface-alt rounded-lg p-2 text-sm bg-white font-medium focus:border-primary outline-none"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_negociacao">Em Negociação</option>
                    <option value="fechado">Fechado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary/50">Sem registos encontrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
