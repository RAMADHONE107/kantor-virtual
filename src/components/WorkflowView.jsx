import React from 'react';
import { divisions } from '../data/team';

export default function WorkflowView({ tasks }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Struktur Organisasi</div>
          <h1>4 Divisi, 16 Pekerja, 1 Alur Kerja Terpadu</h1>
          <p className="muted">Setiap divisi memiliki 4 pekerja dengan tanggung jawab jelas dari strategi, produksi, distribusi sosmed, hingga penjualan.</p>
        </div>
      </div>

      <div className="grid two">
        {divisions.map((division) => {
          const divisionTasks = tasks.filter((t) => t.division === division.name).slice(0, 4);
          return (
            <section key={division.id} className="card division-card">
              <div className="division-head">
                <span className="dot lg" style={{ background: division.color }} />
                <div style={{ flex: 1 }}>
                  <div className="division-title-row">
                    <h2>{division.name}</h2>
                    <span className="pill">{division.members.length} pekerja</span>
                  </div>
                  <div className="division-meta">{division.mission}</div>
                </div>
              </div>

              <div className="chips">
                {division.channels.map((c) => <span key={c} className="chip">{c}</span>)}
              </div>

              <h3>Anggota Divisi</h3>
              <div className="members-grid">
                {division.members.map((m) => (
                  <div key={m.name} className="member">
                    <span className="dot" style={{ background: m.color, marginTop: 6 }} />
                    <div>
                      <div className="member-name">{m.name}</div>
                      <div className="member-role">{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h3>Alur Kerja</h3>
              <ol className="steps">
                {division.workflow.map((step, i) => (
                  <li key={i}>
                    <span className="step-num" style={{ borderColor: division.color, color: division.color }}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <h3>Aktivitas Berjalan</h3>
              <div className="mini-tasks">
                {divisionTasks.length ? divisionTasks.map((t) => (
                  <div key={t.id} className="mini-task">
                    <div className="mini-task-title">{t.title}</div>
                    <div className="mini-task-meta">{t.owner} · {t.stage} · {t.progress}%</div>
                    <div className="bar sm"><div className="bar-fill" style={{ width: `${t.progress}%`, background: division.color }} /></div>
                  </div>
                )) : <div className="muted">Belum ada aktivitas pada saat ini.</div>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}