export const divisions = [
  {
    id: 'alpha',
    name: 'Divisi Riset & Strategi',
    mission: 'Riset pasar, validasi produk, strategi offer, dan perencanaan campaign affiliate.',
    color: '#38bdf8',
    channels: ['TikTok', 'Instagram', 'YouTube', 'Marketplace'],
    workflow: ['Riset tren & audiens', 'Analisis kompetitor & harga', 'Pilih produk & komisi', 'Susun strategi & brief', 'Serah terima ke konten'],
    members: [
      { name: 'Raka', role: 'Lead Riset Produk', color: '#0DEEF3' },
      { name: 'Bima', role: 'Analis Pasar', color: '#448AFF' },
      { name: 'Andi', role: 'Riset Kompetitor', color: '#26C6DA' },
      { name: 'Faris', role: 'Strategi Funnel', color: '#29B6F6' },
    ],
  },
  {
    id: 'beta',
    name: 'Divisi Konten & Produksi',
    mission: 'Mengubah strategi menjadi konten yang menarik: skrip, video, live, dan edukasi produk.',
    color: '#e879f9',
    channels: ['TikTok', 'Reels', 'YouTube Shorts', 'Live'],
    workflow: ['Terima brief & angle', 'Tulis skrip & hook', 'Produksi video/foto/live', 'Editing & caption', 'Kirim aset siap publish'],
    members: [
      { name: 'Sinta', role: 'Lead Produksi Konten', color: '#E040FB' },
      { name: 'Lina', role: 'Copywriter & Script', color: '#FF6EC7' },
      { name: 'Maya', role: 'Video & Live Host', color: '#BA68C8' },
      { name: 'Kei', role: 'Konten Edukasi', color: '#F06292' },
    ],
  },
  {
    id: 'gamma',
    name: 'Divisi Desain & Brand',
    mission: 'Menjaga visual yang profesional dan konsisten untuk menaikkan kepercayaan serta CTR.',
    color: '#34d399',
    channels: ['Instagram', 'TikTok', 'Landing Page', 'Marketplace'],
    workflow: ['Terima materi konten', 'Desain thumbnail & cover', 'Buat banner & CTA', 'Optimasi aset per channel', 'Uji & refine visual'],
    members: [
      { name: 'Dimas', role: 'Lead Desain Visual', color: '#00E676' },
      { name: 'Reza', role: 'Desainer Konten', color: '#7CFFB2' },
      { name: 'Galih', role: 'Brand Visual', color: '#66BB6A' },
      { name: 'Yoga', role: 'Motion & Asset', color: '#9CCC65' },
    ],
  },
  {
    id: 'delta',
    name: 'Divisi Sosmed & Penjualan',
    mission: 'Distribusi konten, pengelolaan komunitas, leads, hingga closing dan rekap penjualan.',
    color: '#fbbf24',
    channels: ['TikTok', 'Instagram', 'WhatsApp', 'Shopee/Tokopedia'],
    workflow: ['Jadwal & publish konten', 'Kelola komentar & DM', 'Kualifikasi & follow-up leads', 'Kirim link & bantu closing', 'Rekap penjualan & komisi'],
    members: [
      { name: 'Naya', role: 'Lead Growth & Sosmed', color: '#F5A623' },
      { name: 'Tari', role: 'Ads & Social Media', color: '#FFB74D' },
      { name: 'Rani', role: 'Komunitas & CRM', color: '#FF8A65' },
      { name: 'Vina', role: 'Sales & Closing', color: '#FFCA28' },
    ],
  },
];

export const allMembers = divisions.flatMap((d) => d.members.map((m) => ({ ...m, divisionId: d.id, division: d.name, divisionColor: d.color })));
export const memberByName = Object.fromEntries(allMembers.map((m) => [m.name, m]));

export const initialActivities = [
  { id: 1, agent: 'Raka', text: 'memetakan tren produk dan peluang komisi minggu ini', time: 'Baru saja' },
  { id: 2, agent: 'Sinta', text: 'menyelesaikan skrip video review untuk campaign utama', time: '1 mnt lalu' },
  { id: 3, agent: 'Dimas', text: 'menyiapkan set thumbnail dan banner CTA baru', time: '3 mnt lalu' },
  { id: 4, agent: 'Naya', text: 'memproses DM masuk dan mengirim tautan affiliate', time: '4 mnt lalu' },
  { id: 5, agent: 'Bima', text: 'menganalisis harga kompetitor untuk optimasi offer', time: '6 mnt lalu' },
  { id: 6, agent: 'Maya', text: 'menyiapkan sesi live demo produk', time: '8 mnt lalu' },
];