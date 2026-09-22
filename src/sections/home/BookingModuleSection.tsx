import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Smartphone,
  CreditCard,
  Info,
  User,
  Phone,
  Mail,
  Users,
  FileText,
  ChevronDown,
  Check,
  Banknote,
  Wallet,
} from 'lucide-react';
import { rotuloHorario, type ResumoDia } from '../../lib/horarios';
import { IBAN, MBWAY_NUMERO, metodosPagamento, type MetodoPagamento } from '../../lib/pagamentos';
import PrivacyTermsCheckbox from '../../components/PrivacyTermsCheckbox';

const iconePagamento: Record<MetodoPagamento, typeof Smartphone> = {
  mbway: Smartphone,
  transferencia: CreditCard,
  dinheiro: Banknote,
};

function listarHoras(horas: string[]) {
  return horas.length === 1 ? horas[0] : `${horas.slice(0, -1).join(', ')} e ${horas[horas.length - 1]}`;
}

export interface BookingModuleSectionProps {
  currentDate: Date;
  selectedDate: Date | null;
  availableTimes: string[];
  isFetchingTimes?: boolean;
  resumoDia: ResumoDia | null;
  isSubmitting: boolean;
  paymentDeadline: number | null;
  metodoPagamento: MetodoPagamento | null;
  onNewBooking: () => void;
  onDayClick: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function CustomTimeSelect({
  availableTimes,
  selectedDate,
  isFetchingTimes,
  resumoDia,
  selectedTime,
  onSelectTime,
}: {
  availableTimes: string[];
  selectedDate: Date | null;
  isFetchingTimes: boolean;
  resumoDia: ResumoDia | null;
  selectedTime: string;
  onSelectTime: (time: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isDisabled = !selectedDate || isFetchingTimes || availableTimes.length === 0;

  let placeholder = 'Selecione um horário...';
  if (!selectedDate) placeholder = 'Selecione uma data no calendário primeiro...';
  else if (isFetchingTimes) placeholder = 'A carregar horários disponíveis...';
  else if (availableTimes.length === 0) placeholder = 'Sem horários disponíveis para esta data';

  const isPendingSlot = (t: string) => resumoDia?.horasPendentes.includes(t);

  return (
    <div ref={containerRef} className="relative z-30">
      <input type="hidden" name="time" value={selectedTime} required />

      {/* Botão de Dropdown Customizado */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 text-left outline-none ${
          isDisabled
            ? 'bg-surface-alt/50 border-surface text-secondary/40 cursor-not-allowed opacity-70'
            : isOpen
            ? 'bg-white border-primary ring-4 ring-primary/10 text-secondary shadow-lg'
            : selectedTime
            ? 'bg-white border-primary/50 text-secondary shadow-sm hover:border-primary'
            : 'bg-surface-alt/70 hover:bg-surface-alt border-surface text-secondary/70 hover:border-primary/40'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selectedTime ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-secondary/50'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          {selectedTime ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-black text-secondary text-base">{rotuloHorario(selectedTime)}</span>
              {isPendingSlot(selectedTime) && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                  Pedido por confirmar
                </span>
              )}
            </div>
          ) : (
            <span className="font-semibold text-secondary/60 text-sm truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : 'text-secondary/50'
          }`}
        />
      </button>

      {/* Popover Menu Flutuante Customizado */}
      <AnimatePresence>
        {isOpen && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-primary/20 p-2 z-50 max-h-64 overflow-y-auto space-y-1.5"
          >
            {availableTimes.map((time) => {
              const isSelected = selectedTime === time;
              const pending = isPendingSlot(time);

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    onSelectTime(time);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150 ${
                    isSelected
                      ? 'bg-primary text-white shadow-md'
                      : 'hover:bg-primary/10 text-secondary hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                    <span className="text-base">{rotuloHorario(time)}</span>
                  </div>

                  {pending ? (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        isSelected
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      pedido por confirmar
                    </span>
                  ) : isSelected ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BookingModuleSection({
  currentDate,
  selectedDate,
  availableTimes,
  isFetchingTimes = false,
  resumoDia,
  isSubmitting,
  paymentDeadline,
  metodoPagamento,
  onNewBooking,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  onSubmit,
}: BookingModuleSectionProps) {
  const [now, setNow] = useState(() => Date.now());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [metodoEscolhido, setMetodoEscolhido] = useState<MetodoPagamento | null>(null);
  const [concordaTermos, setConcordaTermos] = useState<boolean>(false);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  useEffect(() => {
    if (paymentDeadline === null) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [paymentDeadline]);

  useEffect(() => {
    if (paymentDeadline !== null && now >= paymentDeadline) onNewBooking();
  }, [now, paymentDeadline, onNewBooking]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const daysCount = getDaysInMonth(year, month);
  const daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1);

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingOffset = (firstDayOfMonth + 6) % 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (metodoPagamento === 'dinheiro' && paymentDeadline === null) {
    return (
      <section id="reservas" className="scroll-mt-28 py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl border-4 border-primary"
          >
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-black text-secondary mb-4">Pedido Registado!</h2>

            <div className="bg-surface rounded-2xl p-6 border-2 border-primary/20 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <Banknote className="w-7 h-7" />
              </div>
              <p className="text-lg font-black text-secondary">Pagamento em dinheiro</p>
              <p className="text-secondary/80 font-medium">
                Para garantir a sua reserva, dirija-se ao Leni's FunPark nas <strong>próximas 24 horas</strong> e pague a caução, no valor de <strong>50€</strong>, na receção.
              </p>
              <p className="text-sm text-secondary/60 font-semibold">
                3ª a 6ª: 14h00 às 20h00 • Sáb., Dom. e Feriados: 10h00 às 20h00
              </p>
            </div>

            <button
              type="button"
              onClick={onNewBooking}
              className="mt-6 text-sm font-medium text-secondary/50 hover:text-secondary underline underline-offset-4 transition-colors"
            >
              Fazer uma nova reserva
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  if (paymentDeadline !== null) {
    const timeLeft = Math.max(0, Math.ceil((paymentDeadline - now) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // Pedidos antigos (antes da escolha do método) mostram as duas opções
    const mostrarMbway = metodoPagamento !== 'transferencia';
    const mostrarIban = metodoPagamento !== 'mbway';

    return (
      <section id="reservas" className="scroll-mt-28 py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl border-4 border-primary"
          >
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-black text-secondary mb-4">Pedido Registado!</h2>
            <p className="text-secondary/80 font-medium mb-6">
              Para garantir a sua reserva, por favor efetue o pagamento da caução de <strong>50€</strong> dentro do tempo limite.
            </p>

            <div className="bg-surface rounded-2xl p-6 mb-8 border-2 border-primary/20">
              <div className="flex items-center justify-center gap-2 text-3xl font-black text-primary mb-2">
                <Clock className="w-8 h-8" />
                <span>{timeString}</span>
              </div>
              <p className="text-sm font-bold text-secondary">Tempo restante para o pagamento</p>
            </div>

            <div className="space-y-4 text-left">
              <h3 className="text-xl font-black text-secondary mb-4 text-center">
                {mostrarMbway && mostrarIban ? 'Métodos de Pagamento' : 'Dados para o Pagamento'}
              </h3>

              {mostrarMbway && (
                <div className="bg-surface-alt rounded-xl p-4 border border-primary/20 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary/70 uppercase">MB WAY</p>
                    <p className="text-xl font-black text-secondary tracking-wide">{MBWAY_NUMERO}</p>
                  </div>
                </div>
              )}

              {mostrarIban && (
                <div className="bg-surface-alt rounded-xl p-4 border border-primary/20 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-secondary shadow-sm shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-secondary/70 uppercase">Transferência / IBAN</p>
                    <p className="text-sm sm:text-lg font-black text-secondary font-mono tracking-tight truncate">
                      {IBAN}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-primary/10 text-secondary text-sm rounded-xl font-medium border border-primary/20 text-center">
              Após o pagamento, envie o comprovativo pelo WhatsApp para validarmos a sua reserva de imediato!
            </div>

            <button
              type="button"
              onClick={onNewBooking}
              className="mt-6 text-sm font-medium text-secondary/50 hover:text-secondary underline underline-offset-4 transition-colors"
            >
              Fazer uma nova reserva
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="reservas" className="scroll-mt-28 py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-secondary mb-4">
            Faça a sua <span className="text-accent">Marcação</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-[3rem] p-8 shadow-2xl">
          {/* Coluna Esquerda: Calendário */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-secondary flex items-center">
                <Calendar className="mr-2 text-primary" /> {monthNames[month]} {year}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={onPrevMonth}
                  type="button"
                  className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={onNextMonth}
                  type="button"
                  className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {weekDays.map((day) => (
                <div key={day} className="text-xs sm:text-sm font-bold text-secondary/60 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startingOffset }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const dateObj = new Date(year, month, day);
                const isPast = dateObj < today;
                const isMonday = dateObj.getDay() === 1;
                const isDisabled = isPast || isMonday;
                const isSelected = selectedDate?.getTime() === dateObj.getTime();

                return (
                  <motion.button
                    key={day}
                    type="button"
                    whileHover={!isDisabled && !isSelected ? { scale: 1.1 } : {}}
                    whileTap={!isDisabled ? { scale: 0.9 } : {}}
                    onClick={() => onDayClick(day)}
                    disabled={isDisabled}
                    className={`aspect-square rounded-xl font-bold text-lg transition-colors
                      ${
                        isDisabled
                          ? 'bg-surface-alt text-secondary/40 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-surface-alt text-secondary hover:bg-primary/20'
                      }
                    `}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>

            {selectedDate && resumoDia && (resumoDia.festasConfirmadas > 0 || resumoDia.horasPendentes.length > 0) && (
              <div className="mt-6 space-y-3" aria-live="polite">
                {resumoDia.festasConfirmadas > 0 && (
                  <div className="flex items-start gap-2 p-4 rounded-xl bg-surface-alt border border-surface text-sm text-secondary font-medium">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <p>
                      {resumoDia.festasConfirmadas === 1
                        ? 'Já há uma festa marcada neste dia.'
                        : `Já há ${resumoDia.festasConfirmadas} festas marcadas neste dia.`}{' '}
                      Os horários indisponíveis não aparecem na lista.
                    </p>
                  </div>
                )}
                {resumoDia.horasPendentes.length > 0 && (
                  <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-medium">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                    <p>
                      {resumoDia.horasPendentes.length === 1
                        ? `Há um pedido de reserva por confirmar para as ${resumoDia.horasPendentes[0]}. Pode pedir esse horário na mesma, mas só um dos pedidos poderá ser confirmado. A nossa equipa entrará em contato.`
                        : `Há pedidos de reserva por confirmar para as ${listarHoras(resumoDia.horasPendentes)}. Pode pedir esses horários na mesma, mas só um pedido por horário poderá ser confirmado.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna Direita: Formulário de Reserva */}
          <div className="lg:col-span-3 lg:border-l-2 lg:border-surface-alt lg:pl-12 mt-8 lg:mt-0">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Armadilha para bots: invisível para pessoas e leitores de ecrã */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" />
                      Nome *
                    </label>
                    <input
                      name="client_name"
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      placeholder="O seu nome completo"
                      className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-primary" />
                      Telemóvel *
                    </label>
                    <input
                      name="client_phone"
                      required
                      type="tel"
                      autoComplete="tel"
                      maxLength={20}
                      pattern="^\+?[0-9][0-9 ]{7,18}$"
                      title="Indique um número de telemóvel válido (ex: 912 345 678)"
                      placeholder="Ex: 912 345 678"
                      className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-secondary mb-2 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-primary" />
                      Email *
                    </label>
                    <input
                      name="client_email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={200}
                      placeholder="exemplo@email.com"
                      className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      Nº de Pessoas *
                    </label>
                    <input
                      name="guests"
                      type="number"
                      min="1"
                      max="100"
                      required
                      placeholder="Ex: 15"
                      className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Dropdown de Seleção de Horário Customizado */}
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Hora da Reserva *
                  </label>
                  <CustomTimeSelect
                    availableTimes={availableTimes}
                    selectedDate={selectedDate}
                    isFetchingTimes={isFetchingTimes}
                    resumoDia={resumoDia}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                  />
                </div>

                <fieldset>
                  <legend className="block text-sm font-bold text-secondary mb-2 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-primary" />
                    Como prefere pagar a caução? *
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {metodosPagamento.map((m) => {
                      const Icone = iconePagamento[m.id];
                      const selecionado = metodoEscolhido === m.id;
                      return (
                        <label
                          key={m.id}
                          className={`relative flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20 ${
                            selecionado
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-surface bg-surface-alt/70 hover:border-primary/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={m.id}
                            required
                            checked={selecionado}
                            onChange={() => setMetodoEscolhido(m.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              selecionado ? 'bg-primary text-white' : 'bg-white text-secondary/50'
                            }`}
                          >
                            <Icone className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-secondary leading-tight">{m.label}</p>
                            <p className="text-[11px] text-secondary/60 font-medium leading-tight mt-0.5">{m.descricao}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {metodoEscolhido === 'dinheiro' && (
                    <p className="mt-2 text-xs font-medium text-secondary/70">
                      Depois de enviar o pedido, terá 24 horas para se dirigir ao parque e pagar a caução na receção.
                    </p>
                  )}
                </fieldset>

                <div>
                  <label className="block text-sm font-bold text-secondary mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" />
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    maxLength={2000}
                    placeholder="Informações adicionais, idades das crianças, etc."
                    className="w-full bg-surface-alt/70 hover:bg-surface-alt border-2 border-surface focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 rounded-2xl px-4 py-3.5 font-medium text-secondary placeholder:text-secondary/40 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <PrivacyTermsCheckbox
                  id="booking-privacy-terms"
                  checked={concordaTermos}
                  onChange={setConcordaTermos}
                  required
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!selectedDate || !selectedTime || !metodoEscolhido || !concordaTermos || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedDate && selectedTime && metodoEscolhido && concordaTermos && !isSubmitting
                    ? 'bg-primary text-white hover:bg-secondary shadow-lg shadow-primary/20 cursor-pointer'
                    : 'bg-surface-alt text-secondary/50 border-2 border-surface cursor-not-allowed'
                }`}
              >
                {isSubmitting
                  ? 'A enviar pedido...'
                  : !selectedDate
                  ? 'Selecione uma Data primeiro'
                  : !selectedTime
                  ? 'Selecione um Horário acima'
                  : !metodoEscolhido
                  ? 'Escolha o método de pagamento'
                  : !concordaTermos
                  ? 'Aceite a Política e Termos'
                  : 'Pedir Confirmação'}
              </motion.button>

              <div className="mt-4 p-4 bg-surface-alt text-secondary text-sm rounded-xl text-center font-medium border border-surface">
                A nossa equipa irá contactá-lo para confirmar os detalhes da sua reserva.
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

