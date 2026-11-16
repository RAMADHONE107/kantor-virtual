const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    modelEnv: 'GROQ_MODEL',
    defaultModel: 'openai/gpt-oss-20b',
  },
};

export async function generateText({ system, prompt }) {
  const providerName = (process.env.LLM_PROVIDER || 'groq').toLowerCase();
  const provider = PROVIDERS[providerName];
  if (!provider) throw new Error(`Provider LLM tidak didukung: ${providerName}`);

  const apiKey = process.env[provider.keyEnv];
  if (!apiKey) throw new Error(`${provider.keyEnv} belum diisi. Set di server/.env`);

  const model = process.env[provider.modelEnv] || provider.defaultModel;
  const res = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Respons LLM kosong');
  return content.trim();
}
