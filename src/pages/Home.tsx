import { useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../lib/animations';

import HeroSection from '../sections/home/HeroSection';
import SemaforoWidgetSection from '../sections/home/SemaforoWidgetSection';
import SobrePreviewSection from '../sections/home/SobrePreviewSection';
import ConvitesDigitaisSection from '../sections/home/ConvitesDigitaisSection';
import BookingModuleSection from '../sections/home/BookingModuleSection';

import { supabase } from '../lib/supabase';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const timeStr = formData.get('time') as string;
      const [hours, minutes] = timeStr.split(':');
      const dataEvento = new Date(selectedDate);
      dataEvento.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      const contactInfo = `Tel: ${formData.get('client_phone')} | Email: ${formData.get('client_email')}`;
      const notas = formData.get('notes') as string;
      const numPessoas = formData.get('guests') as string;

      const { error } = await supabase.from('reservas').insert([
        {
          data_evento: dataEvento.toISOString(),
          contacto_cliente: contactInfo,
          nome_aniversariante: formData.get('client_name') as string,
          num_criancas: parseInt(numPessoas, 10),
          notas_adicionais: notas
        }
      ]);

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (err) {
      console.error("Erro na submissão da reserva:", err);
      alert("Ocorreu um erro ao comunicar com o servidor. Por favor, tente novamente ou contacte-nos por telefone.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        currentDate={currentDate}
        selectedDate={selectedDate}
        availableTimes={["10:00", "14:00", "15:00", "16:00"]}
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
        onDayClick={handleDayClick}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}
