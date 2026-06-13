export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  const { prompt, platform, module } = await req.json();
  
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `PM experto SaaS. Convertí en historia de usuario.\nRequerimiento: "${prompt}"\nPlataforma: ${platform||'—'} Producto: ${module||'—'}\nJSON sin markdown: {"title":"máx 8 palabras","story":"Como [rol], quiero [acción] para [beneficio].","next":"primer paso técnico"}`
      }]
    })
  });
  
  const data = await resp.json();
  const text = data.content?.find(b => b.type === 'text')?.text || '{}';
  
  return new Response(text.replace(/```json|```/g, '').trim(), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
