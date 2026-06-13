export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  const { prompt, platform, module, platformList } = await req.json();
  
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'system',
        content: `Sos un Product Manager experto en SaaS B2B. Respondés SOLO con JSON válido, sin texto adicional.`
      },{
        role: 'user',
        content: `Requerimiento: "${prompt}"\n\nPlataformas: remedia(Receta,Salda,Llega,Cerca,Activa), fluye(Cerca,Llega,Activa,Salda), pymero(Pymero), focusia(FocusIA), tranca(Tranca)\n\nReglas:\n- title: máx 6 palabras descriptivas del feature, SIN primera persona\n- story: SIEMPRE "Como [rol], quiero [acción] para [beneficio]."\n- next: acción técnica concreta máx 8 palabras\n- platform: detectar de las claves arriba o ""\n- module: producto exacto dentro de la plataforma o ""\n- prio: high si urgente/demo/esta semana, sino mid\n\n{"title":"...","story":"...","next":"...","platform":"...","module":"...","prio":"..."}`
      }],
      max_tokens: 400,
      temperature: 0.1
    })
  });
  
  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content || '{}';
  const clean = raw.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  
  return new Response(clean.slice(start, end + 1), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
