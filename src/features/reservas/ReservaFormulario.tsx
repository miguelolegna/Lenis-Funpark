import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function ReservaFormulario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tipoFesta, setTipoFesta] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // Mock de delay de submissão
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newLead = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        nome,
        email,
        telefone: phone,
        tipo_festa: tipoFesta
      };
      
      const existingLeads = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      localStorage.setItem('mock_leads', JSON.stringify([newLead, ...existingLeads]));
      
      setStatus('success');
      setNome('');
      setEmail('');
      setPhone('');
      setTipoFesta('');
      
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-brand-light p-8 rounded-2xl shadow-xl w-full flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-brand-dark mb-2">Garanta o seu lugar</h2>
        <p className="text-brand-dark/70">Preencha os dados abaixo para iniciar o seu pedido.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input 
          label="Nome Completo" 
          placeholder="Ex: João Silva" 
          required 
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        
        <Input 
          label="Email" 
          type="email" 
          placeholder="Ex: joao@email.com" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
          title="Por favor, insira um endereço de email válido."
        />

        <Input 
          label="Número de Telefone" 
          type="tel" 
          placeholder="Ex: 912345678" 
          required 
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          pattern="\d+"
          title="Por favor, insira apenas dígitos."
        />
        
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-brand-dark/80">Tipo de Festa <span className="text-brand-red">*</span></label>
          <select 
            required 
            value={tipoFesta}
            onChange={(e) => setTipoFesta(e.target.value)}
            className="flex h-12 w-full rounded-md border border-brand-gray bg-brand-light px-4 py-2 text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark transition-colors"
          >
            <option value="">Selecione o tipo de evento...</option>
            <option value="aniversario">Aniversário</option>
            <option value="escola">Visita Escolar</option>
            <option value="grupo">Grupo de Amigos</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <Button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full mt-4 text-lg py-4 transition-transform duration-300 hover:!scale-105 hover:!-translate-y-0"
        >
          {status === 'loading' ? 'A enviar...' : 'Enviar Pedido'}
        </Button>

        {status === 'success' && (
          <p className="text-green-600 font-medium text-center mt-2">Pedido enviado com sucesso!</p>
        )}
        {status === 'error' && (
          <p className="text-brand-red font-medium text-center mt-2">Ocorreu um erro ao enviar. Tente novamente.</p>
        )}
      </form>
    </div>
  );
}
