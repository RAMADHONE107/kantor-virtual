import React, { useMemo } from 'react';
import { divisions } from '../data/team';

function KpiCard({ label, value, hint, tone = 'blue' }) {
  return (
    <div className={`card kpi kpi-${tone}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-hint">{hint}</div>
      <span className="kpi-accent" />
    </div>
  );
}

function TopProducts({ products }) {
  const top = useMemo(
    () => [...(products || [])].sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0)).slice(0, 5),
    [products],
  );
  const max = Math.max(...top.map((p) => Number(p.sold) || 0), 1);

  return (
    <section className="card dash-panel">
      <div className="card-head">
        <h2>Produk Terlaris</h2>
        <span className="pill">Tokopedia · {top.length} produk</span>
      </div>
      {top.length === 0 && <div className="muted">Data produk belum tersedia.</div>}
      <div className="rank-list">
        {top.map((p, i) => (
          <div className="rank-row" key={p.url || p.name}>
            <span className="rank-no">{String(i + 1).padStart(2, '0')}</span>
            <div className="rank-main">
              <div className="rank-top">
                <a className="rank-name" href={p.url} target="_blank" rel="noreferrer" title={p.name}>
                  {p.name}
                </a>
                <span className="rank-value">{p.soldText || (p.sold != null ? `${p.sold} terjual` : '-')}</span>
              </div>
              <div className="bar sm"><div className="bar-fill" style={{ width: `${((Number(p.sold) || 0) / max) * 100}%` }} /></div>
              <div className="rank-meta">{p.priceText || '-'} · ★ {p.rating ?? '-'} · {p.shop}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityPanel({ activities }) {
  const allPeople = divisions.flatMap((d) => d.members);
  return (
    <section className="card dash-panel">
      <div className="card-head">
        <h2>Aktivitas Sistem</h2>
        <span className="pill">{activities.length} log terbaru</span>
      </div>
      <div className="activity-list">
        {activities.length === 0 && <div className="muted">Belum ada aktivitas. Jalankan alur kerja di menu Agen & Draft.</div>}
        {activities.map((a) => (
          <div key={a.id} className="activity-item">
            <span className="dot" style={{ background: allPeople.find((m) => m.name === a.agent)?.color || '#94a3b8' }} />
            <div>
              <div className="activity-text"><strong>{a.agent}</strong> — {a.text}</div>
              <div className="activity-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkflowPanel({ tasks }) {
  return (
    <section className="card dash-panel">
      <div className="card-head">
        <h2>Progress Alur Kerja</h2>
        <span className="pill">Pipeline terbaru · {tasks.length} tahap</span>
      </div>
      <div className="stage-grid">
        {tasks.length === 0 && <div className="muted">Belum ada pipeline. Jalankan alur kerja otomatis di menu Agen & Draft.</div>}
        {tasks.map((t, i) => (
          <div className="stage-card" key={t.id}>
            <div className="stage-head">
              <span className="stage-index">{String(i + 1).padStart(2, '0')}</span>
              <span className={`stage-status ${t.progress === 100 ? 'done' : ''}`}>{t.stage}</span>
            </div>
            <div className="stage-title">{t.title.replace(/^Tahap \d+:\s*/, '')}</div>
            <div className="stage-sub">{t.owner} · {t.division}</div>
            <div className="bar sm"><div className="bar-fill" style={{ width: `${t.progress}%`, background: `linear-gradient(90deg, ${t.divisionColor}, #6366f1)` }} /></div>
            <div className="stage-pct">{t.progress}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard({ metrics, activities, tasks, market, onEnterOffice, isSnapshot, snapshotAt }) {
  const updatedAt = market?.fetchedAt ? new Date(market.fetchedAt).toLocaleString('id-ID') : '-';
  const totalDone = metrics.stagesDone || 0;

  return (
    <div className="page dash-page">
      <section className="dash-header">
        <div>
          <div className="eyebrow">Ringkasan Operasional</div>
          <h1>Dashboard Affiliate</h1>
          <p className="muted">Pantau pipeline, produk, dan sinyal pasar dari satu tempat.</p>
        </div>
        <div className="dash-actions">
          <div className="source-line">
            <span className={`source-dot ${isSnapshot ? 'snapshot' : ''}`} />
            <span>{isSnapshot ? 'Mode snapshot' : 'Data live'}</span>
            <span className="source-sep">·</span>
            <span>Diperbarui {updatedAt}</span>
          </div>
          <button className="btn primary" onClick={onEnterOffice}>Buka Kantor 3D</button>
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard label="Pipeline Aktif" value={metrics.campaigns || 0} hint="Berjalan / menunggu approval" tone="blue" />
        <KpiCard label="Tahap Selesai" value={totalDone} hint={`Dari ${metrics.pipelines || 0} pipeline tersimpan`} tone="green" />
        <KpiCard label="Produk Terscan" value={metrics.productsScanned || 0} hint="Harga & terjual dari Tokopedia" tone="cyan" />
        <KpiCard label="Tren Terdeteksi" value={metrics.trendsDetected || 0} hint="Google Trends Indonesia" tone="violet" />
      </section>

      <section className="grid two dash-panels">
        <TopProducts products={market?.products} />
        <ActivityPanel activities={activities} />
      </section>

      <WorkflowPanel tasks={tasks} />

      <footer className="data-note">
        <span className="pill">Sumber data</span>
        <span>
          Metrik & aktivitas dari backend studio. Produk dari Tokopedia publik, tren dari Google Trends RSS.
          {' '}Komisi affiliate tidak ditampilkan karena belum ada kredensial affiliate resmi — tidak ada angka yang dikarang.
          {isSnapshot && snapshotAt ? ` Menampilkan snapshot nyata terakhir (${new Date(snapshotAt).toLocaleString('id-ID')}).` : ''}
        </span>
      </footer>
    </div>
  );
}
