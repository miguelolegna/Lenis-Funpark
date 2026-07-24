import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../lib/animations';

import HeaderSection from '../../sections/admin/dashboard/HeaderSection';
import BookingsTableSection from '../../sections/admin/dashboard/BookingsTableSection';
import QuotesTableSection from '../../sections/admin/dashboard/QuotesTableSection';

export default function Dashboard() {
  const mockBookings = [
    {
      id: "1",
      target_date: "2023-11-20",
      shift: "Tarde",
      client_name: "João Silva",
      client_phone: "912345678",
      status: "confirmado"
    },
    {
      id: "2",
      target_date: "2023-11-21",
      shift: "Manhã",
      client_name: "Maria Santos",
      client_phone: "919876543",
      status: "pendente"
    }
  ];

  const mockQuotes = [
    {
      id: "1",
      target_date: "2023-12-10",
      estimated_participants: "51-100",
      company_name: "Empresa XPTO",
      responsible_name: "Carlos",
      client_email: "carlos@xpto.pt",
      client_phone: "931234567",
      observations: "Precisamos de bolo",
      status: "pendente"
    }
  ];

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
        
        <HeaderSection onLogout={() => console.log('Mock: Fazer logout')} />

        <div className="grid grid-cols-1 gap-8">
          <BookingsTableSection 
            bookings={mockBookings} 
            onStatusChange={(id, status) => console.log('Mock: Atualizar status booking', id, status)} 
          />
          
          <QuotesTableSection 
            quotes={mockQuotes} 
            onStatusChange={(id, status) => console.log('Mock: Atualizar status quote', id, status)} 
          />
        </div>

      </div>
    </motion.div>
  );
}
