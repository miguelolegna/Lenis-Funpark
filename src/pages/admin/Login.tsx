import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOTP, verifyOTP } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await requestOTP(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar o código OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const session = await verifyOTP(email, token);
      
      // Armazenamos a sessão para uso na área restrita e mantemos o 'admin_user' 
      // caso o dashboard atual dependa dessa flag legada
      localStorage.setItem('admin_session', JSON.stringify(session));
      localStorage.setItem('admin_user', JSON.stringify({ role: 'admin', email }));
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border-2 border-surface-alt">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary">
            Leni's Staff
          </h2>
          <p className="mt-2 text-center text-sm text-secondary/70">
            {step === 1 ? 'Introduza o seu email para receber o código de acesso.' : 'Introduza o código de 6 dígitos enviado para o seu email.'}
          </p>
        </div>
        
        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            {error && <div className="bg-accent/10 text-accent p-3 rounded-md text-sm text-center">{error}</div>}
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-secondary/20 placeholder-secondary/50 text-secondary focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
              >
                {loading ? 'A enviar...' : 'Solicitar Código'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            {error && <div className="bg-accent/10 text-accent p-3 rounded-md text-sm text-center">{error}</div>}
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-secondary/20 placeholder-secondary/50 text-secondary focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm text-center tracking-[0.5em] font-mono text-xl"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))} // Apenas dígitos
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || token.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
              >
                {loading ? 'A validar...' : 'Entrar na Área Reservada'}
              </button>
            </div>
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => { setStep(1); setToken(''); setError(''); }} 
                className="text-sm text-primary hover:underline font-medium"
              >
                Voltar e tentar outro email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
