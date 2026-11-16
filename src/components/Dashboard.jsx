import React, { useEffect, useMemo, useState } from 'react';
import { divisions } from '../data/team';

const slides = [
  {
    kicker: 'Real AI Workflow',
    title: 'Agen AI yang Beneran Bekerja',
    text: 'Bukan sekadar visual — setiap divisi menghasilkan draft riset, skrip, brief, dan rencana eksekusi nyata yang siap kamu tinjau dan setujui.',
    bg: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 45%, #0891b2 100%)',
  },
  {
    kicker: 'Operasional Terintegrasi',
    title: '4 Divisi, 16 Pekerja, Satu Alur Mulus',
    text: 'Dari riset produk, produksi konten, desain, hingga distribusi sosial media dan penjualan — semua bergerak sinkron dalam satu studio.',
    bg: 'linear-gradient(135deg, #0f766e 0%, #2563eb 50%, #7c3aed 100%)',
  },
  {
    kicker: 'Fokus Growth',
    title: 'Siap Scale di TikTok & Shopee',
    text: 'Strategi, konten, dan rencana follow-up diarahkan ke channel prioritas agar trafik, leads, dan konversi affiliate tumbuh lebih cepat.',
    bg: 'linear-gradient(135deg, #c2410c 0%, #db2777 50%, #7c3aed 100%)',
  },
  {
    kicker: 'Immersive Experience',
    title: 'Pantau Tim di Kantor 3D Interaktif',
    text: 'Lihat 16 pekerja beraktivitas di kantor virtual, sambil memantau performa campaign, draft, dan pipeline secara real-time di dashboard.',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0e7490 100%)',
  },
];

function HeroSlider() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="slider">
      <div className="slider-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div className="slide" key={i}>
            <div className="slide-bg" style={{ background: s.bg }} />
            <div className="slide-content">
              <div className="slide-kicker">{s.kicker}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="slider-dots">
        {slides.map((_, i) => (
          <button key={i} className={`slider-dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`}>
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}

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
  const recentActivities = useMemo(() => activities.slice(0, 8), [activities]);
  return (
    <div className="page">
      <section className="hero card">
        <div className="hero-copy">
          <div className="eyebrow">Affiliate Studio AI Platform</div>
          <h1>Bangun Mesin Affiliate yang Elegan, Cepat, dan Produktif</h1>
          <p>
            Kelola riset, produksi konten, desain, distribusi sosial media, hingga penanganan leads dan penjualan
            dalam satu workspace modern. Aktifkan agen AI untuk menghasilkan draft nyata, pantau progres lintas divisi,
            dan lihat tim bekerja langsung di kantor 3D.
          </p>
          <div className="hero-actions">
            <button className="btn primary" onClick={onEnterOffice}>Masuk ke Kantor 3D</button>
            <span className="pill live">Sistem aktif & sinkron</span>
          </div>
        </div>
        <div className="hero-side">
          <HeroSlider />
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-label">Divisi Aktif</div><div className="hero-stat-value">{activeDivisionCount} / {metrics.divisions}</div></div>
            <div className="hero-stat"><div className="hero-stat-label">Pekerja AI</div><div className="hero-stat-value">{metrics.workers}</div></div>
            <div className="hero-stat"><div className="hero-stat-label">Draft AI</div><div className="hero-stat-value">{metrics.drafts || 0}</div></div>
            <div className="hero-stat"><div className="hero-stat-label">Disetujui</div><div className="hero-stat-value">{metrics.approved || 0}</div></div>
          </div>
        </div>
      </section>

      <section className="grid stats">
        <Stat label="Divisi Operasional" value={metrics.divisions} hint="Struktur inti studio" />
        <Stat label="Pekerja AI" value={metrics.workers} hint="4 spesialis per divisi" />
        <Stat label="Draft Dihasilkan" value={metrics.drafts || 0} hint="Output agen nyata (Phase A)" />
        <Stat label="Draft Disetujui" value={metrics.approved || 0} hint="Siap dieksekusi" />
        <Stat label="Campaign Aktif" value={metrics.campaigns} hint="Lintas 4 divisi" />
        <Stat label="Konten & Post" value={metrics.posts} hint="Pipeline sosial media" />
        <Stat label="Leads Dikelola" value={metrics.leads} hint="DM, komentar, inquiry" />
        <Stat label="Estimasi Komisi" value={`Rp ${metrics.revenue.toLocaleString('id-ID')}`} hint={`Closing: ${metrics.sales} transaksi`} />
      </section>

      <section className="grid two">
        <div className="card">
          <div className="card-head"><h2>Aktivitas Tim Real-time</h2><span className="pill live">Live</span></div>
          <div className="activity-list">
            {recentActivities.map((a) => (
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
          <div className="card-head"><h2>Progress Campaign</h2><span className="pill">{tasks.length} aktif</span></div>
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
                <div className="bar"><div className="bar-fill" style={{ width: `${t.progress}%`, background: `linear-gradient(90deg, ${t.divisionColor}, #6366f1)` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
