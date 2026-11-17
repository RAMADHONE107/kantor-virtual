const base = import.meta.env.BASE_URL || '/';

async function req(path, options = {}) {
  const url = path.startsWith('/') ? path : `${base}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request gagal (${res.status})`);
  return data;
}

export const api = {
  health: () => req('/api/health'),
  drafts: () => req('/api/drafts'),
  logs: () => req('/api/logs'),
  pipelines: () => req('/api/pipelines'),
  dashboard: () => req('/api/dashboard'),
  market: () => req('/api/market'),
  refreshMarket: () => req('/api/market/refresh', { method: 'POST' }),
  runAgents: (payload) => req('/api/agents/run', { method: 'POST', body: JSON.stringify(payload || {}) }),
  runPipeline: (payload) => req('/api/pipelines/run', { method: 'POST', body: JSON.stringify(payload || {}) }),
  approveDraft: (id) => req(`/api/drafts/${id}/approve`, { method: 'POST' }),
  rejectDraft: (id) => req(`/api/drafts/${id}/reject`, { method: 'POST' }),
  approvePipeline: (id, note) => req(`/api/pipelines/${id}/approve`, { method: 'POST', body: JSON.stringify({ note }) }),
  rejectPipeline: (id, note) => req(`/api/pipelines/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),
};
