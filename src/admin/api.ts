export interface EmailPayload {
  from: string;
  fromName: string;
  subject: string;
  messages: Array<{
    to: string;
    subject: string;
    body: string;
  }>;
}

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export async function sendEmail(payload: EmailPayload, customApiUrl?: string): Promise<string> {
  const apiUrl = (customApiUrl || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  if (!apiUrl) {
    // No custom API: use the Supabase Edge Function "send-email" (see supabase/functions/send-email).
    if (!isSupabaseConfigured()) return 'not sent (connect Supabase or set an Email API URL)';
    try {
      const { data, error } = await supabase.functions.invoke('send-email', { body: payload });
      if (error) return `failed (${error.message})`;
      return data?.sent ? `sent (${data.sent}/${payload.messages.length})` : `failed (${data?.error || 'no emails sent'})`;
    } catch (err) {
      console.error('sendEmail failed:', err);
      return 'failed (could not reach the send-email function)';
    }
  }

  try {
    const res = await fetch(`${apiUrl}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return 'sent';
    }
    return `failed (${res.status})`;
  } catch (err) {
    console.error('sendEmail failed:', err);
    return 'failed (could not reach API)';
  }
}

export async function pingApi(apiUrl: string): Promise<boolean> {
  const url = apiUrl.replace(/\/$/, '');
  if (!url) return false;
  try {
    const res = await fetch(`${url}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
