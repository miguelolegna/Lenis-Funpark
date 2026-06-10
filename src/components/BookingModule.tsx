import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BookingModule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    tipoFesta: 'aniversario',
    participantes: '10',
    turno: 'manha'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert("Por favor selecione uma data no calendário.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Mock format for the selected date (Agosto 2026) -> 2026-08-DD
    const dateStr = `2026-08-${selectedDate.toString().padStart(2, '0')}`;
    
    // Map party types to ENUM
    let mappedPartyType = formData.tipoFesta;
    if (mappedPartyType === 'grupo') mappedPartyType = 'amigos'; // Based on ENUM options (aniversario, escola, amigos, outro)

    try {
      const { error } = await supabase.from('bookings').insert([{
        client_name: formData.nome,
        client_phone: formData.telefone,
        client_email: formData.email || null,
        party_type: mappedPartyType,
        participants_count: parseInt(formData.participantes, 10),
        shift: formData.turno,
        target_date: dateStr
      }]);

      if (error) throw error;
      
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting booking:', err);
      setSubmitError(err.message || 'Ocorreu um erro inesperado ao submeter. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock calendar generation (current month)
  const currentMonth = "Agosto 2026"; // Mock month
  const daysInMonth = 31;
  const startDayOffset = 5; // Starts on a Friday (mock)
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - startDayOffset + 1;
    return (day > 0 && day <= daysInMonth) ? day : null;
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-surface-alt" id="booking-module">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Column: Mock Calendar */}
        <div className="p-8 bg-surface-alt">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-secondary flex items-center gap-2">
              <CalendarIcon className="text-primary" />
              Selecione a Data
            </h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-dark">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-dark flex items-center">{currentMonth}</span>
              <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-dark">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-dark/60">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => (
              <div key={i} className="aspect-square flex items-center justify-center">
                {day ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(day)}
                    className={`w-full h-full rounded-full flex items-center justify-center text-sm transition-colors ${
                      selectedDate === day 
                        ? 'bg-accent text-white font-bold' 
                        : 'hover:bg-primary/10 text-dark'
                    }`}
                  >
                    {day}
                  </motion.button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div className="p-8 relative">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                <h3 className="text-2xl font-bold text-secondary mb-6">Dados do Pedido</h3>
                
                <div>
                  <label className="block text-sm font-medium text-dark/70 mb-1">Nome Completo</label>
                  <input required type="text" name="nome" value={formData.nome} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">Telemóvel *</label>
                    <input required type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">Tipo de Festa</label>
                    <select name="tipoFesta" value={formData.tipoFesta} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
                      <option value="aniversario">Aniversário</option>
                      <option value="escola">Visita Escolar</option>
                      <option value="grupo">Grupo Privado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark/70 mb-1">Participantes</label>
                    <input required type="number" min="1" name="participantes" value={formData.participantes} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark/70 mb-1">Turno</label>
                  <select name="turno" value={formData.turno} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
                    <option value="manha">Manhã (10h-14h)</option>
                    <option value="tarde">Tarde (15h-19h)</option>
                  </select>
                </div>

                <div className="pt-2">
                  {submitError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-600">
                      {submitError}
                    </div>
                  )}
                  <Button type="submit" variant="accent" className="w-full mb-3" disabled={isSubmitting}>
                    {isSubmitting ? 'A enviar...' : 'Solicitar Reserva'}
                  </Button>
                  <div className="bg-surface text-secondary border border-primary/20 p-3 rounded-lg text-sm font-medium text-center">
                    A nossa equipa irá contactá-lo para confirmar os detalhes.
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                </motion.div>
                <h3 className="text-3xl font-bold text-secondary">Pedido Recebido!</h3>
                <p className="text-lg text-dark/70 max-w-sm">
                  Obrigado pelo seu pedido. <strong>A nossa equipa irá ligar-lhe para confirmar</strong> a disponibilidade e os detalhes finais.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                  Fazer outro pedido
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
