import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateText } from './llm.js';
import { readDb, writeDb, uid } from './storage.js';
import { getMarketSnapshot, marketBrief } from './marketData.js';

const DOMAIN = 'Kecantikan dan Perawatan Kulit';

const stageDefs = [
  {
    key: 'riset',
    division: 'Divisi Riset & Strategi',
    title: 'Riset & Strategi',
    goal: 'Riset tren TikTok & Shopee, temukan produk kecantikan/perawatan kulit yang viral, penjualan tinggi, dan berpotensi komisi tinggi; pilih produk/topik terbaik dan tetapkan strategi serta brief campaign.',
    decision: 'Manager memutuskan 1 produk + 1 angle/topik utama yang paling layak dieksekusi beserta alasannya.',
  },
  {
    key: 'konten',
    division: 'Divisi Konten & Produksi',
    title: 'Konten & Produksi',
    goal: 'Berdasarkan keputusan riset, susun konsep video, skrip (hook-alur-CTA), caption, hashtag, dan shot list yang siap diproduksi (tanpa menghasilkan file video).',
    decision: 'Manager memutuskan konsep dan skrip final yang akan dipakai.',
  },
  {
    key: 'desain',
    division: 'Divisi Desain & Brand',
    title: 'Desain & Brand',
    goal: 'Berdasarkan konten final, susun brief visual: ide thumbnail/cover, teks on-screen, gaya warna, elemen brand, dan panduan aset pendukung.',
    decision: 'Manager memutuskan arah visual & thumbnail utama yang dipakai.',
  },
  {
    key: 'distribusi',
    division: 'Divisi Sosmed & Penjualan',
    title: 'Distribusi & Penjualan',
    goal: 'Rakit Paket Siap Upload final: judul, caption & hashtag final, CTA/link placement, rencana posting TikTok, serta rencana balas komentar/DM dan follow-up leads ke Shopee.',
    decision: 'Manager memutuskan paket final dan rencana distribusi yang dinyatakan SIAP diajukan untuk persetujuan upload.',
  },
];

function systemPrompt() {
  return 'Kamu adalah tim AI operasional affiliate marketing profesional. Jawab SELALU dalam Bahasa Indonesia yang energik, positif, percaya diri, dan terstruktur. Setiap divisi punya manager yang mengambil keputusan. Output harus konkret, actionable, dan siap dieksekusi. Jangan menghasilkan file video; fokus pada materi/paket kerja tertulis. Jika data pasar nyata diberikan, gunakan data itu dan cantumkan sumbernya. DILARANG mengarang harga, jumlah penjualan, atau komisi. Jika data tidak tersedia, nyatakan dengan jujur.';
}

function getManager(members = []) {
  return members.find((m) => /lead|manager|head/i.test(m.role || '')) || members[0] || { name: 'Manager', role: 'Manager' };
}

function buildStagePrompt(stage, ctx) {
  const prev = ctx.previous.map((p) => {
    const out = (p.output || '');
    const trimmed = out.length > 2200 ? out.slice(0, 2200) + '\n...[diringkas]' : out;
    return `### Output ${p.title} (${p.division})\n**Keputusan Manager:** ${(p.managerDecision || '-').slice(0, 700)}\n\n${trimmed}`;
  }).join('\n\n') || '(Tahap awal — belum ada output sebelumnya.)';
  const workers = ctx.members.map((m) => `- ${m.name} (${m.role})`).join('\n');
  const isFirst = ctx.previous.length === 0;
  const autoBrief = isFirst
    ? `Tugas khusus tahap awal (OTOMATIS):\n- Domain ditetapkan: ${DOMAIN}.\n- Berikut data pasar nyata yang harus dipakai sebagai dasar riset:\n\n${ctx.marketBrief || '(data pasar belum tersedia)'}\n\n- Pilih 2-3 kandidat dari daftar produk nyata lalu PUTUSKAN 1 produk/topik utama terbaik untuk dieksekusi sekarang.\n- Sertakan URL produk sumber dan waktu data di hasil riset.\n- Jika topik/produk awal dari user kosong, tim WAJIB menentukan sendiri dari data nyata di atas.`
    : `Tugas lanjutan: ikuti keputusan & brief dari tahap sebelumnya, jangan mengubah produk/angle utama kecuali manager tahap ini memberi alasan kuat dan keputusan revisi yang jelas.`;

  return `Kamu mengoordinasikan tim ${stage.division}.
Manager Divisi (pengambil keputusan): ${ctx.manager.name} (${ctx.manager.role})
Anggota tim:
${workers}

Domain/Niche: ${DOMAIN}
Input awal (opsional): Topik="${ctx.topic || ''}" Produk="${ctx.product || ''}"
Target channel: TikTok & Shopee.

Tujuan tahap "${stage.title}": ${stage.goal}
Kewenangan keputusan: ${stage.decision}

${autoBrief}

Konteks tahap sebelumnya:
${prev}

Instruksi kerja:
- Kerjakan sebagai kolaborasi 1 manager + anggota tim; tampilkan kontribusi tiap anggota secara singkat.
- Manager HARUS membuat keputusan tegas di bagian "Keputusan Manager".
- Hasil harus detail, konkret, dan selaras antar divisi.
- Format output WAJIB:
  1) Judul Tahap
  2) Ringkasan
  3) Kontribusi Tim (per anggota)
  4) Hasil Kerja Utama (poin/struktur jelas)
  5) Keputusan Manager (keputusan final + alasan singkat)
  6) Serah Terima ke Divisi Berikutnya (atau "SIAP DIAJUKAN: Layak Upload?" jika tahap akhir)`;
}

