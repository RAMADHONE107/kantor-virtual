import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAgentsOnce, listDrafts, updateDraftStatus, listLogs } from './agents.js';
import { runPipeline, listPipelines, getPipeline, approvePipeline, rejectPipeline } from './pipeline.js';
import { getDashboardData } from './dashboard.js';
import { getMarketSnapshot } from './marketData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve team data source for convenience? not needed; frontend has it. We'll accept divisions from client or embed.
const divisionsDefault = [
  { id: 'alpha', name: 'Divisi Riset & Strategi', mission: 'Riset pasar, validasi produk, strategi offer, dan perencanaan campaign affiliate.', color: '#38bdf8', members: [{ name: 'Raka', role: 'Lead Riset Produk' }, { name: 'Bima', role: 'Analis Pasar' }, { name: 'Andi', role: 'Riset Kompetitor' }, { name: 'Faris', role: 'Strategi Funnel' }] },
  { id: 'beta', name: 'Divisi Konten & Produksi', mission: 'Mengubah strategi menjadi konten: skrip, video, live, dan edukasi produk.', color: '#e879f9', members: [{ name: 'Sinta', role: 'Lead Produksi Konten' }, { name: 'Lina', role: 'Copywriter & Script' }, { name: 'Maya', role: 'Video & Live Host' }, { name: 'Kei', role: 'Konten Edukasi' }] },
  { id: 'gamma', name: 'Divisi Desain & Brand', mission: 'Menjaga visual profesional dan konsisten untuk menaikkan kepercayaan serta CTR.', color: '#34d399', members: [{ name: 'Dimas', role: 'Lead Desain Visual' }, { name: 'Reza', role: 'Desainer Konten' }, { name: 'Galih', role: 'Brand Visual' }, { name: 'Yoga', role: 'Motion & Asset' }] },
  { id: 'delta', name: 'Divisi Sosmed & Penjualan', mission: 'Distribusi konten, kelola komunitas/leads, closing dan rekap penjualan.', color: '#fbbf24', members: [{ name: 'Naya', role: 'Lead Growth & Sosmed' }, { name: 'Tari', role: 'Ads & Social Media' }, { name: 'Rani', role: 'Komunitas & CRM' }, { name: 'Vina', role: 'Sales & Closing' }] },
];

app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.GROQ_API_KEY || !!process.env.OPENAI_API_KEY;
  res.json({ ok: true, llmProvider: process.env.LLM_PROVIDER || 'groq', hasKey, time: new Date().toISOString() });
});

app.get('/api/drafts', (req, res) => {
  res.json({ drafts: listDrafts() });
});

app.get('/api/logs', (req, res) => {
  res.json({ logs: listLogs() });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    res.json(await getDashboardData());
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/market', async (req, res) => {
  try {
    res.json(await getMarketSnapshot());
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/market/refresh', async (req, res) => {
  try {
    res.json(await getMarketSnapshot({ force: true }));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/agents/run', async (req, res) => {
  try {
    const { topic, product, divisions } = req.body || {};
    const divs = Array.isArray(divisions) && divisions.length ? divisions : divisionsDefault;
    const result = await runAgentsOnce({ divisions: divs, topic, product });
    res.json({ ok: true, ...result, drafts: listDrafts() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/drafts/:id/approve', (req, res) => {
  const draft = updateDraftStatus(req.params.id, 'approved');
  if (!draft) return res.status(404).json({ ok: false, error: 'Draft tidak ditemukan' });
  res.json({ ok: true, draft, drafts: listDrafts() });
});

app.post('/api/drafts/:id/reject', (req, res) => {
  const draft = updateDraftStatus(req.params.id, 'rejected');
  if (!draft) return res.status(404).json({ ok: false, error: 'Draft tidak ditemukan' });
  res.json({ ok: true, draft, drafts: listDrafts() });
});

app.get('/api/pipelines', (req, res) => {
  res.json({ pipelines: listPipelines() });
});

app.get('/api/pipelines/:id', (req, res) => {
  const pipeline = getPipeline(req.params.id);
  if (!pipeline) return res.status(404).json({ ok: false, error: 'Pipeline tidak ditemukan' });
  res.json({ ok: true, pipeline });
});

app.post('/api/pipelines/run', async (req, res) => {
  try {
    const { topic, product, divisions } = req.body || {};
    const divs = Array.isArray(divisions) && divisions.length ? divisions : divisionsDefault;
    const pipeline = await runPipeline({ divisions: divs, topic, product });
    res.json({ ok: true, pipeline, pipelines: listPipelines() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/pipelines/:id/approve', (req, res) => {
  try {
    const pipeline = approvePipeline(req.params.id, req.body?.note);
    if (!pipeline) return res.status(404).json({ ok: false, error: 'Pipeline tidak ditemukan' });
    res.json({ ok: true, pipeline, pipelines: listPipelines() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/pipelines/:id/reject', (req, res) => {
  try {
    const pipeline = rejectPipeline(req.params.id, req.body?.note);
    if (!pipeline) return res.status(404).json({ ok: false, error: 'Pipeline tidak ditemukan' });
    res.json({ ok: true, pipeline, pipelines: listPipelines() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Optional: serve built frontend in production
const distPath = path.join(__dirname, '..', '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => { if (err) next(); });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Affiliate Studio server running on http://localhost:${port}`));
