import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function CustomDatePicker({ value, onChange, disabled }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // The month currently being viewed in the calendar
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update viewDate when value changes externally
  useEffect(() => {
    if (value && !isOpen) {
      const [y, m, d] = value.split('-').map(Number);
      setViewDate(new Date(y, m - 1, d));
    }
  }, [value, isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const daysCount = getDaysInMonth(year, month);
  const daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingOffset = (firstDayOfMonth + 6) % 7;

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${year}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  // Format value for display
  const displayValue = value ? (() => {
    const [y, m, d] = value.split('-').map(Number);
    return `${String(d).padStart(2, '0')} ${monthNames[m - 1].substring(0, 3)} ${y}`;
  })() : '';

  return (
    <div className="relative w-full" ref={popoverRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-surface-alt/40 border border-surface-alt rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed text-secondary/40' : 'cursor-pointer focus:outline-none focus:border-primary text-secondary hover:bg-surface-alt/60'
        }`}
      >
        <span className={value ? 'text-secondary' : 'text-secondary/40'}>
          {displayValue || 'Escolhe a data'}
        </span>
        <CalendarIcon className="w-4 h-4 text-secondary/60" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] mt-2 bg-white rounded-3xl p-5 shadow-2xl border-2 border-primary/20 w-[18rem] left-0 sm:left-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-secondary flex items-center">
                {monthNames[month]} {year}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={handlePrevMonth}
                  type="button"
                  className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  type="button"
                  className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface text-secondary transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {weekDays.map((day) => (
                <div key={day} className="text-[10px] font-bold text-secondary/60 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingOffset }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const dateObj = new Date(year, month, day);
                // Highlight current selected value
                let isSelected = false;
                if (value) {
                  const [y, m, d] = value.split('-').map(Number);
                  isSelected = (year === y && month === m - 1 && day === d);
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded-lg font-bold text-sm transition-colors flex items-center justify-center cursor-pointer
                      ${
                        isSelected
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-surface-alt text-secondary hover:bg-primary/20 hover:text-primary'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
