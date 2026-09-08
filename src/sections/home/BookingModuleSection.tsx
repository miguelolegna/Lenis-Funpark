import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface BookingModuleSectionProps {
  currentDate: Date;
  selectedDate: Date | null;
  availableTimes: string[];
  isFetchingTimes?: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  onDayClick: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function BookingModuleSection({
  currentDate,
  selectedDate,
  availableTimes,
  isFetchingTimes = false,
  isSubmitting,
  isSubmitted,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  onSubmit
}: BookingModuleSectionProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const daysCount = getDaysInMonth(year, month);
  const daysInMonth = Array.from({length: daysCount}, (_, i) => i + 1);
  
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  // Calcula o deslocamento para a semana iniciar à Segunda-feira (0 = Seg, 6 = Dom)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingOffset = (firstDayOfMonth + 6) % 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isSubmitted) {
    return (
      <section id="reservas" className="py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] p-12 shadow-2xl border-4 border-primary"
          >
            <CheckCircle2 className="w-24 h-24 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-black text-secondary mb-4">Pedido Registado!</h2>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="reservas" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-secondary mb-4">
            Faça a sua <span className="text-accent">Marcação</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-[3rem] p-8 shadow-2xl">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-secondary flex items-center">
                <Calendar className="mr-2 text-primary" /> {monthNames[month]} {year}
              </h3>
              <div className="flex space-x-2">
                <button onClick={onPrevMonth} type="button" className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={onNextMonth} type="button" className="p-2 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors"><ChevronRight size={20} /></button>
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
              {daysInMonth.map(day => {
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
                      ${isDisabled ? 'bg-surface-alt text-secondary/40 cursor-not-allowed opacity-50' 
                        : isSelected ? 'bg-primary text-white shadow-lg'
                        : 'bg-surface-alt text-secondary hover:bg-primary/20'}
                    `}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </div>
          
          <div className="lg:col-span-3 lg:border-l-2 lg:border-surface-alt lg:pl-12 mt-8 lg:mt-0">
            <form onSubmit={onSubmit} className="space-y-6">
               <div className="space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Nome *</label>
                    <input name="client_name" required className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Telemóvel *</label>
                    <input name="client_phone" required type="tel" className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                  </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-secondary mb-2">Email *</label>
                     <input name="client_email" type="email" required className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-secondary mb-2">Nº de Pessoas *</label>
                     <input name="guests" type="number" min="1" required className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3" />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-secondary mb-2">Hora *</label>
                   <select 
                     name="time" 
                     required 
                     defaultValue="" 
                     disabled={!selectedDate || isFetchingTimes || availableTimes.length === 0}
                     className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <option value="" disabled>
                       {!selectedDate 
                         ? "Selecione uma data primeiro..." 
                         : isFetchingTimes
                           ? "A carregar horários..."
                           : availableTimes.length === 0 
                             ? "Sem horários disponíveis" 
                             : "Selecione um horário..."}
                     </option>
                     {availableTimes.map(time => (
                       <option key={time} value={time}>{time}</option>
                     ))}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-secondary mb-2">Observações</label>
                   <textarea name="notes" rows={3} className="w-full bg-surface-alt border-2 border-surface rounded-xl px-4 py-3 resize-none"></textarea>
                 </div>

               </div>
               
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={!selectedDate || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${(selectedDate && !isSubmitting) ? 'bg-primary text-white hover:bg-secondary cursor-pointer' : 'bg-surface-alt text-secondary/50 cursor-not-allowed'}`}
              >
                {isSubmitting ? 'A enviar...' : selectedDate ? 'Pedir Confirmação' : 'Selecione uma Data primeiro'}
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
