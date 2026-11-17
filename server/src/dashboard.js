// Dashboard yang benar-benar berasal dari data backend: pipeline, log, draft,
// dan snapshot pasar. Tidak ada angka acak / timer simulasi.

import { readDb } from './storage.js';
import { getMarketSnapshot } from './marketData.js';

const DIVISIONS = 4;
const WORKERS = 16;

function relativeTime(iso) {
  if (!iso) return '-';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return '-';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min} mnt lalu`;
  const jam = Math.floor(min / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
}

function stageProgress(stage) {
  if (stage.status === 'done') return 100;
  if (stage.status === 'running') return 50;
  return 0;
}

export async function getDashboardData() {
  const db = readDb();
  const pipelines = db.pipelines || [];
  const drafts = db.drafts || [];
  const logs = db.logs || [];
  const market = await getMarketSnapshot();

  const latest = pipelines[0] || null;
  const stages = (latest?.stages || []).map((s, i) => ({
    id: `${latest.id}-${s.key}-${i}`,
    title: `Tahap ${i + 1}: ${s.title}`,
    owner: s.manager?.name || '-',
    division: s.division || '-',
    divisionColor: s.divisionColor || '#38bdf8',
    stage: s.status === 'done' ? 'Selesai' : s.status === 'running' ? 'Berjalan' : s.status === 'error' ? 'Gagal' : 'Menunggu',
    progress: stageProgress(s),
    pipelineId: latest.id,
    finishedAt: s.finishedAt || null,
  }));

  const activities = logs.slice(0, 10).map((l) => ({
    id: l.id,
    agent: l.agent || 'Sistem',
    text: l.message || '',
    division: l.division || '',
    time: relativeTime(l.at),
  }));

  const allStages = pipelines.flatMap((p) => p.stages || []);
  const metrics = {
    divisions: DIVISIONS,
    workers: WORKERS,
    campaigns: pipelines.filter((p) => p.status === 'running' || p.status === 'waiting_approval').length,
    pipelines: pipelines.length,
    stagesDone: allStages.filter((s) => s.status === 'done').length,
    drafts: drafts.length,
    approved: drafts.filter((d) => d.status === 'approved').length,
    productsScanned: market.products.length,
    trendsDetected: market.trends.length,
    commissionAvailable: false,
    salesTransactions: 0,
    marketFetchedAt: market.fetchedAt,
  };

  return {
    ok: true,
    metrics,
    tasks: stages,
    activities,
    market: {
      available: market.available,
      fetchedAt: market.fetchedAt,
      source: market.source,
      commission: market.commission,
      products: market.products.slice(0, 8),
      trends: market.trends.slice(0, 8),
      errors: market.errors,
    },
    note: 'Aktivitas, progres, draft, dan data produk berasal dari backend. Pos social media, leads, dan transaksi komisi belum terhubung ke API platform mana pun.',
  };
}
