import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createOfficeScene } from './scene/OfficeScene';
import Dashboard from './components/Dashboard';
import WorkflowView from './components/WorkflowView';
import SalesSocialView from './components/SalesSocialView';
import { products } from './data/products';
import { divisions, allMembers, initialActivities } from './data/team';

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const channels = ['TikTok', 'Instagram', 'YouTube Shorts', 'WhatsApp', 'Marketplace'];

const taskSeeds = [
  'Campaign Produk Creator', 'Optimasi Funnel Affiliate', 'Review Gadget Harian', 'Promo Bundling Konten',
  'Konten Edukasi Produk', 'Launching Offer Mingguan', 'Boost Traffic Organik', 'Retargeting Leads Hangat',
];

function createInitialTasks() {
  return taskSeeds.map((title, i) => {
    const div = divisions[i % divisions.length];
    const owner = div.members[i % div.members.length];
    const step = i % div.workflow.length;
    return {
      id: `task-${i + 1}`,
      title: `${title} #${i + 1}`,
      owner: owner.name,
      division: div.name,
      divisionColor: div.color,
      stage: div.workflow[step],
      progress: 20 + ((i * 9) % 60),
      step,
      workflow: div.workflow,
    };
  });
}

const initialPosts = [
  { id: 1, title: 'Review Laptop Creator Ringan', channel: 'TikTok', owner: 'Naya', division: 'Divisi Sosmed & Penjualan', status: 'Terpublish', statusKey: 'done', metric: '12.4K views' },
  { id: 2, title: 'Hook 3 Detik untuk Produk Audio', channel: 'Reels', owner: 'Sinta', division: 'Divisi Konten & Produksi', status: 'Terjadwal', statusKey: 'progress', metric: 'Hari ini 19:00' },
  { id: 3, title: 'Carousel Perbandingan Monitor IPS', channel: 'Instagram', owner: 'Dimas', division: 'Divisi Desain & Brand', status: 'Antri Publish', statusKey: 'queue', metric: 'Siap tayang' },
  { id: 4, title: 'Demo Setup Meja Konten', channel: 'YouTube Shorts', owner: 'Maya', division: 'Divisi Konten & Produksi', status: 'Optimasi CTA', statusKey: 'progress', metric: 'CTR 3.1%' },
  { id: 5, title: 'Live Showcase Produk Pilihan', channel: 'TikTok', owner: 'Tari', division: 'Divisi Sosmed & Penjualan', status: 'Terpublish', statusKey: 'done', metric: '8.7K views' },
  { id: 6, title: 'Tips Riset Produk Komisi Tinggi', channel: 'Instagram', owner: 'Raka', division: 'Divisi Riset & Strategi', status: 'Terjadwal', statusKey: 'progress', metric: 'Besok 10:00' },
];

const initialLeads = [
  { id: 1, name: 'Andi P.', source: 'TikTok DM', interest: 'Laptop Creator', owner: 'Naya', division: 'Divisi Sosmed & Penjualan', status: 'Follow-up', statusKey: 'progress' },
  { id: 2, name: 'Bela R.', source: 'IG Comment', interest: 'Mic Podcast', owner: 'Rani', division: 'Divisi Sosmed & Penjualan', status: 'Kirim Link', statusKey: 'done' },
  { id: 3, name: 'Citra L.', source: 'WhatsApp', interest: 'Pen Tablet', owner: 'Vina', division: 'Divisi Sosmed & Penjualan', status: 'Kualifikasi', statusKey: 'queue' },
  { id: 4, name: 'Deni S.', source: 'YouTube', interest: 'Tripod Holder', owner: 'Tari', division: 'Divisi Sosmed & Penjualan', status: 'Tertarik', statusKey: 'progress' },
  { id: 5, name: 'Eka W.', source: 'Marketplace', interest: 'LED Key Light', owner: 'Rani', division: 'Divisi Sosmed & Penjualan', status: 'Follow-up', statusKey: 'progress' },
];

