import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../lib/animations';

import HeroSection from '../sections/home/HeroSection';
import SemaforoWidgetSection from '../sections/home/SemaforoWidgetSection';
import SobrePreviewSection from '../sections/home/SobrePreviewSection';
import ConvitesDigitaisSection from '../sections/home/ConvitesDigitaisSection';
import BookingModuleSection from '../sections/home/BookingModuleSection';

import { supabase } from '../lib/supabase';
import { buildLisbonDateTime } from '../lib/dateUtils';
import { obterHorariosDisponiveis, obterResumoDia, type ResumoDia } from '../lib/horarios';
import { useParkStatus } from '../hooks/useParkStatus';
import { eMetodoPagamento, type MetodoPagamento } from '../lib/pagamentos';

const statusMessageMap = {
  Livre: 'Venha brincar! Temos muito espaço.',
  Moderado: 'O parque está com alguma afluência.',
  Cheio: 'Lotação Completa. Vizite-nos mais tarde.',
  Reservado: 'O parque está reservado para uma festa privada. Vizite-nos mais tarde.',
  Fechado: 'O parque está encerrado.'
} as const;

// Guarda o tempo restante (não a hora-limite) para o timer ficar pausado enquanto o site está fechado
const PAYMENT_REMAINING_KEY = 'lenis_payment_remaining_ms';
const PAYMENT_WINDOW_MS = 10 * 60 * 1000;

function saveRemaining(ms: number) {
  try {
    localStorage.setItem(PAYMENT_REMAINING_KEY, String(ms));
  } catch { /* sem storage: o card funciona só nesta visita */ }
}

// Método escolhido no pedido. Em dinheiro não há timer: o cliente tem 24h para ir ao parque,
// e o aviso fica visível até lá (hora-limite absoluta, não pausa com o site fechado).
const PAYMENT_METHOD_KEY = 'lenis_payment_method';
const CASH_WINDOW_MS = 24 * 60 * 60 * 1000;

function saveMethod(metodo: MetodoPagamento, dinheiroAte?: number) {
  try {
    localStorage.setItem(PAYMENT_METHOD_KEY, JSON.stringify({ metodo, dinheiroAte }));
  } catch { /* sem storage */ }
}

function readStoredMethod(): MetodoPagamento | null {
  try {
    const guardado = JSON.parse(localStorage.getItem(PAYMENT_METHOD_KEY) || 'null');
    if (!eMetodoPagamento(guardado?.metodo)) return null;
    if (guardado.metodo === 'dinheiro' && !(Number(guardado.dinheiroAte) > Date.now())) return null;
    return guardado.metodo;
  } catch {
    return null;
  }
}

function readStoredDeadline(): number | null {
  try {
    const remaining = Number(localStorage.getItem(PAYMENT_REMAINING_KEY));
    return remaining > 0 ? Date.now() + remaining : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const { status: parkStatus, loading: isParkStatusLoading } = useParkStatus();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDeadline, setPaymentDeadline] = useState<number | null>(readStoredDeadline);
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento | null>(readStoredMethod);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [resumoDia, setResumoDia] = useState<ResumoDia | null>(null);
  const pedidoHorariosAtual = useRef(0);

  useEffect(() => {
    if (paymentDeadline === null) return;
    const timer = setInterval(() => saveRemaining(Math.max(0, paymentDeadline - Date.now())), 1000);
    return () => clearInterval(timer);
  }, [paymentDeadline]);

  const fetchAvailableTimes = async (date: Date) => {
    // Ignora respostas de dias clicados antes, se chegarem depois
    const pedido = ++pedidoHorariosAtual.current;
    setIsFetchingTimes(true);
    setAvailableTimes([]); // Reset until loaded
    setResumoDia(null);

    const [horarios, resumo] = await Promise.allSettled([obterHorariosDisponiveis(date), obterResumoDia(date)]);
    if (pedido !== pedidoHorariosAtual.current) return;

    if (horarios.status === 'fulfilled') {
      setAvailableTimes(horarios.value);
    } else {
      console.error("Erro ao buscar horários ocupados:", horarios.reason);
      alert("Não foi possível carregar os horários. Tente novamente.");
    }
    if (resumo.status === 'fulfilled') {
      setResumoDia(resumo.value);
    } else {
      // O aviso é só informativo: sem ele a marcação continua a funcionar
      console.error("[Marcação] Erro ao carregar o resumo do dia:", resumo.reason);
    }
    setIsFetchingTimes(false);
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
      const metodo = formData.get('payment_method');
      if (!eMetodoPagamento(metodo)) return;

      const { error } = await supabase.from('reservas').insert([
        {
          data_evento: dataEventoISO,
          contacto_cliente: contactInfo,
          nome_aniversariante: formData.get('client_name') as string,
          num_criancas: parseInt(numPessoas, 10),
          notas_adicionais: notas,
          tipo_convite: 'lenis',
          metodo_pagamento: metodo
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
      
      setMetodoPagamento(metodo);
      if (metodo === 'dinheiro') {
        saveMethod(metodo, Date.now() + CASH_WINDOW_MS);
      } else {
        saveMethod(metodo);
        saveRemaining(PAYMENT_WINDOW_MS);
        setPaymentDeadline(Date.now() + PAYMENT_WINDOW_MS);
      }
    } catch (err) {
      console.error("Erro na submissão da reserva:", err);
      alert("Ocorreu um erro ao comunicar com o servidor. Por favor, tente novamente ou contacte-nos por telefone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewBooking = () => {
    try {
      localStorage.removeItem(PAYMENT_REMAINING_KEY);
      localStorage.removeItem(PAYMENT_METHOD_KEY);
    } catch { /* ignorar */ }
    setPaymentDeadline(null);
    setMetodoPagamento(null);
    setSelectedDate(null);
    setAvailableTimes([]);
    setResumoDia(null);
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
        resumoDia={resumoDia}
        isSubmitting={isSubmitting}
        paymentDeadline={paymentDeadline}
        metodoPagamento={metodoPagamento}
        onNewBooking={handleNewBooking}
        onDayClick={handleDayClick}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}
