import { useState } from 'react';

export function ReservaCalendario() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const isOcupado = (date: Date) => {
    return date.getDate() % 7 === 0;
  };

  return (
    <div className="bg-brand-light p-6 rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brand-dark">Escolha a Data</h2>
        <div className="flex gap-2">
           <button onClick={prevMonth} className="p-2 bg-brand-gray rounded-full hover:bg-gray-300 transition-colors text-brand-dark font-bold w-10 h-10 flex items-center justify-center">&lt;</button>
           <button onClick={nextMonth} className="p-2 bg-brand-gray rounded-full hover:bg-gray-300 transition-colors text-brand-dark font-bold w-10 h-10 flex items-center justify-center">&gt;</button>
        </div>
      </div>
      
      <div className="text-center font-bold text-brand-dark mb-4 text-lg">
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
          <div key={idx} className="text-center font-bold text-brand-dark/50 py-2 text-sm">
            {day}
          </div>
        ))}
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;
          
          const isPast = date < today;
          const ocupado = isOcupado(date);
          const disabled = isPast || ocupado;
          const isSelected = selectedDate?.getTime() === date.getTime();
          
          let btnClass = "aspect-square flex items-center justify-center rounded-lg font-medium transition-all duration-300 ";
          
          if (isPast) {
            btnClass += "text-brand-dark/20 cursor-not-allowed";
          } else if (ocupado) {
            btnClass += "text-brand-red bg-brand-red/10 cursor-not-allowed opacity-50 pointer-events-none";
          } else {
            btnClass += "text-brand-dark hover:bg-brand-yellow/50 hover:scale-105 cursor-pointer bg-brand-gray/30";
          }

          if (isSelected) {
            btnClass += " !bg-brand-yellow !text-brand-dark shadow-md";
          }

          return (
            <button 
              key={idx}
              disabled={disabled}
              onClick={() => setSelectedDate(date)}
              className={btnClass}
              title={isPast ? "Passado" : (ocupado ? "Ocupado" : "Livre")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 text-sm font-medium mt-6">
         <span className="flex items-center gap-2 text-brand-dark"><span className="w-3 h-3 rounded-full bg-brand-gray border border-brand-dark/20"></span> Livre</span>
         <span className="flex items-center gap-2 text-brand-dark"><span className="w-3 h-3 rounded-full bg-brand-red/30 border border-brand-red/50"></span> Ocupado</span>
      </div>
    </div>
  );
}
