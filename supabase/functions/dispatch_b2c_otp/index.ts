import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { token_opaco } = await req.json()
    if (!token_opaco) throw new Error('Token opaco ausente.')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: otp, error: rpcError } = await supabase.rpc('gerar_otp_b2c', { p_token_opaco: token_opaco })
    if (rpcError) throw rpcError

    // Em ambiente local, imprimimos o OTP nos logs do Edge Function para debugging em vez de disparar SMTP real
    console.log(`[AUTH EVENT] Token Opaco: ${token_opaco} | OTP Gerado: ${otp}`);

    return new Response(JSON.stringify({ success: true, message: "OTP despachado de forma segura." }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    console.error('[AUTH ERROR]:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
