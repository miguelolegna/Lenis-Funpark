import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token_opaco } = await req.json();
    if (!token_opaco) throw new Error('Token opaco ausente.');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Obter email do cliente
    const { data: reservaData, error: fetchError } = await supabase
      .from('reserva_tokens')
      .select('reservas(contacto_cliente)')
      .eq('token_opaco', token_opaco)
      .single();

    if (fetchError || !reservaData?.reservas?.contacto_cliente) {
      throw new Error('Não foi possível encontrar a reserva associada a este token.');
    }
    
    // O cast é necessário pois a união de tipos pode vir como array em algumas queries
    const clientEmail = Array.isArray(reservaData.reservas) 
      ? reservaData.reservas[0].contacto_cliente 
      : (reservaData.reservas as any).contacto_cliente;

    // 2. Gerar OTP (A RPC agora grava o hash na nova tabela e devolve o código de 6 dígitos)
    const { data: otp, error: rpcError } = await supabase.rpc('gerar_otp_b2c', { p_token_opaco: token_opaco });
    if (rpcError) throw rpcError;

    // 3. Enviar via Resend
    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Leni\'s FunPark <onboarding@resend.dev>', // ATUALIZAR: Coloque o seu email de remetente configurado no Resend
          to: [clientEmail],
          subject: 'Código de Acesso - Leni\'s FunPark',
          html: `<p>Olá!</p><p>O seu código para acesso ao formulário da festa é: <strong>${otp}</strong></p><p>Este código expira em 10 minutos.</p>`
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('Erro Resend:', errData);
        throw new Error('Falha ao enviar email.');
      }
    } else {
      console.log(`[AUTH EVENT LOCAL] Token Opaco: ${token_opaco} | OTP Gerado: ${otp} | Para: ${clientEmail}`);
    }

    return new Response(JSON.stringify({ success: true, message: "OTP despachado de forma segura." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[AUTH ERROR]:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
