import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createOfficeScene } from './scene/OfficeScene';
import Dashboard from './components/Dashboard';
import WorkflowView from './components/WorkflowView';
import SalesSocialView from './components/SalesSocialView';
import AgentsView from './components/AgentsView';
import { products } from './data/products';
import { divisions, allMembers, initialActivities } from './data/team';
import { api } from './api';

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
];

const initialLeads = [
  { id: 1, name: 'Andi P.', source: 'TikTok DM', interest: 'Laptop Creator', owner: 'Naya', division: 'Divisi Sosmed & Penjualan', status: 'Follow-up', statusKey: 'progress' },
  { id: 2, name: 'Bela R.', source: 'IG Comment', interest: 'Mic Podcast', owner: 'Rani', division: 'Divisi Sosmed & Penjualan', status: 'Kirim Link', statusKey: 'done' },
  { id: 3, name: 'Citra L.', source: 'WhatsApp', interest: 'Pen Tablet', owner: 'Vina', division: 'Divisi Sosmed & Penjualan', status: 'Kualifikasi', statusKey: 'queue' },
];

const initialSales = [
  { id: 1, order: '#AF-1024', product: 'USB Podcast Microphone', channel: 'TikTok', owner: 'Naya', division: 'Divisi Sosmed & Penjualan', status: 'Closing', statusKey: 'done', commission: 45000 },
  { id: 2, order: '#AF-1025', product: 'LED Key Light', channel: 'Instagram', owner: 'Vina', division: 'Divisi Sosmed & Penjualan', status: 'Checkout', statusKey: 'progress', commission: 28000 },
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
  const [backend, setBackend] = useState({ ok: false, hasKey: false, llmProvider: 'groq' });
  const [drafts, setDrafts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [running, setRunning] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const officeRef = useRef(null);
  const sceneRef = useRef(null);

  const loadBackend = async () => {
    try {
      const h = await api.health();
      setBackend({ ok: true, hasKey: !!h.hasKey, llmProvider: h.llmProvider || 'groq' });
      const d = await api.drafts();
      setDrafts(d.drafts || []);
      const l = await api.logs();
      setLogs(l.logs || []);
      const p = await api.pipelines();
      setPipelines(p.pipelines || []);
    } catch {
      setBackend((b) => ({ ...b, ok: false }));
    }
  };

  useEffect(() => {
    loadBackend();
    const t = setInterval(loadBackend, 15000);
    return () => clearInterval(t);
  }, []);

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

      setActivities((prev) => {
        const tpl = rand(activityTemplates);
        const item = { id: Date.now() + Math.random(), agent: tpl.agent, text: tpl.text, time: 'Baru saja' };
        return [item, ...prev].slice(0, 10);
      });
    }, 5000);
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
    const approved = drafts.filter((d) => d.status === 'approved').length;
    return {
      divisions: divisions.length,
      workers: allMembers.length,
      campaigns: tasks.length,
      posts: posts.length,
      leads: leads.length,
      sales: salesDone.length,
      revenue,
      drafts: drafts.length,
      approved,
    };
  }, [tasks, posts, leads, sales, drafts]);

  const activeDivisionCount = useMemo(() => new Set(tasks.map((t) => t.division)).size, [tasks]);

  const runAgents = async (payload) => {
    setRunning(true);
    try {
      const res = await api.runAgents({ ...payload, divisions });
      setDrafts(res.drafts || []);
      const l = await api.logs();
      setLogs(l.logs || []);
      if (res.errors && res.errors.length) {
        alert(`Sebagian agen gagal: ${res.errors.map(e => e.division + ': ' + e.error).join('\n')}`);
      }
    } catch (e) {
      alert(`Gagal menjalankan agen: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const approveDraft = async (id) => {
    try { const res = await api.approveDraft(id); setDrafts(res.drafts || drafts.map(d => d.id === id ? { ...d, status: 'approved' } : d)); loadBackend(); } catch (e) { alert(e.message); }
  };
  const rejectDraft = async (id) => {
    try { const res = await api.rejectDraft(id); setDrafts(res.drafts || drafts.map(d => d.id === id ? { ...d, status: 'rejected' } : d)); loadBackend(); } catch (e) { alert(e.message); }
  };

  const runPipeline = async (payload) => {
    setPipelineRunning(true);
    try {
      const res = await api.runPipeline({ ...payload, divisions });
      setPipelines(res.pipelines || (res.pipeline ? [res.pipeline, ...pipelines] : pipelines));
      const l = await api.logs();
      setLogs(l.logs || []);
    } catch (e) {
      alert(`Gagal menjalankan alur kerja: ${e.message}`);
    } finally {
      setPipelineRunning(false);
      loadBackend();
    }
  };

  const approvePipeline = async (id) => {
    try {
      const res = await api.approvePipeline(id, 'Layak upload - disetujui');
      setPipelines(res.pipelines || pipelines.map(p => p.id === id ? res.pipeline : p));
      if (res.pipeline?.exportPath) alert(`Paket disetujui dan disimpan ke:\n${res.pipeline.exportPath}`);
      loadBackend();
    } catch (e) { alert(e.message); }
  };

  const rejectPipeline = async (id) => {
    try {
      const res = await api.rejectPipeline(id, 'Perlu revisi / tidak layak upload');
      setPipelines(res.pipelines || pipelines.map(p => p.id === id ? res.pipeline : p));
      loadBackend();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">AS</div>
          <div>
            <div className="brand-title">Affiliate Studio AI</div>
            <div className="brand-sub">4 Divisi · 16 Pekerja AI · Operasional Cerdas</div>
          </div>
        </div>
        <nav className="nav">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={view === 'agents' ? 'active' : ''} onClick={() => setView('agents')}>Agen & Draft</button>
          <button className={view === 'workflow' ? 'active' : ''} onClick={() => setView('workflow')}>Divisi & Alur Kerja</button>
          <button className={view === 'sales' ? 'active' : ''} onClick={() => setView('sales')}>Sosmed & Penjualan</button>
          <button className={view === 'office' ? 'active' : ''} onClick={() => setView('office')}>Kantor 3D</button>
        </nav>
      </header>

      <main className="main">
        {view === 'dashboard' && (
          <Dashboard metrics={metrics} activeDivisionCount={activeDivisionCount} activities={activities} tasks={tasks} onEnterOffice={() => setView('office')} />
        )}
        {view === 'agents' && (
          <AgentsView
            backend={backend}
            drafts={drafts}
            logs={logs}
            pipelines={pipelines}
            onRun={runAgents}
            onRunPipeline={runPipeline}
            onApprove={approveDraft}
            onReject={rejectDraft}
            onApprovePipeline={approvePipeline}
            onRejectPipeline={rejectPipeline}
            running={running}
            pipelineRunning={pipelineRunning}
          />
        )}
        {view === 'workflow' && <WorkflowView tasks={tasks} />}
        {view === 'sales' && <SalesSocialView posts={posts} leads={leads} sales={sales} />}
        {view === 'office' && (
          <div className="office-view">
            <div ref={officeRef} className="office-canvas" />
            <div className="office-overlay">
              <button className="btn" onClick={() => setView('dashboard')}>← Kembali ke Dashboard</button>
              <div className="office-note">Kantor Virtual Interaktif · 4 Divisi, 16 Pekerja — drag untuk orbit, scroll untuk zoom</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
