import React, { useMemo, useState } from 'react';

function StatusBadge({ status }) {
  const map = {
    running: ['Sedang Dikerjakan', 'status-progress'],
    waiting_approval: ['Menunggu Keputusan Upload', 'status-queue'],
    approved_exported: ['Disetujui & Disimpan', 'status-done'],
    rejected: ['Perlu Revisi', 'status-progress'],
    error: ['Terhenti', 'status-progress'],
    done: ['Selesai', 'status-done'],
  };
  const [label, cls] = map[status] || [status, 'status-queue'];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function StageState({ status }) {
  if (status === 'done') return <span className="pill" style={{ color: '#15803d', borderColor: '#bbf7d0', background: '#ecfdf3' }}>Selesai</span>;
  if (status === 'running') return <span className="pill" style={{ color: '#1d4ed8', borderColor: '#bfdbfe', background: '#eff6ff' }}>Dikerjakan</span>;
  if (status === 'error') return <span className="pill" style={{ color: '#b91c1c', borderColor: '#fecaca', background: '#fef2f2' }}>Kendala</span>;
  return <span className="pill">Menunggu</span>;
}

export default function AgentsView({ backend, logs, pipelines = [], onRunPipeline, onApprovePipeline, onRejectPipeline, pipelineRunning }) {
  const [topic, setTopic] = useState('');
  const [product, setProduct] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const ready = backend.ok && backend.hasKey;
  const latest = pipelines[0] || null;
  const selected = pipelines.find(p => p.id === selectedId) || latest;
  const statusLabel = ready ? 'Sistem Agen Siap' : 'Sistem Agen Belum Siap';
  const statusClass = ready ? 'pill live' : 'pill';

  const stats = useMemo(() => {
    const waiting = pipelines.filter(p => p.status === 'waiting_approval').length;
    const approved = pipelines.filter(p => p.status === 'approved_exported').length;
    return { total: pipelines.length, waiting, approved };
  }, [pipelines]);

  return (
    <div className="page">
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0b1220 0%, #1e3a8a 45%, #4f46e5 75%, #0891b2 100%)', padding: '26px 24px', color: '#fff', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -30, top: -40, width: 260, height: 260, background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 760 }}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Autopilot Pipeline</div>
              <h1 style={{ color: '#fff', marginBottom: 8 }}>16 Pekerja AI Menjalankan Alur Kerja Nyata</h1>
              <p style={{ color: 'rgba(255,255,255,0.88)', maxWidth: 760 }}>
                Tim riset, konten, desain, hingga distribusi bekerja berantai secara otomatis dari awal sampai paket siap upload.
                Kamu cukup mengambil keputusan di satu titik: <strong>Layak Upload atau Tidak</strong>.
              </p>
            </div>
            <span className={statusClass} style={{ background: ready ? undefined : 'rgba(255,255,255,0.92)' }}>{statusLabel}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginTop: 18, position: 'relative', zIndex: 1 }}>
            <MiniStat label="Pekerja AI" value="16" />
            <MiniStat label="Divisi Terlibat" value="4" />
            <MiniStat label="Menunggu Keputusan" value={stats.waiting} />
            <MiniStat label="Paket Disetujui" value={stats.approved} />
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <div className="card-head" style={{ marginBottom: 10 }}><h2>Mulai Alur Kerja Otomatis</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <div className="stat-label" style={{ marginBottom: 6 }}>Topik / Ide Konten</div>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Review lampu LED konten untuk pemula" style={inputStyle} />
            </div>
            <div>
              <div className="stat-label" style={{ marginBottom: 6 }}>Fokus Produk (Opsional)</div>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Contoh: Lampu LED meja, ring light mini" style={inputStyle} />
            </div>
            <div>
              <button className="btn primary" onClick={() => onRunPipeline({ topic, product })} disabled={pipelineRunning || !ready} style={{ minWidth: 230 }}>
                {pipelineRunning ? 'Tim Sedang Bekerja...' : 'Mulai Kerja Otomatis (16 Pekerja)'}
              </button>
            </div>
          </div>
          {!ready && (
            <div className="card soft" style={{ marginTop: 12, boxShadow: 'none' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Sistem agen belum siap</div>
              <div className="muted" style={{ fontSize: 13 }}>Aktifkan layanan agen agar tim dapat menjalankan alur kerja otomatis dari riset hingga paket siap upload.</div>
            </div>
          )}
        </div>
      </section>

      {selected ? (
        <section className="card" style={{ borderColor: selected.status === 'waiting_approval' ? '#93c5fd' : undefined }}>
          <div className="card-head">
            <div>
              <h2>Paket Kerja: {selected.topic || selected.product || 'Campaign Affiliate'}</h2>
              <div className="muted" style={{ fontSize: 13 }}>ID: {selected.id} · Diperbarui: {new Date(selected.updatedAt || selected.createdAt).toLocaleString('id-ID')}</div>
            </div>
            <StatusBadge status={selected.status} />
          </div>

          <div className="grid two" style={{ marginBottom: 12 }}>
            {selected.stages.map((s) => (
              <div key={s.key} className="card soft" style={{ boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.title}</div>
                    <div className="division-meta"><span className="dot" style={{ background: s.divisionColor, marginRight: 6, verticalAlign: 'middle' }} />{s.division}</div>
                  </div>
                  <StageState status={s.status} />
                </div>
                <div className="chips" style={{ marginBottom: 8 }}>
                  {(s.members || []).map((m) => <span key={m.name} className="chip">{m.name} · {m.role}</span>)}
                </div>
                {s.output ? <pre style={preStyle}>{s.output}</pre> : <div className="muted" style={{ fontSize: 13 }}>{s.status === 'running' ? 'Tim sedang mengerjakan tahap ini...' : s.error ? `Kendala: ${s.error}` : 'Menunggu giliran.'}</div>}
              </div>
            ))}
          </div>

          {selected.status === 'waiting_approval' && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderColor: '#bfdbfe' }}>
              <div className="card-head"><h2>Keputusan Kamu: Layak Upload?</h2><span className="pill">Hanya 1 persetujuan</span></div>
              <p className="muted" style={{ marginBottom: 12 }}>
                Seluruh tim sudah menyelesaikan riset, konten, desain, dan rencana distribusi. Jika disetujui, paket siap upload akan otomatis disimpan ke folder <strong>Download</strong> di perangkatmu.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn primary" onClick={() => onApprovePipeline(selected.id)}>Layak Upload — Simpan ke Download</button>
                <button className="btn" onClick={() => onRejectPipeline(selected.id)}>Tidak Layak / Perlu Revisi</button>
              </div>
            </div>
          )}

          {selected.status === 'approved_exported' && (
            <div className="card" style={{ background: '#ecfdf3', borderColor: '#bbf7d0', boxShadow: 'none' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Paket disetujui dan otomatis disimpan</div>
              <div className="muted" style={{ fontSize: 13, wordBreak: 'break-all' }}>Lokasi file: {selected.exportPath || '-'}</div>
              {selected.exportJsonPath && <div className="muted" style={{ fontSize: 13, wordBreak: 'break-all' }}>Data: {selected.exportJsonPath}</div>}
            </div>
          )}

          {selected.status === 'rejected' && (
            <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a', boxShadow: 'none' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Paket ditandai perlu revisi</div>
              <div className="muted" style={{ fontSize: 13 }}>{selected.reviewNote || 'Silakan jalankan ulang alur kerja dengan arahan/topik yang diperbarui.'}</div>
            </div>
          )}
        </section>
      ) : (
        <section className="card soft" style={{ textAlign: 'center', padding: 28 }}>
          <h2 style={{ marginBottom: 6 }}>Belum ada alur kerja berjalan</h2>
          <p className="muted">Mulai alur kerja otomatis agar 16 pekerja AI menyiapkan paket konten sampai tahap siap upload.</p>
        </section>
      )}

      <div className="grid two">
        <section className="card">
          <div className="card-head"><h2>Riwayat Paket & Keputusan</h2><span className="pill">{pipelines.length} pipeline</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflow: 'auto' }}>
            {pipelines.length === 0 && <div className="muted">Belum ada riwayat.</div>}
            {pipelines.map((p) => (
              <button key={p.id} className="card soft" onClick={() => setSelectedId(p.id)} style={{ textAlign: 'left', cursor: 'pointer', boxShadow: 'none', borderColor: (selected && selected.id === p.id) ? '#93c5fd' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.topic || p.product || 'Campaign Affiliate'}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{new Date(p.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                {p.exportPath && <div className="muted" style={{ fontSize: 12, marginTop: 6, wordBreak: 'break-all' }}>Tersimpan: {p.exportPath}</div>}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>Aktivitas Tim</h2><span className="pill live">Real-time</span></div>
          <div className="activity-list" style={{ maxHeight: 420, overflow: 'auto' }}>
            {logs.length === 0 && <div className="muted">Belum ada aktivitas.</div>}
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

const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '1px solid #d9e2ee', background: '#fff', font: 'inherit', outline: 'none' };
const preStyle = { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, color: '#334155', background: '#fff', border: '1px solid #e6ebf2', borderRadius: 12, padding: 12, margin: 0, maxHeight: 260, overflow: 'auto' };
