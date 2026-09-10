import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * Solicita o envio de um OTP para o email fornecido.
 */
export async function requestOTP(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    console.error('Erro ao solicitar OTP:', error.message);
    throw new Error('Não foi possível enviar o código de autenticação.');
  }
}

/**
 * Verifica o OTP recebido no email.
 * Devolve a Sessão em caso de sucesso para desbloquear as fases seguintes.
 */
export async function verifyOTP(email: string, token: string): Promise<Session> {
  const variavelEmail = email;
  const variavelCodigo = token;
  const { data, error } = await supabase.auth.verifyOtp({ email: variavelEmail, token: variavelCodigo, type: 'email' });

  if (error) {
    console.error("Erro de Verificação OTP:", error.message);
    throw new Error('Código de autenticação inválido ou expirado.');
  }

  if (!data.session) {
    throw new Error('Não foi possível estabelecer a sessão.');
  }

  return data.session;
}
