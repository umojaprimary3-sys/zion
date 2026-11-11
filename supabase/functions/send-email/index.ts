// Supabase Edge Function: send-email
// Sends emails through Resend. Only signed-in ADMINS may call it.
//
// Deploy:
//   supabase functions deploy send-email
//   supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="Bakery <orders@your-domain.com>"
// (FROM_EMAIL must be on a domain you verified in Resend.)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // 1. Caller must be a signed-in admin (same is_admin() rule used by the database).
  const authHeader = req.headers.get('Authorization') || '';
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin !== true) return json({ error: 'Admins only' }, 403);

  // 2. Validate input
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return json({ error: 'RESEND_API_KEY is not set' }, 500);

  let payload: { from?: string; fromName?: string; subject?: string; messages?: Array<{ to: string; subject?: string; body: string }> };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const messages = (payload.messages || []).filter((m) => m && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.to || '') && m.body);
  if (!messages.length) return json({ error: 'No valid recipients' }, 400);
  if (messages.length > 100) return json({ error: 'Max 100 emails per request' }, 400);

  const fromEmail = Deno.env.get('FROM_EMAIL') || payload.from;
  if (!fromEmail) return json({ error: 'FROM_EMAIL is not set' }, 500);
  const from = fromEmail.includes('<') ? fromEmail : payload.fromName ? `${payload.fromName} <${fromEmail}>` : fromEmail;

  // 3. Send
  let sent = 0;
  const failures: string[] = [];
  for (const m of messages) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [m.to],
        subject: m.subject || payload.subject || '(no subject)',
        text: m.body,
      }),
    });
    if (res.ok) sent++;
    else failures.push(`${m.to}: ${res.status}`);
  }
  return json({ sent, failed: failures.length, failures: failures.slice(0, 5), error: sent ? undefined : failures[0] });
});
