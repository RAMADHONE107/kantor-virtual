import React from 'react';

function StatusBadge({ status, statusKey }) {
  return <span className={`badge status-${statusKey}`}>{status}</span>;
}

export default function SalesSocialView({ market }) {
  const products = market?.products || [];
  const trends = market?.trends || [];
  const fetchedAt = market?.fetchedAt ? new Date(market.fetchedAt).toLocaleString('id-ID') : '-';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Data Pasar Nyata</div>
          <h1>Sosmed & Penjualan</h1>
          <p className="muted">
            Produk dan tren di bawah ini diambil dari sumber publik tanpa login. Diambil: {fetchedAt}.
            Komisi afiliasi tidak ditampilkan karena belum ada kredensial affiliate resmi.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Produk Kecantikan & Perawatan Kulit (Tokopedia)</h2>
          <span className="pill">{products.length} produk</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Produk</th><th>Harga</th><th>Rating</th><th>Terjual</th><th>Toko</th><th>Komisi</th></tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan="6" className="muted">Data produk belum tersedia. Cek koneksi backend lalu muat ulang.</td></tr>
              )}
              {products.map((p) => (
                <tr key={p.url || p.name}>
                  <td>
                    <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a>
                  </td>
                  <td>{p.priceText || `Rp ${Number(p.price || 0).toLocaleString('id-ID')}`}</td>
                  <td>{p.rating ?? '-'}</td>
                  <td>{p.soldText || (p.sold != null ? `${p.sold} terjual` : '-')}</td>
                  <td>{p.shop}{p.city ? ` · ${p.city}` : ''}</td>
                  <td><StatusBadge status="Belum tersedia" statusKey="queue" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="card-head"><h2>Tren Pencarian Indonesia</h2><span className="pill">{trends.length} tren</span></div>
          <div className="activity-list">
            {trends.length === 0 && <div className="muted">Tren belum tersedia.</div>}
            {trends.map((t, i) => (
              <div key={`${t.title}-${i}`} className="activity-item">
                <span className="dot" style={{ background: t.beautyRelated ? '#34d399' : '#64748b' }} />
                <div>
                  <div className="activity-text"><strong>{t.title}</strong></div>
                  <div className="activity-time">{t.traffic || 'trafik n/a'} · {t.beautyRelated ? 'terkait kecantikan' : 'tren umum'} · {t.published || '-'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h2>Integrasi Platform</h2><span className="pill">Belum terhubung</span></div>
          <div className="activity-list">
            <div className="activity-item"><span className="dot" style={{ background: '#64748b' }} /><div><div className="activity-text"><strong>Post & jadwal konten</strong> — belum ada API TikTok/Instagram yang terhubung.</div><div className="activity-time">Tidak ada data simulasi</div></div></div>
            <div className="activity-item"><span className="dot" style={{ background: '#64748b' }} /><div><div className="activity-text"><strong>Leads & DM</strong> — belum ada integrasi pesan marketplace/sosial.</div><div className="activity-time">Tidak ada data simulasi</div></div></div>
            <div className="activity-item"><span className="dot" style={{ background: '#64748b' }} /><div><div className="activity-text"><strong>Transaksi & komisi</strong> — butuh kredensial affiliate (Shopee/TikTok/network).</div><div className="activity-time">Tidak ada angka dibuat-buat</div></div></div>
          </div>
        </section>
      </div>
    </div>
  );
}
