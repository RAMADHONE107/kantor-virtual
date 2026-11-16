import { generateText } from './llm.js';
import { readDb, writeDb, uid } from './storage.js';

const divisionPrompts = {
  'Divisi Riset & Strategi': {
    types: ['riset_tren', 'strategi_campaign'],
    instruction: 'Kamu tim Riset & Strategi affiliate. Hasilkan riset tren, analisis peluang, rekomendasi produk/angle, dan strategi campaign yang tajam dan bisa dieksekusi untuk TikTok dan Shopee.',
  },
  'Divisi Konten & Produksi': {
    types: ['skrip_video', 'caption_hook'],
    instruction: 'Kamu tim Konten & Produksi. Hasilkan ide konten, skrip video pendek (hook kuat, alur, CTA), dan caption/hook yang menarik untuk TikTok yang mengarahkan ke produk Shopee.',
  },
  'Divisi Desain & Brand': {
    types: ['brief_desain', 'konsep_visual'],
    instruction: 'Kamu tim Desain & Brand. Hasilkan brief desain visual (thumbnail/cover/banner), arahan gaya, warna, elemen CTA, dan konsep aset untuk konten TikTok & halaman/etalase Shopee.',
  },
  'Divisi Sosmed & Penjualan': {
    types: ['rencana_distribusi', 'skrip_followup'],
    instruction: 'Kamu tim Sosmed & Penjualan. Hasilkan rencana distribusi/jadwal posting TikTok, strategi balas komentar/DM, skrip follow-up leads, dan rencana closing/penawaran untuk produk Shopee.',
  },
};

function buildPrompt(division, type, context = {}) {
  const topic = context.topic || 'produk affiliate trending yang relevan untuk audiens Indonesia';
  const product = context.product ? `Fokus produk: ${context.product}.` : '';
  return `Divisi: ${division.name}
Misi: ${division.mission}
Tugas: buat draft tipe "${type}".
Topik/konteks: ${topic}. ${product}
Target channel prioritas: TikTok dan Shopee.

Format output (Bahasa Indonesia, gaya ENERGIK, jelas, siap dipakai):
- Judul singkat
- Tujuan
- Isi draft terstruktur (poin-poin/skrip langkah jelas)
- CTA yang spesifik
- Catatan eksekusi singkat

Buat 1 draft yang konkret dan actionable.`;
}

export async function runAgentsOnce({ divisions, topic, product }) {
  const db = readDb();
  const runId = uid('run');
  const created = [];
  const errors = [];
  const system = 'Kamu adalah asisten AI untuk tim operasional affiliate marketing. Jawab SELALU dalam Bahasa Indonesia dengan gaya energik, positif, percaya diri, dan profesional. Berikan output yang konkret, terstruktur, dan bisa langsung dieksekusi.';

  for (const division of divisions) {
    const cfg = divisionPrompts[division.name] || { types: ['draft_umum'], instruction: 'Buat draft operasional yang relevan.' };
    const type = cfg.types[Math.floor(Math.random() * cfg.types.length)];
    const agent = division.members[Math.floor(Math.random() * division.members.length)];
    try {
      const content = await generateText({
        system: `${system}\n${cfg.instruction}`,
        prompt: buildPrompt(division, type, { topic, product }),
      });
      const draft = {
        id: uid('draft'),
        runId,
        division: division.name,
        divisionId: division.id,
        divisionColor: division.color,
        agent: agent.name,
        role: agent.role,
        type,
        title: `${type.replace(/_/g, ' ')} — ${division.name}`,
        content,
        status: 'draft',
        createdAt: new Date().toISOString(),
        approvedAt: null,
      };
      db.drafts.unshift(draft);
      created.push(draft);
      db.logs.unshift({ id: uid('log'), at: draft.createdAt, level: 'info', agent: agent.name, division: division.name, message: `menghasilkan draft ${type} (menunggu approval)` });
    } catch (err) {
      errors.push({ division: division.name, agent: agent.name, error: err.message });
      db.logs.unshift({ id: uid('log'), at: new Date().toISOString(), level: 'error', agent: agent.name, division: division.name, message: `gagal menghasilkan draft: ${err.message}` });
    }
  }

  db.runs.unshift({ id: runId, at: new Date().toISOString(), topic: topic || null, product: product || null, created: created.length, errors: errors.length });
  db.drafts = db.drafts.slice(0, 200);
  db.runs = db.runs.slice(0, 100);
  db.logs = db.logs.slice(0, 300);
  writeDb(db);
  return { runId, created, errors };
}

export function listDrafts() {
  const db = readDb();
  return db.drafts || [];
}

export function updateDraftStatus(id, status) {
  const db = readDb();
  const draft = (db.drafts || []).find((d) => d.id === id);
  if (!draft) return null;
  draft.status = status;
  if (status === 'approved') draft.approvedAt = new Date().toISOString();
  db.logs.unshift({ id: uid('log'), at: new Date().toISOString(), level: 'info', agent: draft.agent, division: draft.division, message: `draft ${id} di-${status}` });
  writeDb(db);
  return draft;
}

export function listLogs() {
  const db = readDb();
  return db.logs || [];
}
