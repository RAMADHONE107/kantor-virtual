import React from 'react'

const messages = [
  { text: 'RAKA riset niche & bandingkan produk', color: '#0DEEF3' },
  { text: 'SINTA produksi konten review & demo', color: '#E040FB' },
  { text: 'DIMAS desain thumbnail & aset promo', color: '#00E676' },
  { text: 'NAYA optimasi distribusi & klik affiliate', color: '#F5A623' },
  { text: '4 meja aktif · 8 monitor siap dipromosikan', color: '#448AFF' },
  { text: 'Klik monitor untuk lihat detail & CTA produk', color: '#7C4DFF' },
]

const doubled = [...messages, ...messages]

export default function Ticker() {
  return (
    <div style={{
      position: 'fixed', top: 55, left: 0, right: 0, zIndex: 20, pointerEvents: 'none',
      overflow: 'hidden', height: 20,
      opacity: 0, animation: 'fadeUpR 1.2s ease 2s forwards',
    }}>
      <div style={{
        display: 'flex', gap: 40, whiteSpace: 'nowrap', width: 'max-content',
        animation: 'tickerScroll 28s linear infinite',
      }}>
        {doubled.map((m, i) => (
          <span key={i} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: 2,
            textTransform: 'uppercase', color: m.color, marginRight: 40,
          }}>
            ▸ {m.text}
          </span>
        ))}
      </div>
      <style>{`@keyframes tickerScroll { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
    </div>
  )
}
