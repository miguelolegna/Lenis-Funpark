import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Todas as contas do Supabase Auth são admins (o registo público está desligado),
    // por isso basta confirmar que o pedido vem de uma sessão válida.
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = token
      ? await admin.auth.getUser(token)
      : { data: { user: null }, error: null };
    if (authError || !caller) {
      return json({ error: 'Sessão inválida. Faça login novamente.' }, 401);
    }

    const { action, email, password, id } = await req.json();

    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      return json({
        admins: data.users.map((u) => ({
          id: u.id,
          email: u.email ?? '',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          is_current: u.id === caller.id,
        })),
      });
    }

    if (action === 'create') {
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        return json({ error: 'Email inválido.' }, 400);
      }
      if (typeof password !== 'string' || password.length < 8) {
        return json({ error: 'A password tem de ter pelo menos 8 caracteres.' }, 400);
      }

      const { data, error } = await admin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
      });
      if (error) {
        const alreadyExists = /already|registered|exists/i.test(error.message);
        return json({ error: alreadyExists ? 'Este email já está registado.' : error.message }, 400);
      }
      return json({ id: data.user.id });
    }

    if (action === 'delete') {
      if (typeof id !== 'string' || !id) {
        return json({ error: 'Conta não indicada.' }, 400);
      }
      if (id === caller.id) {
        return json({ error: 'Não podes remover a tua própria conta.' }, 400);
      }
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: 'Ação desconhecida.' }, 400);
  } catch (error) {
    console.error('[MANAGE ADMINS ERROR]:', error);
    return json({ error: (error as Error).message }, 500);
  }
});
