import React, { useState } from 'react';

function StatusPill({ status }) {
  const map = {
    draft: ['Menunggu Persetujuan', 'status-queue'],
    approved: ['Disetujui', 'status-done'],
    rejected: ['Ditolak', 'status-progress'],
  };
  const [label, cls] = map[status] || [status, 'status-queue'];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function AgentsView({ backend, drafts, logs, onRun, onApprove, onReject, running }) {
  const [topic, setTopic] = useState('');
  const [product, setProduct] = useState('');

  const ready = backend.ok && backend.hasKey;
  const statusLabel = ready ? 'Agen Siap Bekerja' : backend.ok ? 'Agen Perlu Aktivasi' : 'Agen Tidak Terhubung';
  const statusClass = ready ? 'pill live' : 'pill';

  return (
    <div className="page">
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #4f46e5 75%, #0891b2 100%)',
          padding: '26px 24px', color: '#fff', position: 'relative'
        }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 700 }}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>AI Operations Center</div>
              <h1 style={{ color: '#fff', marginBottom: 8 }}>Pusat Kendali Agen AI</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 720 }}>
                Aktifkan 4 divisi untuk menghasilkan riset, skrip konten, brief desain, dan rencana distribusi secara nyata.
                Setiap hasil ditinjau lebih dulu agar tetap rapi, terarah, dan siap dieksekusi.
              </p>
            </div>
            <span className={statusClass} style={{ background: ready ? undefined : 'rgba(255,255,255,0.9)' }}>{statusLabel}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginTop: 18, position: 'relative', zIndex: 1 }}>
            <MiniStat label="Divisi Aktif" value="4" />
            <MiniStat label="Pekerja AI" value="16" />
            <MiniStat label="Draft Tersedia" value={drafts.length} />
            <MiniStat label="Disetujui" value={drafts.filter(d => d.status === 'approved').length} />
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <div className="card-head" style={{ marginBottom: 10 }}><h2>Jalankan Siklus Kerja Agen</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <div className="stat-label" style={{ marginBottom: 6 }}>Topik / Tujuan Campaign</div>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Promo produk viral untuk TikTok & Shopee" style={inputStyle} />
            </div>
            <div>
              <div className="stat-label" style={{ marginBottom: 6 }}>Fokus Produk (Opsional)</div>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Contoh: Lampu LED konten, mic wireless, ring light" style={inputStyle} />
            </div>
            <div>
              <button className="btn primary" onClick={() => onRun({ topic, product })} disabled={running || !ready} style={{ minWidth: 210 }}>
                {running ? 'Agen Sedang Bekerja...' : 'Jalankan Agen (4 Divisi)'}
              </button>
            </div>
          </div>
          {!ready && (
            <div className="card soft" style={{ marginTop: 12, boxShadow: 'none' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Layanan agen belum siap</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Pastikan layanan agen sudah aktif dan siap digunakan agar sistem dapat menghasilkan draft operasional secara otomatis.
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid two">
        <section className="card">
          <div className="card-head"><h2>Draft Hasil Kerja Agen</h2><span className="pill">{drafts.length} draft</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 560, overflow: 'auto', paddingRight: 4 }}>
            {drafts.length === 0 && (
              <div className="card soft" style={{ boxShadow: 'none', textAlign: 'center', padding: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Belum ada draft</div>
                <div className="muted">Jalankan agen untuk menghasilkan ide, riset, dan materi kerja nyata dari setiap divisi.</div>
              </div>
            )}
            {drafts.map((d) => (
              <div key={d.id} className="card soft" style={{ boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{d.title}</div>
                    <div className="division-meta"><span className="dot" style={{ background: d.divisionColor, marginRight: 6, verticalAlign: 'middle' }} />{d.agent} · {d.role} · {d.division}</div>
                  </div>
                  <StatusPill status={d.status} />
                </div>
                <pre style={preStyle}>{d.content}</pre>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn primary" onClick={() => onApprove(d.id)} disabled={d.status === 'approved'}>Setujui Draft</button>
                  <button className="btn" onClick={() => onReject(d.id)} disabled={d.status === 'rejected'}>Tolak</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>Aktivitas & Log Agen</h2><span className="pill live">Real-time</span></div>
          <div className="activity-list" style={{ maxHeight: 560, overflow: 'auto' }}>
            {logs.length === 0 && (
              <div className="card soft" style={{ boxShadow: 'none', textAlign: 'center', padding: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Belum ada aktivitas</div>
                <div className="muted">Log kerja agen akan tampil di sini saat proses berjalan.</div>
              </div>
            )}
            {logs.map((l) => (
              <div key={l.id} className="activity-item">
                <span className="dot" style={{ background: l.level === 'error' ? '#ef4444' : '#22c55e', marginTop: 6 }} />
                <div>
                  <div className="activity-text"><strong>{l.agent || 'Sistem'}</strong> — {l.message}</div>
                  <div className="activity-time">{l.division || 'Operasional'} · {new Date(l.at).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card soft">
        <div className="card-head" style={{ marginBottom: 6 }}><h2>Alur Eksekusi Bertahap</h2></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          <RoadmapItem step="Phase A" title="Draft & Persetujuan" text="Agen menghasilkan riset, konten, dan rencana kerja nyata dengan alur tinjau & setujui." active />
          <RoadmapItem step="Phase B" title="Eksekusi TikTok" text="Penjadwalan, publikasi, dan pengelolaan interaksi konten di TikTok." />
          <RoadmapItem step="Phase C" title="Penjualan Shopee" text="Pengelolaan leads, konversi, dan pelacakan komisi secara end-to-end." />
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '12px 14px', backdropFilter: 'blur(4px)' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

function RoadmapItem({ step, title, text, active }) {
  return (
    <div className="card" style={{ boxShadow: 'none', background: active ? 'linear-gradient(135deg, #eff6ff, #eef2ff)' : '#fff', borderColor: active ? '#bfdbfe' : undefined }}>
      <div className="pill" style={{ marginBottom: 8, display: 'inline-flex' }}>{step}{active ? ' · Aktif' : ''}</div>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div className="muted" style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '1px solid #d9e2ee', background: '#fff', font: 'inherit', outline: 'none' };
const preStyle = { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, color: '#334155', background: '#fff', border: '1px solid #e6ebf2', borderRadius: 12, padding: 12, margin: 0, maxHeight: 240, overflow: 'auto' };
