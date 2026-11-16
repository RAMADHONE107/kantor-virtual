import React from 'react'

const s = {
  panel: (open) => ({
    position: 'fixed', right: 24, bottom: 68, width: 320, zIndex: 25,
    background: 'rgba(7,24,44,0.92)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24,
    opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(10px)',
    transition: 'all 0.3s ease', visibility: open ? 'visible' : 'hidden',
    pointerEvents: open ? 'all' : 'none',
  }),
  label: { fontFamily: "'DM Mono', monospace", fontSize: 7, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 6 },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: 1 },
  text: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  link: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#0DEEF3', textDecoration: 'none', letterSpacing: 1, display: 'block', marginBottom: 6 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '14px 0' },
  badge: {
    display: 'inline-block', fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: 1,
    padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.35)', marginRight: 4, marginBottom: 4,
  },
}

export default function InfoPanel({ open }) {
  return (
    <div style={s.panel(open)}>
      <div style={{ marginBottom: 16 }}>
        <div style={s.label}>Studio</div>
        <div style={s.title}>AFFILIATE <span style={{ color: '#0DEEF3' }}>STUDIO 3D</span></div>
        <div style={s.text}>
          Virtual office 3D untuk konten affiliate: 1 tim berisi 4 orang, 4 meja kerja, dan 2 komputer di setiap meja (total 8 produk). Setiap monitor bisa diklik untuk menampilkan detail produk dan tombol CTA affiliate.
        </div>
      </div>

      <div style={s.divider} />

      <div style={{ marginBottom: 16 }}>
        <div style={s.label}>Tim</div>
        <div style={s.text}>
          Raka (Riset Produk), Sinta (Produksi Konten), Dimas (Desain & Visual), dan Naya (Growth & Analitik) bekerja dalam satu ruangan kantor yang realistis.
        </div>
        <div style={{ marginTop: 8 }}>
          {['4 Orang', '4 Meja', '8 Monitor', 'Hotspot Affiliate', 'React', 'Three.js'].map(b => (
            <span key={b} style={s.badge}>{b}</span>
          ))}
        </div>
      </div>

      <div style={s.divider} />

      <div>
        <div style={s.label}>Cara pakai</div>
        <div style={s.text}>
          • Drag untuk orbit, scroll untuk zoom<br/>
          • Geser waktu pada HUD untuk suasana kantor<br/>
          • Klik monitor untuk membuka panel produk & CTA<br/>
          • Ganti data/link di <span style={{ color: '#0DEEF3' }}>src/data/products.js</span>
        </div>
      </div>
    </div>
  )
}
