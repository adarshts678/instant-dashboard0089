export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { data, prompt } = req.body;

  // Call OpenAI API (replace with your API key in environment variables)
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a frontend developer. Output only valid HTML/CSS for a dashboard.' },
        { role: 'user', content: `Data: ${JSON.stringify(data)}\nPrompt: ${prompt}` }
      ],
      max_tokens: 1000
    }),
  });

  const openaiData = await openaiRes.json();
  const html = openaiData.choices?.[0]?.message?.content || '<div>AI did not return HTML.</div>';
  res.status(200).json({ html });
}
