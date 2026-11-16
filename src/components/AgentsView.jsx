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
            <div style={{ maxWidth: 780 }}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Autopilot Operasional</div>
              <h1 style={{ color: '#fff', marginBottom: 8 }}>16 Pekerja AI Mengelola Alur Kerja End-to-End</h1>
              <p style={{ color: 'rgba(255,255,255,0.88)', maxWidth: 760 }}>
                Tim bekerja otomatis lintas divisi pada niche <strong>Kecantikan & Perawatan Kulit</strong>: mencari produk/topik viral dengan potensi komisi dan penjualan tinggi, lalu menyusun paket siap upload.
                Setiap divisi dipimpin <strong>manager</strong> yang mengambil keputusan. Kamu cukup menentukan: <strong>Layak Upload atau Tidak</strong>.
              </p>
            </div>
            <span className={statusClass} style={{ background: ready ? undefined : 'rgba(255,255,255,0.92)' }}>{statusLabel}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginTop: 18, position: 'relative', zIndex: 1 }}>
            <MiniStat label="Niche Fokus" value="Beauty" sub="Kecantikan & Skincare" />
            <MiniStat label="Pekerja / Divisi" value="16 / 4" sub="Manager di tiap divisi" />
            <MiniStat label="Menunggu Keputusan" value={stats.waiting} sub="Paket siap upload" />
            <MiniStat label="Paket Disetujui" value={stats.approved} sub="Tersimpan otomatis" />
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <div className="card-head" style={{ marginBottom: 8 }}><h2>Mulai Kerja Otomatis Tim</h2></div>
          <div className="card soft" style={{ boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Mode Otomatis Aktif</div>
              <div className="muted" style={{ fontSize: 13, maxWidth: 720 }}>
                Tim akan otomatis meneliti tren, memilih produk kecantikan & perawatan kulit dengan potensi komisi/penjualan tinggi, lalu menjalankan alur kerja berantai dari Riset → Konten → Desain → Distribusi. Keputusan operasional diambil oleh manager tiap divisi.
              </div>
            </div>
            <button className="btn primary" onClick={() => onRunPipeline({})} disabled={pipelineRunning || !ready} style={{ minWidth: 260 }}>
              {pipelineRunning ? 'Tim Sedang Bekerja...' : 'Mulai Alur Kerja Otomatis'}
            </button>
          </div>
          {!ready && (
            <div className="card soft" style={{ marginTop: 12, boxShadow: 'none' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Sistem agen belum siap</div>
              <div className="muted" style={{ fontSize: 13 }}>Aktifkan layanan agen agar tim dapat mulai bekerja secara otomatis.</div>
            </div>
          )}
        </div>
      </section>

      {selected ? (
        <section className="card" style={{ borderColor: selected.status === 'waiting_approval' ? '#93c5fd' : undefined }}>
          <div className="card-head">
            <div>
              <h2>{selected.topic || 'Campaign Otomatis Kecantikan & Perawatan Kulit'}</h2>
              <div className="muted" style={{ fontSize: 13 }}>Domain: {selected.domain || 'Kecantikan dan Perawatan Kulit'} · Fokus: {selected.product || '-'} · Diperbarui: {new Date(selected.updatedAt || selected.createdAt).toLocaleString('id-ID')}</div>
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
                <div style={{ marginBottom: 8 }}>
                  <span className="pill" style={{ marginBottom: 6, display: 'inline-flex' }}>Manager: {s.manager?.name || (s.members?.[0]?.name)} · {s.manager?.role || (s.members?.[0]?.role)}</span>
                </div>
                <div className="chips" style={{ marginBottom: 8 }}>
                  {(s.members || []).map((m) => <span key={m.name} className="chip">{m.name} · {m.role}</span>)}
                </div>
                {s.managerDecision && (
                  <div className="card" style={{ boxShadow: 'none', background: '#eff6ff', borderColor: '#bfdbfe', padding: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>Keputusan Manager</div>
                    <div style={{ fontSize: 13, color: '#334155', whiteSpace: 'pre-wrap' }}>{s.managerDecision}</div>
                  </div>
                )}
                {s.output ? <pre style={preStyle}>{s.output}</pre> : <div className="muted" style={{ fontSize: 13 }}>{s.status === 'running' ? 'Tim sedang mengerjakan tahap ini...' : s.error ? `Kendala: ${s.error}` : 'Menunggu giliran.'}</div>}
              </div>
            ))}
          </div>

          {selected.status === 'waiting_approval' && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderColor: '#bfdbfe' }}>
              <div className="card-head"><h2>Keputusan Kamu: Layak Upload?</h2><span className="pill">Hanya persetujuan upload</span></div>
              <p className="muted" style={{ marginBottom: 12 }}>
                Seluruh divisi telah menyelesaikan pekerjaan dan setiap manager telah mengambil keputusan. Jika disetujui, paket siap upload akan otomatis disimpan ke folder <strong>Download</strong> di perangkatmu.
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
              <div className="muted" style={{ fontSize: 13 }}>{selected.reviewNote || 'Jalankan ulang alur kerja otomatis untuk menghasilkan paket baru.'}</div>
            </div>
          )}
        </section>
      ) : (
        <section className="card soft" style={{ textAlign: 'center', padding: 28 }}>
          <h2 style={{ marginBottom: 6 }}>Belum ada alur kerja berjalan</h2>
          <p className="muted">Mulai alur kerja otomatis agar tim AI memilih produk kecantikan & perawatan kulit terbaik dan menyiapkan paket sampai siap upload.</p>
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
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.topic || p.product || 'Campaign Kecantikan'}</div>
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

function MiniStat({ label, value, sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '12px 14px', backdropFilter: 'blur(4px)' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: 12, border: '1px solid #d9e2ee', background: '#fff', font: 'inherit', outline: 'none' };
const preStyle = { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, color: '#334155', background: '#fff', border: '1px solid #e6ebf2', borderRadius: 12, padding: 12, margin: 0, maxHeight: 220, overflow: 'auto' };
