import React from 'react';
import { divisions } from '../data/team';

function Stat({ label, value, hint }) {
  return (
    <div className="card stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export default function Dashboard({ metrics, activeDivisionCount, activities, tasks, onEnterOffice }) {
  return (
    <div className="page">
      <section className="hero card">
        <div>
          <div className="eyebrow">AI Affiliate Operations</div>
          <h1>Studio affiliate profesional dengan 4 divisi dan 16 pekerja AI</h1>
          <p>
            Kelola riset, produksi konten, desain, distribusi sosial media, hingga penanganan leads dan penjualan
            dalam satu workspace yang rapi. Pantau performa secara real-time, atau masuk ke kantor 3D untuk melihat tim bekerja.
          </p>
          <div className="hero-actions">
            <button className="btn primary" onClick={onEnterOffice}>Masuk ke Kantor 3D</button>
            <span className="pill live">Sistem aktif & berjalan</span>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-label">Divisi Aktif</div><div className="hero-stat-value">{activeDivisionCount} / {metrics.divisions}</div></div>
          <div className="hero-stat"><div className="hero-stat-label">Total Pekerja</div><div className="hero-stat-value">{metrics.workers}</div></div>
          <div className="hero-stat"><div className="hero-stat-label">Campaign Berjalan</div><div className="hero-stat-value">{metrics.campaigns}</div></div>
          <div className="hero-stat"><div className="hero-stat-label">Estimasi Komisi</div><div className="hero-stat-value">Rp {metrics.revenue.toLocaleString('id-ID')}</div></div>
        </div>
      </section>

      <section className="grid stats">
        <Stat label="Divisi" value={metrics.divisions} hint="Struktur operasional utama" />
        <Stat label="Pekerja AI" value={metrics.workers} hint="4 orang per divisi" />
        <Stat label="Konten & Post" value={metrics.posts} hint="Pipeline sosial media" />
        <Stat label="Leads Dikelola" value={metrics.leads} hint="DM, komentar, inquiry" />
        <Stat label="Penjualan Closing" value={metrics.sales} hint="Transaksi selesai" />
        <Stat label="Campaign Aktif" value={metrics.campaigns} hint="Lintas divisi" />
        <Stat label="Produk" value={8} hint="Fokus affiliate saat ini" />
        <Stat label="Revenue" value={`Rp ${metrics.revenue.toLocaleString('id-ID')}`} hint="Akumulasi komisi" />
      </section>

      <section className="grid two">
        <div className="card">
          <div className="card-head"><h2>Aktivitas Tim Real-time</h2><span className="pill live">Live</span></div>
          <div className="activity-list">
            {activities.map((a) => (
              <div key={a.id} className="activity-item">
                <span className="dot" style={{ background: divisions.flatMap(d => d.members).find(m => m.name === a.agent)?.color || '#94a3b8' }} />
                <div>
                  <div className="activity-text"><strong>{a.agent}</strong> — {a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Progress Campaign</h2></div>
          <div className="task-list">
            {tasks.map((t) => (
              <div key={t.id} className="task-row">
                <div className="task-top">
                  <div>
                    <div className="task-title">{t.title}</div>
                    <div className="task-sub">{t.owner} · {t.division} · {t.stage}</div>
                  </div>
                  <div className="task-pct">{t.progress}%</div>
                </div>
                <div className="bar"><div className="bar-fill" style={{ width: `${t.progress}%`, background: t.divisionColor }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}