const initialSales = [
  { id: 1, order: '#AF-1024', product: 'USB Podcast Microphone', channel: 'TikTok', owner: 'Naya', division: 'Divisi Sosmed & Penjualan', status: 'Closing', statusKey: 'done', commission: 45000 },
  { id: 2, order: '#AF-1025', product: 'LED Key Light', channel: 'Instagram', owner: 'Vina', division: 'Divisi Sosmed & Penjualan', status: 'Checkout', statusKey: 'progress', commission: 28000 },
  { id: 3, order: '#AF-1026', product: 'Tripod & Phone Holder', channel: 'WhatsApp', owner: 'Rani', division: 'Divisi Sosmed & Penjualan', status: 'Menunggu Bayar', statusKey: 'queue', commission: 12000 },
  { id: 4, order: '#AF-1027', product: 'Monitor IPS 27 inci', channel: 'Marketplace', owner: 'Tari', division: 'Divisi Sosmed & Penjualan', status: 'Closing', statusKey: 'done', commission: 76000 },
];

function buildActivityTemplates() {
  const actions = {
    'Divisi Riset & Strategi': ['memvalidasi tren produk baru', 'menganalisis kompetitor dan harga', 'menyusun brief campaign affiliate', 'memilih offer dengan komisi terbaik'],
    'Divisi Konten & Produksi': ['menulis skrip dan hook konten', 'memproduksi video pendek produk', 'menyelesaikan editing konten', 'menyiapkan materi live demo'],
    'Divisi Desain & Brand': ['membuat thumbnail konversi tinggi', 'mengoptimasi banner CTA', 'menyesuaikan visual untuk channel', 'merapikan aset brand campaign'],
    'Divisi Sosmed & Penjualan': ['menjadwalkan posting konten', 'membalas komentar dan DM', 'melakukan follow-up lead', 'memproses closing penjualan affiliate'],
  };
  return allMembers.map((m) => ({ agent: m.name, division: m.division, text: rand(actions[m.division] || ['mengerjakan tugas campaign']), color: m.color }));
}

const activityTemplates = buildActivityTemplates();

