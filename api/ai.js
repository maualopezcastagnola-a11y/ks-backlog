export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  const { prompt, platform, module } = await req.json();
  
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: `Sos un PM experto en SaaS. Convertí este requerimiento en una historia de usuario.\nRequerimiento: "${prompt}"\nPlataforma: ${platform||'—'} Producto: ${module||'—'}\nRespondé SOLO en JSON sin markdown:\n{"title":"máx 8 palabras","story":"Como [rol], quiero [acción] para [beneficio].","next":"primer paso técnico concreto"}`
      }],
      max_tokens: 400,
      temperature: 0.3
    })
  });
  
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  
  return new Response(text.replace(/```json|```/g, '').trim(), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
