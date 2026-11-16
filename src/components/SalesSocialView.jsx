import React from 'react';

function StatusBadge({ status, statusKey }) {
  return <span className={`badge status-${statusKey}`}>{status}</span>;
}

export default function SalesSocialView({ posts, leads, sales }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Operasional Harian</div>
          <h1>Sosial Media, Leads, dan Penjualan</h1>
          <p className="muted">Pemantauan konten, interaksi audiens, dan proses closing yang dikelola oleh tim lintas divisi secara terintegrasi.</p>
        </div>
      </div>

      <div className="grid two">
        <section className="card">
          <div className="card-head"><h2>Pipeline Konten & Sosial Media</h2><span className="pill">{posts.length} item</span></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Konten</th><th>Channel</th><th>PIC</th><th>Divisi</th><th>Status</th><th>Performa</th></tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.channel}</td>
                    <td>{p.owner}</td>
                    <td>{p.division}</td>
                    <td><StatusBadge status={p.status} statusKey={p.statusKey} /></td>
                    <td>{p.metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>Leads & Interaksi</h2><span className="pill">{leads.length} leads</span></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Lead</th><th>Sumber</th><th>Minat</th><th>PIC</th><th>Status</th></tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.source}</td>
                    <td>{l.interest}</td>
                    <td>{l.owner}</td>
                    <td><StatusBadge status={l.status} statusKey={l.statusKey} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-head"><h2>Penjualan & Komisi Affiliate</h2><span className="pill">{sales.length} transaksi</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Produk</th><th>Channel</th><th>PIC</th><th>Divisi</th><th>Status</th><th>Komisi</th></tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.order}</td>
                  <td>{s.product}</td>
                  <td>{s.channel}</td>
                  <td>{s.owner}</td>
                  <td>{s.division}</td>
                  <td><StatusBadge status={s.status} statusKey={s.statusKey} /></td>
                  <td>Rp {s.commission.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}