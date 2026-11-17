import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createOfficeScene } from './scene/OfficeScene';
import Dashboard from './components/Dashboard';
import WorkflowView from './components/WorkflowView';
import SalesSocialView from './components/SalesSocialView';
import AgentsView from './components/AgentsView';
import { divisions } from './data/team';
import liveSnapshot from './data/liveSnapshot.json';
import { api } from './api';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [usingSnapshot, setUsingSnapshot] = useState(false);
  const [market, setMarket] = useState(null);
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
    } catch {
      setBackend((b) => ({ ...b, ok: false }));
    }
    const applyDashboard = (dash) => {
      setDashboard(dash);
      setTasks(dash.tasks || []);
      setActivities(dash.activities || []);
      setMarket(dash.market || null);
    };
    try {
      const [d, l, p, dash] = await Promise.all([
        api.drafts(), api.logs(), api.pipelines(), api.dashboard(),
      ]);
      setDrafts(d.drafts || []);
      setLogs(l.logs || []);
      setPipelines(p.pipelines || []);
      applyDashboard(dash);
      setUsingSnapshot(false);
    } catch {
      // Backend tidak tersedia (mis. GitHub Pages statis): pakai snapshot data nyata,
      // bukan data dummy. Snapshot diberi timestamp agar transparan.
      setDrafts(liveSnapshot.drafts || []);
      setLogs(liveSnapshot.logs || []);
      setPipelines(liveSnapshot.pipelines || []);
      applyDashboard({ ...liveSnapshot.dashboard, isSnapshot: true });
      setUsingSnapshot(true);
    }
  };

  useEffect(() => {
    loadBackend();
    const t = setInterval(loadBackend, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (view !== 'office') {
      if (sceneRef.current) { sceneRef.current.destroy(); sceneRef.current = null; }
      return;
    }
    if (officeRef.current && !sceneRef.current) {
      // Gerakan di kantor 3D hanya visualisasi, bukan sumber data dashboard.
      // Monitor memakai produk nyata dari data pasar, bukan katalog dummy.
      sceneRef.current = createOfficeScene(officeRef.current, { products: market?.products || [] });
    }
    return () => {
      if (view !== 'office' && sceneRef.current) { sceneRef.current.destroy(); sceneRef.current = null; }
    };
  }, [view]);

  const metrics = useMemo(() => dashboard?.metrics || {
    divisions: divisions.length,
    workers: 16,
    campaigns: 0,
    pipelines: 0,
    stagesDone: 0,
    productsScanned: 0,
    trendsDetected: 0,
    drafts: drafts.length,
    approved: drafts.filter((d) => d.status === 'approved').length,
    commissionAvailable: false,
    salesTransactions: 0,
  }, [dashboard, drafts]);

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
          <Dashboard metrics={metrics} activeDivisionCount={activeDivisionCount} activities={activities} tasks={tasks} market={market} isSnapshot={usingSnapshot} snapshotAt={liveSnapshot.generatedAt} onEnterOffice={() => setView('office')} />
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
        {view === 'sales' && <SalesSocialView market={market} />}
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
