import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../lib/animations';

import HeroSection from '../sections/home/HeroSection';
import SemaforoWidgetSection from '../sections/home/SemaforoWidgetSection';
import SobrePreviewSection from '../sections/home/SobrePreviewSection';
import ConvitesDigitaisSection from '../sections/home/ConvitesDigitaisSection';
import BookingModuleSection from '../sections/home/BookingModuleSection';

export default function Home() {
  const currentDateMock = new Date();
  
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      <HeroSection 
        onCheckAvailability={() => {
          document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      <SemaforoWidgetSection 
        status="Livre" 
        message="Venha brincar! Temos muito espaço." 
      />
      
      <SobrePreviewSection />

      <ConvitesDigitaisSection />

      <BookingModuleSection 
        currentDate={currentDateMock}
        selectedDate={null}
        availableTimes={["14:00", "15:00", "16:00"]}
        isSubmitting={false}
        isSubmitted={false}
        onDayClick={(day) => console.log('Mock: Selecionou dia', day)}
        onPrevMonth={() => console.log('Mock: Mês anterior')}
        onNextMonth={() => console.log('Mock: Mês seguinte')}
        onSubmit={(e) => { e.preventDefault(); console.log('Mock: Submit formulário'); }}
        onReset={() => console.log('Mock: Reset formulário')}
      />
    </motion.div>
  );
}
