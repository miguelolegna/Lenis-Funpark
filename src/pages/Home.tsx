import { useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../lib/animations';

import HeroSection from '../sections/home/HeroSection';
import SemaforoWidgetSection from '../sections/home/SemaforoWidgetSection';
import SobrePreviewSection from '../sections/home/SobrePreviewSection';
import ConvitesDigitaisSection from '../sections/home/ConvitesDigitaisSection';
import BookingModuleSection from '../sections/home/BookingModuleSection';

import { supabase } from '../lib/supabase';
import { buildLisbonDateTime } from '../lib/dateUtils';
import { useParkStatus } from '../hooks/useParkStatus';

const statusMessageMap = {
  Livre: 'Venha brincar! Temos muito espaço.',
  Moderado: 'O parque está com alguma afluência.',
  Cheio: 'Lotação Completa. Vizite-nos mais tarde.',
  Fechado: 'O parque está encerrado.'
} as const;

export default function Home() {
  const { status: parkStatus, loading: isParkStatusLoading } = useParkStatus();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);

  const fetchAvailableTimes = async (date: Date) => {
    setIsFetchingTimes(true);
    setAvailableTimes([]); // Reset until loaded
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const { data, error } = await supabase.rpc('obter_horarios_ocupados', { p_data: dateString });
      if (error) throw error;
      
      const occupiedHours = (data as { hora: string }[] || []).map(r => r.hora);
      
      const dayOfWeek = date.getDay();
      let allSlots: string[] = [];
      
      // horarios de funcionamento do parque, dependendo do dia da semana
      if (dayOfWeek >= 2 && dayOfWeek <= 5) {
        allSlots = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        allSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
      }
      
      const filteredSlots = allSlots.filter(slot => !occupiedHours.includes(slot));
      setAvailableTimes(filteredSlots);
    } catch (err) {
      console.error("Erro ao buscar horários ocupados:", err);
      alert("Não foi possível carregar os horários. Tente novamente.");
    } finally {
      setIsFetchingTimes(false);
    }
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    fetchAvailableTimes(newDate);
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
      const dataEventoISO = buildLisbonDateTime(selectedDate, timeStr);

      const contactInfo = `Tel: ${formData.get('client_phone')} | Email: ${formData.get('client_email')}`;
      const notas = formData.get('notes') as string;
      const numPessoas = formData.get('guests') as string;

      const { error } = await supabase.from('reservas').insert([
        {
          data_evento: dataEventoISO,
          contacto_cliente: contactInfo,
          nome_aniversariante: formData.get('client_name') as string,
          num_criancas: parseInt(numPessoas, 10),
          notas_adicionais: notas,
          tipo_convite: 'lenis'
        }
      ]);

      if (error) {
        if (error.message.includes('Horário indisponível') || error.message.includes('chk_horario_funcionamento')) {
          alert("Pedimos desculpa, mas o horário selecionado acabou de ser reservado ou é inválido. Por favor, escolha outro horário.");
          // Refresh times to remove the taken slot
          if (selectedDate) fetchAvailableTimes(selectedDate);
          return;
        }
        throw error;
      }
      
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
        status={isParkStatusLoading ? 'Fechado' : parkStatus} 
        message={isParkStatusLoading ? '' : statusMessageMap[parkStatus]} 
      />
      
      <SobrePreviewSection />

      <ConvitesDigitaisSection />

      <BookingModuleSection 
        currentDate={currentDate}
        selectedDate={selectedDate}
        availableTimes={availableTimes}
        isFetchingTimes={isFetchingTimes}
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
