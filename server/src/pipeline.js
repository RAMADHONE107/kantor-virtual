import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateText } from './llm.js';
import { readDb, writeDb, uid } from './storage.js';

const stageDefs = [
  {
    key: 'riset',
    division: 'Divisi Riset & Strategi',
    title: 'Riset & Strategi',
    goal: 'Hasilkan riset tren, analisis audiens/kompetitor, pilihan angle, dan brief campaign yang jelas untuk TikTok & Shopee.',
  },
  {
    key: 'konten',
    division: 'Divisi Konten & Produksi',
    title: 'Konten & Produksi',
    goal: 'Berdasarkan riset & brief, hasilkan konsep video, skrip (hook-alur-CTA), caption, hashtag, dan shot list yang siap diproduksi (tanpa menghasilkan file video).',
  },
  {
    key: 'desain',
    division: 'Divisi Desain & Brand',
    title: 'Desain & Brand',
    goal: 'Berdasarkan konten, hasilkan brief visual: ide thumbnail/cover, teks on-screen, gaya warna, elemen brand, dan panduan aset pendukung.',
  },
  {
    key: 'distribusi',
    division: 'Divisi Sosmed & Penjualan',
    title: 'Distribusi & Penjualan',
    goal: 'Rakit Paket Siap Upload final: judul, caption & hashtag final, CTA/link placement, rencana posting TikTok, serta rencana balas komentar/DM dan follow-up leads ke Shopee.',
  },
];

function systemPrompt() {
  return 'Kamu adalah tim AI operasional affiliate marketing. Jawab SELALU dalam Bahasa Indonesia yang energik, positif, percaya diri, dan profesional. Output harus konkret, terstruktur, dan siap dieksekusi. Jangan menghasilkan file video; fokus pada materi/paket kerja tertulis.';
}

function buildStagePrompt(stage, ctx) {
  const prev = ctx.previous.map((p) => `### Output ${p.title} (${p.division})\n${p.output}`).join('\n\n') || '(Belum ada output sebelumnya, ini tahap awal.)';
  const workers = ctx.members.map((m) => `- ${m.name} (${m.role})`).join('\n');
  return `Kamu mengoordinasikan tim ${stage.division}.
Anggota tim yang mengerjakan tahap ini:
${workers}

Topik/Produk: ${ctx.topic || '-'} ${ctx.product ? `(Fokus: ${ctx.product})` : ''}
Target channel: TikTok & Shopee.

Tujuan tahap "${stage.title}": ${stage.goal}

Konteks dari tahap sebelumnya:
${prev}

Instruksi:
- Kerjakan sebagai hasil kolaborasi tim (sebutkan kontribusi per anggota secara singkat di bagian "Kontribusi Tim").
- Hasil harus detail, actionable, dan selaras dengan tahap sebelumnya.
- Format wajib:
  1) Judul Tahap
  2) Ringkasan
  3) Kontribusi Tim (per anggota)
  4) Hasil Kerja Utama (poin/struktur jelas)
  5) Serah Terima ke Tahap Berikutnya (atau "Siap masuk paket final" jika tahap terakhir)`;
}

function buildFinalPackage(pipeline) {
  const parts = pipeline.stages.map((s) => `## ${s.title} — ${s.division}\n**PIC Tim:** ${s.members.map(m=>m.name).join(', ')}\n\n${s.output}`).join('\n\n---\n\n');
  return `# Paket Siap Upload\n\n**Topik:** ${pipeline.topic || '-'}\n**Fokus Produk:** ${pipeline.product || '-'}\n**Pipeline ID:** ${pipeline.id}\n**Dibuat:** ${pipeline.createdAt}\n**Status:** ${pipeline.status}\n\n${parts}\n\n---\n## Catatan Keputusan\n- Status persetujuan: ${pipeline.status}\n- Catatan: ${pipeline.reviewNote || '-'}\n- Lokasi export: ${pipeline.exportPath || '(belum diexport)'}\n`;
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
  const pipeline = {
    id,
    topic: topic || '',
    product: product || '',
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stages: [],
    reviewNote: null,
    exportPath: null,
  };
  db.pipelines.unshift(pipeline);
  db.logs.unshift({ id: uid('log'), at: pipeline.createdAt, level: 'info', agent: 'Sistem', division: 'Operasional', message: `Pipeline ${id} dimulai: "${topic || 'tanpa topik'}"` });
  writeDb(db);

  const previous = [];
  for (const def of stageDefs) {
    const div = divisions.find((d) => d.name === def.division) || divisions[0];
    const stage = {
      key: def.key,
      title: def.title,
      division: def.division,
      divisionId: div.id,
      divisionColor: div.color,
      members: div.members || [],
      status: 'running',
      output: '',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      error: null,
    };
    pipeline.stages.push(stage);
    db.logs.unshift({ id: uid('log'), at: stage.startedAt, level: 'info', agent: (div.members[0]||{}).name || 'Tim', division: def.division, message: `mengerjakan tahap ${def.title}` });
    writeDb(db);
    try {
      const output = await generateText({
        system: systemPrompt(),
        prompt: buildStagePrompt(def, { previous, members: div.members || [], topic, product }),
      });
      stage.output = output;
      stage.status = 'done';
      stage.finishedAt = new Date().toISOString();
      previous.push({ title: def.title, division: def.division, output });
      db.logs.unshift({ id: uid('log'), at: stage.finishedAt, level: 'info', agent: (div.members[0]||{}).name || 'Tim', division: def.division, message: `tahap ${def.title} selesai` });
    } catch (err) {
      stage.status = 'error';
      stage.error = err.message;
      stage.finishedAt = new Date().toISOString();
      pipeline.status = 'error';
      pipeline.updatedAt = stage.finishedAt;
      db.logs.unshift({ id: uid('log'), at: stage.finishedAt, level: 'error', agent: (div.members[0]||{}).name || 'Tim', division: def.division, message: `tahap ${def.title} gagal: ${err.message}` });
      writeDb(db);
      return pipeline;
    }
    pipeline.updatedAt = new Date().toISOString();
    writeDb(db);
  }

  pipeline.status = 'waiting_approval';
  pipeline.finalPackage = buildFinalPackage(pipeline);
  pipeline.updatedAt = new Date().toISOString();
  db.logs.unshift({ id: uid('log'), at: pipeline.updatedAt, level: 'info', agent: 'Sistem', division: 'Operasional', message: `Pipeline ${id} selesai dan menunggu keputusan: Layak Upload?` });
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
  db.logs.unshift({ id: uid('log'), at: p.updatedAt, level: 'info', agent: 'Sistem', division: 'Operasional', message: `Pipeline ${id} disetujui dan diexport ke: ${mdPath}` });
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
  db.logs.unshift({ id: uid('log'), at: p.updatedAt, level: 'info', agent: 'Sistem', division: 'Operasional', message: `Pipeline ${id} ditolak: ${p.reviewNote}` });
  writeDb(db);
  return p;
}