function extractManagerDecision(text) {
  if (!text) return '';
  const lines = String(text).split(/\r?\n/);
  const isHeading = (l, word) => new RegExp(`^\\s*(?:\\d+\\)|#+\\s*)?\\s*\\**\\s*${word}\\b`, 'i').test(l);
  const start = lines.findIndex((l) => isHeading(l, 'Keputusan Manager'));
  if (start < 0) return text.slice(0, 400);
  const picked = [];
  for (let i = start; i < lines.length; i++) {
    if (i > start && isHeading(lines[i], 'Serah Terima')) break;
    picked.push(lines[i]);
  }
  const clean = picked.join('\n')
    .replace(/^\s*(?:\d+\)|#+\s*)?\s*\**\s*Keputusan Manager\s*\**\s*:?\s*/i, '')
    .trim();
  return clean.slice(0, 800) || text.slice(0, 400);
}

function buildFinalPackage(pipeline) {
  const parts = pipeline.stages.map((s) => `## ${s.title} — ${s.division}\n**Manager:** ${s.manager?.name || '-'} (${s.manager?.role || '-'})\n**Tim:** ${(s.members||[]).map(m=>m.name).join(', ')}\n\n### Keputusan Manager\n${s.managerDecision || '-'}\n\n### Hasil Kerja\n${s.output}`).join('\n\n---\n\n');
  const marketInfo = pipeline.market
    ? `\n## Sumber Data Pasar\n- Sumber produk: ${pipeline.market.source.products}\n- Sumber tren: ${pipeline.market.source.trends}\n- Diambil: ${pipeline.market.fetchedAt}\n- Produk dianalisis: ${pipeline.market.productCount}\n- Komisi: ${pipeline.market.source.commission}\n`
    : '\n## Sumber Data Pasar\n- Tidak tersedia.\n';
  return `# Paket Siap Upload\n\n**Domain:** ${DOMAIN}\n**Topik:** ${pipeline.topic || '-'}\n**Fokus Produk:** ${pipeline.product || '-'}\n**Pipeline ID:** ${pipeline.id}\n**Dibuat:** ${pipeline.createdAt}\n**Status:** ${pipeline.status}\n${marketInfo}\n${parts}\n\n---\n## Keputusan Akhir (Persetujuan Upload)\n- Status persetujuan: ${pipeline.status}\n- Catatan: ${pipeline.reviewNote || '-'}\n- Lokasi export: ${pipeline.exportPath || '(belum diexport)'}\n`;
}

function downloadsDir() {
  const home = os.homedir();
  const candidates = [
    path.join(home, 'storage', 'downloads'),
    '/sdcard/Download',
    path.join(home, 'Downloads'),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  return path.join(home, 'storage', 'downloads');
}

function safeName(s) {
  return String(s || 'konten').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'konten';
}

export async function runPipeline({ divisions, topic, product }) {
  const db = readDb();
  const id = uid('pipe');
  const autoTopic = topic && topic.trim() ? topic.trim() : `Auto: Produk ${DOMAIN} dari data pasar nyata`;
  const autoProduct = product && product.trim() ? product.trim() : DOMAIN;
  let marketSnapshot = null;
  try { marketSnapshot = await getMarketSnapshot(); } catch { /* pipeline tetap jalan tanpa data */ }
  const marketBriefText = marketBrief(marketSnapshot);
  const pipeline = {
    id,
    domain: DOMAIN,
    topic: autoTopic,
    product: autoProduct,
    market: marketSnapshot ? {
      available: marketSnapshot.available,
      fetchedAt: marketSnapshot.fetchedAt,
      source: marketSnapshot.source,
      productCount: marketSnapshot.products.length,
      trendCount: marketSnapshot.trends.length,
      errors: marketSnapshot.errors,
    } : null,
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stages: [],
    reviewNote: null,
    exportPath: null,
  };
  db.pipelines.unshift(pipeline);
  db.logs.unshift({ id: uid('log'), at: pipeline.createdAt, level: 'info', agent: 'Sistem', division: 'Operasional', message: `Pipeline ${id} dimulai (otomatis): ${DOMAIN} — mencari produk/topik komisi tinggi & viral` });
  writeDb(db);

  const previous = [];
  for (const def of stageDefs) {
    const div = divisions.find((d) => d.name === def.division) || divisions[0];
    const manager = getManager(div.members || []);
    const stage = {
      key: def.key,
      title: def.title,
      division: def.division,
      divisionId: div.id,
      divisionColor: div.color,
      members: div.members || [],
      manager,
      status: 'running',
      output: '',
      managerDecision: '',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      error: null,
    };
    pipeline.stages.push(stage);
    db.logs.unshift({ id: uid('log'), at: stage.startedAt, level: 'info', agent: manager.name, division: def.division, message: `Manager memimpin tahap ${def.title}` });
    writeDb(db);
    try {
      const output = await generateText({
        system: systemPrompt(),
        prompt: buildStagePrompt(def, { previous, members: div.members || [], manager, topic: autoTopic, product: autoProduct, marketBrief: marketBriefText }),
      });
      stage.output = output;
      stage.managerDecision = extractManagerDecision(output);
      stage.status = 'done';
      stage.finishedAt = new Date().toISOString();
      previous.push({ title: def.title, division: def.division, output, managerDecision: stage.managerDecision });
      db.logs.unshift({ id: uid('log'), at: stage.finishedAt, level: 'info', agent: manager.name, division: def.division, message: `keputusan & hasil tahap ${def.title} selesai` });
    } catch (err) {
      stage.status = 'error';
      stage.error = err.message;
      stage.finishedAt = new Date().toISOString();
      pipeline.status = 'error';
      pipeline.updatedAt = stage.finishedAt;
      db.logs.unshift({ id: uid('log'), at: stage.finishedAt, level: 'error', agent: manager.name, division: def.division, message: `tahap ${def.title} terhenti: ${err.message}` });
      writeDb(db);
      return pipeline;
    }
    pipeline.updatedAt = new Date().toISOString();
    writeDb(db);
  }

  pipeline.status = 'waiting_approval';
  pipeline.finalPackage = buildFinalPackage(pipeline);
  pipeline.updatedAt = new Date().toISOString();
  db.logs.unshift({ id: uid('log'), at: pipeline.updatedAt, level: 'info', agent: 'Naya', division: 'Divisi Sosmed & Penjualan', message: `Paket siap upload diajukan. Menunggu keputusan kamu: Layak Upload?` });
  db.pipelines = db.pipelines.slice(0, 50);
  writeDb(db);
  return pipeline;
}

export function listPipelines() {
  const db = readDb();
  return db.pipelines || [];
}

export function getPipeline(id) {
  const db = readDb();
  return (db.pipelines || []).find((p) => p.id === id) || null;
}

export function approvePipeline(id, note) {
  const db = readDb();
  const p = (db.pipelines || []).find((x) => x.id === id);
  if (!p) return null;
  const dir = downloadsDir();
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `Paket-Siap-Upload_${safeName(p.topic || p.product || 'konten')}_${stamp}`;
  const mdPath = path.join(dir, `${base}.md`);
  const jsonPath = path.join(dir, `${base}.json`);
  if (!p.finalPackage) p.finalPackage = buildFinalPackage(p);
  fs.writeFileSync(mdPath, p.finalPackage, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(p, null, 2), 'utf8');
  p.status = 'approved_exported';
  p.reviewNote = note || 'Disetujui - layak upload';
  p.exportPath = mdPath;
  p.exportJsonPath = jsonPath;
  p.updatedAt = new Date().toISOString();
  db.logs.unshift({ id: uid('log'), at: p.updatedAt, level: 'info', agent: 'Sistem', division: 'Operasional', message: `Paket disetujui & disimpan ke: ${mdPath}` });
  writeDb(db);
  return p;
}

export function rejectPipeline(id, note) {
  const db = readDb();
  const p = (db.pipelines || []).find((x) => x.id === id);
  if (!p) return null;
  p.status = 'rejected';
  p.reviewNote = note || 'Ditolak - perlu revisi';
  p.updatedAt = new Date().toISOString();
  db.logs.unshift({ id: uid('log'), at: p.updatedAt, level: 'info', agent: 'Sistem', division: 'Operasional', message: `Paket ditolak: ${p.reviewNote}` });
  writeDb(db);
  return p;
}
