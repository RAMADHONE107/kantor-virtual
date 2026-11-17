// Menghasilkan snapshot data NYATA dari backend untuk fallback aplikasi statis
// (GitHub Pages tidak punya server /api). Snapshot diberi timestamp transparan.
//
// Jalankan: cd server && npm run snapshot
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDashboardData } from '../src/dashboard.js';
import { getMarketSnapshot } from '../src/marketData.js';
import { listDrafts, listLogs } from '../src/agents.js';
import { listPipelines } from '../src/pipeline.js';

await getMarketSnapshot({ force: true });
const dashboard = await getDashboardData();

const snapshot = {
  generatedAt: new Date().toISOString(),
  isSnapshot: true,
  dashboard,
  drafts: listDrafts(),
  logs: listLogs(),
  pipelines: listPipelines(),
};

const out = fileURLToPath(new URL('../../src/data/liveSnapshot.json', import.meta.url));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `Snapshot nyata ditulis: ${out}\n` +
  `  produk: ${dashboard.market.products.length}, tren: ${dashboard.market.trends.length}, ` +
  `pipeline: ${snapshot.pipelines.length}, draft: ${snapshot.drafts.length}, log: ${snapshot.logs.length}`,
);
