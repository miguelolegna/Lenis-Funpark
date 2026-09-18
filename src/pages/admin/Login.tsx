import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email ou password incorretos.'
          : signInError.message
      );
      setLoading(false);
      return;
    }

    navigate('/admin/dashboard');
  };

  const inputClass =
    'appearance-none rounded-md relative block w-full px-3 py-3 border border-secondary/20 placeholder-secondary/50 text-secondary focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm';

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border-2 border-surface-alt">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary">
            Leni's Staff
          </h2>
          <p className="mt-2 text-center text-sm text-secondary/70">
            Introduza o seu email e password para entrar.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="bg-accent/10 text-accent p-3 rounded-md text-sm text-center">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
          >
            {loading ? 'A entrar...' : 'Entrar na Área Reservada'}
          </button>
        </form>
      </div>
    </div>
  );
}
