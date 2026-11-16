import React from 'react'

const team = [
  { name: 'RAKA · Riset Produk', color: '#0DEEF3' },
  { name: 'SINTA · Konten', color: '#E040FB' },
  { name: 'DIMAS · Visual', color: '#00E676' },
  { name: 'NAYA · Growth', color: '#F5A623' },
]

export default function Legend() {
  return (
    <div style={{
      position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14,
      zIndex: 20, pointerEvents: 'none',
      opacity: 0, animation: 'fadeUp 1.2s ease 1.2s forwards',
    }}>
      {team.map(a => (
        <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: a.color, boxShadow: `0 0 4px ${a.color}` }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            {a.name}
          </span>
        </div>
      ))}
    </div>
  )
}
