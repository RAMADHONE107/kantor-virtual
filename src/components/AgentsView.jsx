import React, { useState } from 'react';

function StatusPill({ status }) {
  const map = { draft: ['Menunggu Approval', 'status-queue'], approved: ['Disetujui', 'status-done'], rejected: ['Ditolak', 'status-progress'] };
  const [label, cls] = map[status] || [status, 'status-queue'];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function AgentsView({ backend, drafts, logs, onRun, onApprove, onReject, running }) {
  const [topic, setTopic] = useState('');
  const [product, setProduct] = useState('');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Phase A — Agen Nyata (LLM)</div>
          <h1>Agen AI & Draft Operasional</h1>
          <p className="muted">Aktifkan agen di setiap divisi untuk menghasilkan riset, skrip, brief desain, dan rencana distribusi secara nyata dalam Bahasa Indonesia yang energik dan profesional. Setiap draft melalui persetujuan sebelum dieksekusi.</p>
        </div>
        <div>
          <span className={`pill ${backend.ok ? 'live' : ''}`}>{backend.ok ? `Backend aktif (${backend.llmProvider}${backend.hasKey ? ', API key siap' : ', API key belum diisi'})` : 'Backend offline'}</span>
        </div>
      </div>

      <section className="card">
        <div className="card-head"><h2>Jalankan Agen</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Topik / tujuan campaign</div>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="mis. Promo produk viral untuk TikTok & Shopee" style={inputStyle} />
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Fokus produk (opsional)</div>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="mis. Lampu LED konten, mic wireless, dll." style={inputStyle} />
          </div>
          <div>
            <button className="btn primary" onClick={() => onRun({ topic, product })} disabled={running || !backend.ok}>
              {running ? 'Agen bekerja...' : 'Jalankan Agen (4 Divisi)'}
            </button>
          </div>
        </div>
        {!backend.ok && <div className="muted" style={{ marginTop: 10 }}>Jalankan server backend agar agen bisa menghasilkan draft nyata: <code>cd ai-office-base/server && npm run dev</code> (set <code>GROQ_API_KEY</code> di <code>server/.env</code>).</div>}
        {backend.ok && !backend.hasKey && <div className="muted" style={{ marginTop: 10 }}>Backend aktif tapi <strong>API key belum diisi</strong>. Tambahkan <code>GROQ_API_KEY</code> di <code>ai-office-base/server/.env</code> lalu restart server.</div>}
      </section>

      <div className="grid two">
        <section className="card">
          <div className="card-head"><h2>Draft Dihasilkan Agen</h2><span className="pill">{drafts.length} draft</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 520, overflow: 'auto', paddingRight: 4 }}>
            {drafts.length === 0 && <div className="muted">Belum ada draft. Jalankan agen untuk menghasilkan draft nyata.</div>}
            {drafts.map((d) => (
              <div key={d.id} className="card soft" style={{ boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{d.title}</div>
                    <div className="division-meta"><span className="dot" style={{ background: d.divisionColor, marginRight: 6, verticalAlign: 'middle' }} />{d.agent} · {d.role} · {d.division}</div>
                  </div>
                  <StatusPill status={d.status} />
                </div>
                <pre style={preStyle}>{d.content}</pre>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn primary" onClick={() => onApprove(d.id)} disabled={d.status === 'approved'}>Approve</button>
                  <button className="btn" onClick={() => onReject(d.id)} disabled={d.status === 'rejected'}>Tolak</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>Log Aktivitas Agen</h2><span className="pill live">Real</span></div>
          <div className="activity-list" style={{ maxHeight: 520, overflow: 'auto' }}>
            {logs.length === 0 && <div className="muted">Belum ada log. Aktivitas agen akan muncul di sini.</div>}
            {logs.map((l) => (
              <div key={l.id} className="activity-item">
                <span className="dot" style={{ background: l.level === 'error' ? '#ef4444' : '#22c55e', marginTop: 6 }} />
                <div>
                  <div className="activity-text"><strong>{l.agent || 'Sistem'}</strong> — {l.message}</div>
                  <div className="activity-time">{l.division || ''} · {new Date(l.at).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card soft">
        <h2 style={{ marginBottom: 6 }}>Roadmap Integrasi (D)</h2>
        <p className="muted"><strong>Phase A (aktif):</strong> agen LLM menghasilkan draft operasional nyata dengan alur persetujuan. <strong>Phase B:</strong> integrasi eksekusi & penjadwalan konten di TikTok. <strong>Phase C:</strong> integrasi Shopee untuk leads, penjualan, dan tracking komisi secara end-to-end. <em>Butuh kredensial/API resmi platform untuk aktivasi B & C.</em></p>
      </section>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #d9e2ee', background: '#fff', font: 'inherit' };
const preStyle = { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.55, color: '#334155', background: '#fff', border: '1px solid #e6ebf2', borderRadius: 10, padding: 10, margin: 0, maxHeight: 220, overflow: 'auto' };
