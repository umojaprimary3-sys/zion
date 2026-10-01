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

export async function sendEmail(payload: EmailPayload, customApiUrl?: string): Promise<string> {
  const apiUrl = (customApiUrl || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  if (!apiUrl) {
    return 'queued (demo, no API connected)';
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