export default function App() {
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState(createInitialTasks);
  const [activities, setActivities] = useState(initialActivities);
  const [posts, setPosts] = useState(initialPosts);
  const [leads, setLeads] = useState(initialLeads);
  const [sales, setSales] = useState(initialSales);
  const officeRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => prev.map((task) => {
        let progress = task.progress + (5 + Math.floor(Math.random() * 14));
        let step = task.step;
        let owner = task.owner;
        let division = task.division;
        let divisionColor = task.divisionColor;
        let workflow = task.workflow;
        if (progress >= 100) {
          progress = 12 + Math.floor(Math.random() * 25);
          const div = rand(divisions);
          const member = rand(div.members);
          step = Math.floor(Math.random() * div.workflow.length);
          owner = member.name;
          division = div.name;
          divisionColor = div.color;
          workflow = div.workflow;
        }
        return { ...task, progress, step, owner, division, divisionColor, workflow, stage: workflow[step] };
      }));

      setPosts((prev) => {
        let next = prev.map((p) => {
          if (Math.random() < 0.22) {
            const keys = ['queue', 'progress', 'done'];
            const labels = { queue: 'Antri Publish', progress: 'Terjadwal/Optimasi', done: 'Terpublish' };
            const k = keys[(keys.indexOf(p.statusKey) + 1) % keys.length];
            const metric = k === 'done' ? `${(7 + Math.random() * 14).toFixed(1)}K views` : k === 'progress' ? 'Optimasi berjalan' : 'Siap tayang';
            return { ...p, statusKey: k, status: labels[k], metric };
          }
          return p;
        });
        if (Math.random() < 0.35) {
          const prod = rand(products);
          const div = rand(divisions);
          const owner = rand(div.members).name;
          const id = Date.now();
          next = [{ id, title: `Konten ${prod.name}`, channel: rand(channels), owner, division: div.name, status: 'Antri Publish', statusKey: 'queue', metric: 'Draf siap' }, ...next].slice(0, 8);
        }
        return next;
      });

      setLeads((prev) => {
        let next = prev.map((l) => {
          if (Math.random() < 0.2) {
            const order = ['queue', 'progress', 'done'];
            const labels = { queue: 'Kualifikasi', progress: 'Follow-up', done: 'Siap Closing' };
            const k = order[(order.indexOf(l.statusKey) + 1) % order.length];
            const owner = rand(divisions[3].members).name;
            return { ...l, statusKey: k, status: labels[k], owner, division: divisions[3].name };
          }
          return l;
        });
        if (Math.random() < 0.3) {
          const prod = rand(products);
          const owner = rand(divisions[3].members).name;
          const id = Date.now();
          next = [{ id, name: rand(['Adit', 'Bunga', 'Chandra', 'Dewi', 'Eko', 'Fina', 'Gilang', 'Hana']), source: rand(['TikTok DM', 'IG Comment', 'WhatsApp', 'YouTube', 'Marketplace']), interest: prod.name, owner, division: divisions[3].name, status: 'Kualifikasi', statusKey: 'queue' }, ...next].slice(0, 8);
        }
        return next;
      });

      setSales((prev) => {
        let next = prev.map((s) => {
          if (s.statusKey !== 'done' && Math.random() < 0.18) {
            const order = ['queue', 'progress', 'done'];
            const labels = { queue: 'Menunggu Bayar', progress: 'Checkout', done: 'Closing' };
            const k = order[(order.indexOf(s.statusKey) + 1) % order.length];
            return { ...s, statusKey: k, status: labels[k] };
          }
          return s;
        });
        if (Math.random() < 0.28) {
          const prod = rand(products);
          const owner = rand(divisions[3].members).name;
          const id = Date.now();
          next = [{ id, order: `#AF-${2000 + (id % 8000)}`, product: prod.name, channel: rand(channels), owner, division: divisions[3].name, status: 'Checkout', statusKey: 'progress', commission: 12000 + (id % 65000) }, ...next].slice(0, 8);
        }
        return next;
      });

      setActivities((prev) => {
        const tpl = rand(activityTemplates);
        const item = { id: Date.now() + Math.random(), agent: tpl.agent, text: tpl.text, time: 'Baru saja' };
        return [item, ...prev].slice(0, 10);
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (view !== 'office') {
      if (sceneRef.current) { sceneRef.current.destroy(); sceneRef.current = null; }
      return;
    }
    if (officeRef.current && !sceneRef.current) {
      sceneRef.current = createOfficeScene(officeRef.current);
    }
    return () => {
      if (view !== 'office' && sceneRef.current) { sceneRef.current.destroy(); sceneRef.current = null; }
    };
  }, [view]);

  const metrics = useMemo(() => {
    const salesDone = sales.filter((s) => s.statusKey === 'done');
    const revenue = salesDone.reduce((sum, s) => sum + s.commission, 0);
    return {
      divisions: divisions.length,
      workers: allMembers.length,
      campaigns: tasks.length,
      posts: posts.length,
      leads: leads.length,
      sales: salesDone.length,
      revenue,
    };
  }, [tasks, posts, leads, sales]);

  const activeDivisionCount = useMemo(() => new Set(tasks.map((t) => t.division)).size, [tasks]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">AS</div>
          <div>
            <div className="brand-title">Affiliate Studio AI</div>
            <div className="brand-sub">4 divisi · 16 pekerja · operasional end-to-end</div>
          </div>
        </div>
        <nav className="nav">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={view === 'workflow' ? 'active' : ''} onClick={() => setView('workflow')}>Divisi & Alur Kerja</button>
          <button className={view === 'sales' ? 'active' : ''} onClick={() => setView('sales')}>Sosmed & Penjualan</button>
          <button className={view === 'office' ? 'active' : ''} onClick={() => setView('office')}>Kantor 3D</button>
        </nav>
      </header>

      <main className="main">
        {view === 'dashboard' && (
          <Dashboard metrics={metrics} activeDivisionCount={activeDivisionCount} activities={activities} tasks={tasks} onEnterOffice={() => setView('office')} />
        )}
        {view === 'workflow' && <WorkflowView tasks={tasks} />}
        {view === 'sales' && <SalesSocialView posts={posts} leads={leads} sales={sales} />}
        {view === 'office' && (
          <div className="office-view">
            <div ref={officeRef} className="office-canvas" />
            <div className="office-overlay">
              <button className="btn" onClick={() => setView('dashboard')}>← Kembali ke Dashboard</button>
              <div className="office-note">Kantor virtual 4 divisi (16 pekerja) — drag untuk orbit, scroll untuk zoom</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}