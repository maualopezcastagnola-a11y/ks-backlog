export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const body = await req.json();

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'ks·backlog <onboarding@resend.dev>',
      to: ['mauricio.lopez@keepitsimple.com.ar', 'mariano@keepitsimple.com.ar'],
      subject: body.subject,
      html: body.html
    })
  });

  const data = await resp.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
