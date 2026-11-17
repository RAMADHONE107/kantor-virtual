const PROVIDERS = {
  hermes: {
    url: () => process.env.HERMES_BASE_URL || 'http://127.0.0.1:8642/v1/chat/completions',
    keyEnv: 'HERMES_API_KEY',
    modelEnv: 'HERMES_MODEL',
    defaultModel: 'hermes-agent',
    timeoutMs: 240000,
  },
  groq: {
    url: () => 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    modelEnv: 'GROQ_MODEL',
    defaultModel: 'openai/gpt-oss-20b',
    timeoutMs: 120000,
  },
};

export async function generateText({ system, prompt }) {
  const providerName = (process.env.LLM_PROVIDER || 'groq').toLowerCase();
  const provider = PROVIDERS[providerName];
  if (!provider) throw new Error(`Provider LLM tidak didukung: ${providerName}`);

  const apiKey = process.env[provider.keyEnv];
  if (!apiKey) throw new Error(`${provider.keyEnv} belum diisi. Set di server/.env`);

  const model = process.env[provider.modelEnv] || provider.defaultModel;
  const maxRetries = 4;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(provider.url(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(provider.timeoutMs || 120000),
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
      if (res.status === 429 && attempt < maxRetries) {
        const m = text.match(/try again in ([0-9.]+)s/i);
        const waitMs = Math.ceil((m ? parseFloat(m[1]) : 20) * 1000) + 1500;
        await new Promise((r) => setTimeout(r, Math.min(waitMs, 60000)));
        continue;
      }
      throw new Error(`LLM error ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Respons LLM kosong');
    return content.trim();
  }
  throw new Error('LLM gagal setelah beberapa percobaan');
}
