export interface Booking {
  id: string;
  target_date: string;
  shift?: string;
  client_name: string;
  client_phone: string;
  status: string;
}

export interface BookingsTableSectionProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: string) => void;
}

export default function BookingsTableSection({ bookings, onStatusChange }: BookingsTableSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border-2 border-surface-alt overflow-hidden">
      <div className="p-6 border-b border-surface-alt bg-surface">
        <h2 className="text-xl font-black text-secondary">Marcações B2C (Particulares)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-secondary/60 text-sm border-b border-surface-alt">
            <tr>
              <th className="p-4 font-bold">Data / Turno</th>
              <th className="p-4 font-bold">Cliente</th>
              <th className="p-4 font-bold">Telemóvel</th>
              <th className="p-4 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-alt">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-surface-alt transition-colors">
                <td className="p-4 font-medium">{b.target_date} <span className="text-secondary/50 font-normal">({b.shift || '-'})</span></td>
                <td className="p-4">{b.client_name}</td>
                <td className="p-4">{b.client_phone}</td>
                <td className="p-4">
                  <select 
                    value={b.status || 'pendente'} 
                    onChange={(e) => onStatusChange(b.id, e.target.value)}
                    className="border-2 border-surface-alt rounded-lg p-2 text-sm bg-white font-medium focus:border-primary outline-none"
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
                <td colSpan={4} className="p-8 text-center text-secondary/50">Sem registos encontrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
