import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AGENTS, CIRCUITS } from '../constants';

import Visualizer from './Visualizer';

export default function SidebarLeft() {
  const { currentView, apiCfg, currentExp, setCurrentExp, agentTasks, sessions, currentSessionId, addSession, removeSession, setCurrentSessionId, memoryStore, ragCount, fileCount } = useAppStore();
  const [memW, setMemW] = useState(67);
  const [ragW, setRagW] = useState(83);
  const [nnW, setNnW] = useState(91);
  const [metrics, setMetrics] = useState({ coh: '127 µs', fid: '99.4%', err: '0.6%', t: '15 mK' });
  const [agentLoads, setAgentLoads] = useState<number[]>(AGENTS.map(() => 50));
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionSort, setSessionSort] = useState<'updated' | 'alpha'>('updated');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionName, setEditSessionName] = useState('');

  // Drone states
  const [drones, setDrones] = useState([
    { id: 'Alpha-01', status: 'PATROL', battery: 89, alt: '1200m' },
    { id: 'Beta-09', status: 'CHARGING', battery: 12, alt: '0m' },
    { id: 'Gamma-44', status: 'INTERCEPT', battery: 67, alt: '3400m' },
    { id: 'Delta-12', status: 'IDLE', battery: 98, alt: '0m' },
  ]);

  useEffect(() => {
    const int = setInterval(() => {
      setMemW(Math.floor(55 + Math.random() * 35));
      setRagW(Math.floor(70 + Math.random() * 25));
      setNnW(Math.floor(75 + Math.random() * 22));
      setMetrics({
        coh: Math.floor(118 + Math.random() * 22) + ' µs',
        fid: (99.1 + Math.random() * 0.5).toFixed(2) + '%',
        err: (0.4 + Math.random() * 0.4).toFixed(2) + '%',
        t: (12 + Math.random() * 6).toFixed(1) + ' mK'
      });
      setAgentLoads(AGENTS.map(() => Math.floor(25 + Math.random() * 60)));
      setDrones(prev => prev.map(d => ({
        ...d,
        battery: Math.max(0, d.battery - (d.status === 'CHARGING' ? -2 : 1)),
        alt: d.status === 'CHARGING' || d.status === 'IDLE' ? '0m' : Math.floor(1000 + Math.random() * 3000) + 'm'
      })));
    }, 2800);
    return () => clearInterval(int);
  }, []);

  const sess = sessions.find(s => s.id === currentSessionId);
  const msgCount = sess ? sess.messages : 0;

  const handleNewSession = () => {
    const s = {
      id: 'sess-' + Date.now(),
      name: 'Session ' + (sessions.length + 1),
      created: new Date().toLocaleTimeString('en-US', { hour12: false }),
      history: [],
      messages: 0,
      exp: currentExp
    };
    addSession(s);
  };

  const handleExport = (e: React.MouseEvent, s: any) => {
    e.stopPropagation();
    const data = JSON.stringify(s, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.name.replace(/\s+/g, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredSessions = sessions.filter(s => {
    if (!sessionSearch) return true;
    const term = sessionSearch.toLowerCase();
    if (s.name.toLowerCase().includes(term)) return true;
    if (s.exp.toLowerCase().includes(term)) return true;
    if (s.history) {
      return s.history.some(m => {
        if (typeof m.content === 'string') return m.content.toLowerCase().includes(term);
        return false;
      });
    }
    return false;
  }).sort((a, b) => {
    if (sessionSort === 'alpha') {
      return a.name.localeCompare(b.name);
    } else {
      // sort by last updated. In a real app we'd have an updatedAt field. We will use a.messages as a proxy or just keep it simple.
      // If we don't have updatedAt, we can assume the last ones added/modified are last.
      // We'll add 'updatedAt' to type in store, but for now fallback to created or ID.
      const aTime = a.updatedAt || a.created || a.id;
      const bTime = b.updatedAt || b.created || b.id;
      return bTime > aTime ? 1 : bTime < aTime ? -1 : 0;
    }
  });

  const saveSessionName = (id: string) => {
    if (editSessionName.trim()) {
      useAppStore.getState().updateSession(id, { name: editSessionName.trim() });
    }
    setEditingSessionId(null);
  };

  const getProvColor = (prov: string) => {
    switch (prov) {
      case 'gemini': return 'var(--a2)';
      case 'anthropic': return 'var(--gold)';
      case 'openrouter': return 'var(--a3)';
      default: return 'var(--gold)';
    }
  };
  const pColor = getProvColor(apiCfg.provider);

  const expList = [
    { id: 'superposition', name: 'Superposition State', type: 'Qubit init & collapse', badge: 'QUANTUM', cls: 'bq' },
    { id: 'entanglement', name: 'Bell Entanglement', type: 'Multi-qubit correlation', badge: 'QUANTUM', cls: 'bq' },
    { id: 'grover', name: "Grover's Search", type: 'Quadratic speedup', badge: 'HYBRID', cls: 'bh' },
    { id: 'molecule', name: 'Molecular Sim', type: 'H₂ energy landscape', badge: 'HYBRID', cls: 'bh' },
    { id: 'teleportation', name: 'Quantum Teleport', type: 'State transfer proto', badge: 'QUANTUM', cls: 'bq' },
    { id: 'optimization', name: 'QAOA Optimize', type: 'Combinatorial solver', badge: 'AGENTIC', cls: 'ba' },
    { id: 'error', name: 'Error Correction', type: 'Surface code QEC', badge: 'AGENTIC', cls: 'ba' },
    { id: 'shor', name: "Shor's Algorithm", type: 'Prime factorization', badge: 'QUANTUM', cls: 'bq' },
    { id: 'vqe', name: 'VQE Chemistry', type: 'Variational eigensolver', badge: 'HYBRID', cls: 'bh' },
    { id: 'custom', name: 'Free Exploration', type: 'Open research mode', badge: 'AGENTIC', cls: 'ba' },
  ];

  if (currentView === 'chat') {
    return null;
  }

  return (
    <div className="left-content-area">
      <div className={`tab-content ${currentView === 'experiments' ? 'active' : ''}`}>
        <Visualizer />
        <div className="left-scroll">
          {expList.map(e => (
            <div key={e.id} className={`exp-item ${currentExp === e.id ? 'active' : ''}`} onClick={() => {
              setCurrentExp(e.id);
              useAppStore.getState().setTriggerAction(`Initiate quantum function: ${e.name} (${e.type})`);
              useAppStore.getState().setCurrentView('chat');
            }}>
              <div className="exp-name">{e.name}</div>
              <div className="exp-type">{e.type}</div>
              <span className={`exp-badge ${e.cls}`}>{e.badge}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`tab-content ${currentView === 'sessions' ? 'active' : ''}`} style={{ overflow: 'hidden' }}>
        <div className="sess-hdr">
          <button className="new-sess-btn" onClick={handleNewSession}>＋ NEW SESSION</button>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            <input 
              type="text" 
              placeholder="Search sessions..." 
              value={sessionSearch} 
              onChange={e => setSessionSearch(e.target.value)}
              className="sess-search-input"
              style={{ marginTop: 0, flex: 1 }}
            />
            <select 
              value={sessionSort} 
              onChange={e => setSessionSort(e.target.value as 'updated' | 'alpha')}
              className="sess-sort-select"
            >
              <option value="updated">Recent</option>
              <option value="alpha">A-Z</option>
            </select>
          </div>
        </div>
        <div className="left-scroll">
          {filteredSessions.length === 0 && <div style={{ padding: '16px', textAlign: 'center', fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--dim)' }}>No sessions found.<br />Click + NEW SESSION</div>}
          {filteredSessions.map(s => (
            <div key={s.id} className={`sess-item ${currentSessionId === s.id ? 'active' : ''}`} onClick={() => setCurrentSessionId(s.id)}>
              {editingSessionId === s.id ? (
                <input 
                  autoFocus
                  type="text"
                  value={editSessionName}
                  onChange={(e) => setEditSessionName(e.target.value)}
                  onBlur={() => saveSessionName(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveSessionName(s.id);
                    if (e.key === 'Escape') setEditingSessionId(null);
                  }}
                  className="sess-name-input"
                />
              ) : (
                <div className="sess-name">{s.name}</div>
              )}
              <div className="sess-meta">{s.created} · {s.messages} msgs · {s.exp}</div>
              <div style={{ display: 'flex', position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', gap: '4px' }}>
                <button className="sess-action-btn" title="Rename Session" onClick={(e) => {
                  e.stopPropagation();
                  setEditingSessionId(s.id);
                  setEditSessionName(s.name);
                }}>✎</button>
                <button className="sess-action-btn" title="Export JSON" onClick={(e) => handleExport(e, s)}>↓</button>
                <button className="sess-action-btn sess-del-btn" title="Delete Session" onClick={(e) => { e.stopPropagation(); removeSession(s.id); }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`tab-content ${currentView === 'system' ? 'active' : ''}`}>
        <div className="left-scroll">
          <div className="r-section">
            <div className="r-title">🔌 Active Provider</div>
            <div className="api-config-card">
              <div className="api-row">
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', fontWeight: 700 }}>{apiCfg.provider.toUpperCase()}</span>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: pColor }}>● LIVE</span>
              </div>
              <div className="api-key-hint">{apiCfg.models[apiCfg.provider]}</div>
              <div className="api-key-hint" style={{ color: apiCfg.provider === 'gemini' ? 'var(--a2)' : 'var(--a3)' }}>
                {apiCfg.provider === 'gemini' ? 'Server-side key proxy' : (apiCfg.keys[apiCfg.provider] ? '●●●●' + apiCfg.keys[apiCfg.provider].slice(-4) : 'Ready')}
              </div>
            </div>
          </div>

          <div className="r-section">
            <div className="r-title">⚡ Quantum Metrics</div>
            <div className="metric-row"><span className="metric-label">Coherence Time</span><span className="metric-val">{metrics.coh}</span></div>
            <div className="metric-row"><span className="metric-label">Gate Fidelity</span><span className="metric-val g">{metrics.fid}</span></div>
            <div className="metric-row"><span className="metric-label">Error Rate</span><span className="metric-val o">{metrics.err}</span></div>
            <div className="metric-row"><span className="metric-label">Active Qubits</span><span className="metric-val p">12</span></div>
            <div className="metric-row"><span className="metric-label">Temperature</span><span className="metric-val">{metrics.t}</span></div>
          </div>

          <div className="r-section">
            <div className="r-title">⚛ Circuit</div>
            <div className="circuit-display">{CIRCUITS[currentExp] || CIRCUITS.custom}</div>
          </div>

          <div className="r-section">
            <div className="r-title">◫ Session Log</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--dim)', lineHeight: 1.9 }}>
              Session: <span style={{ color: 'var(--gold)' }}>{sess ? 'ACTIVE' : 'NONE'}</span><br />
              Msgs: <span style={{ color: 'var(--gold)' }}>{msgCount}</span><br />
              RAG queries: <span style={{ color: 'var(--a2)' }}>{ragCount}</span><br />
              Files sent: <span style={{ color: 'var(--a3)' }}>{fileCount}</span><br />
              Mem entries: <span style={{ color: 'var(--gold)' }}>{memoryStore.length}</span>
            </div>
          </div>

          <div className="r-section">
            <div className="r-title">⬡ Persistent Memory</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'var(--dim)', lineHeight: 1.5, maxHeight: '200px', overflowY: 'auto' }}>
              {memoryStore.length === 0 ? 'No persistent memory entries.' : memoryStore.slice(-10).reverse().map((m, idx) => (
                <div key={idx} style={{ marginTop: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '6px' }}>
                   <div style={{ color: 'var(--text)' }}>Q: {m.u.substring(0, 30)}...</div>
                   <div style={{ color: 'var(--a2)' }}>A: {m.a.substring(0, 40)}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`tab-content ${currentView === 'agents' ? 'active' : ''}`}>
        <div className="left-scroll">
          <div className="r-section">
            <div className="r-title">◈ Agent Load</div>
            {AGENTS.map((a, i) => {
              const cls = a.type === 'SWARM' ? 'fill-purple' : a.type === 'NEURAL' ? 'fill-green' : 'fill-gold';
              const v = agentLoads[i] || 0;
              return (
                <div key={a.id} style={{ marginBottom: '5px' }}>
                  <div className="metric-row">
                    <span className="metric-label" style={{ fontSize: '8px' }}>{a.name}</span>
                    <span className="metric-val" style={{ color: a.color, fontSize: '9px' }}>{v}%</span>
                  </div>
                  <div className="prog"><div className={`prog-fill ${cls}`} style={{ width: `${v}%`, background: a.color }}></div></div>
                </div>
              );
            })}
          </div>

          <div className="r-section">
            <div className="r-title">▲ Active Agents</div>
            {AGENTS.map((a) => (
              <div key={a.id} className="agent-card">
                <div className="ac-hdr">
                  <span className="ac-name" style={{ color: a.color }}>{a.name}</span>
                  <div className="ac-dot" style={{ background: a.color, boxShadow: `0 0 4px ${a.color}` }}></div>
                </div>
                <div className="ac-task">{agentTasks[a.id]}</div>
                <span className="ac-type" style={{ background: `${a.color}22`, color: a.color }}>{a.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`tab-content ${currentView === 'drones' ? 'active' : ''}`}>
        <div className="left-scroll">
          <div className="r-section">
            <div className="r-title">🚁 Drone Fleet Telemetry</div>
            {drones.map(d => (
              <div key={d.id} className="agent-card" style={{ marginBottom: '10px' }}>
                <div className="ac-hdr">
                  <span className="ac-name" style={{ color: d.status === 'PATROL' ? 'var(--a2)' : d.status === 'INTERCEPT' ? 'var(--a3)' : 'var(--gold)' }}>{d.id}</span>
                  <div className="ac-dot" style={{ background: d.status === 'IDLE' ? '#555' : d.status === 'CHARGING' ? 'var(--gold)' : 'var(--a2)' }}></div>
                </div>
                <div className="ac-task">Status: {d.status}</div>
                <div className="ac-task">Altitude: {d.alt}</div>
                <div className="metric-row" style={{ marginTop: '5px' }}>
                  <span className="metric-label" style={{ fontSize: '8px' }}>BATTERY</span>
                  <span className="metric-val" style={{ color: d.battery > 20 ? 'var(--a2)' : 'var(--a3)' }}>{d.battery}%</span>
                </div>
                <div className="prog"><div className="prog-fill fill-green" style={{ width: `${d.battery}%`, background: d.battery > 20 ? 'var(--a2)' : 'var(--a3)' }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`tab-content ${currentView === 'channels' ? 'active' : ''}`}>
        <div className="left-scroll">
          <div className="r-section">
            <div className="r-title">📡 Global Channels Directory</div>
            {['News & Politics', 'Sports', 'Movies', 'Documentary', 'National Geographic', 'Financial News', 'Sci-Fi & Tech'].map(c => (
              <div key={c} className="agent-card" style={{ marginBottom: '5px', cursor: 'pointer' }} onClick={() => {
                useAppStore.getState().setTriggerAction(`Switch feed to ${c} channel`);
                useAppStore.getState().setCurrentView('chat');
              }}>
                <div className="ac-hdr">
                  <span className="ac-name" style={{ color: 'var(--text)' }}>{c}</span>
                  <div className="ac-dot" style={{ background: 'var(--dim)' }}></div>
                </div>
                <div className="ac-task" style={{ color: 'var(--dim)' }}>Tap to tune in and monitor</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sys-section">
        <div className="sys-title">◈ Cognitive Layer</div>
        <div className="sys-card">
          <div className="sys-ch"><span className="sys-cn" style={{ color: 'var(--gold)' }}>⬡ MEMORY</span><div className="sys-on" style={{ background: 'var(--gold)', boxShadow: '0 0 5px var(--gold)' }}></div></div>
          <div className="sys-desc">Session recall · experiment history</div>
          <div className="mem-bar"><div className="mem-fill fill-gold" style={{ width: `${memW}%` }}></div></div>
        </div>
        <div className="sys-card">
          <div className="sys-ch"><span className="sys-cn" style={{ color: 'var(--a2)' }}>◫ RAG ENGINE</span><div className="sys-on" style={{ background: 'var(--a2)', boxShadow: '0 0 5px var(--a2)' }}></div></div>
          <div className="sys-desc">4,200+ quantum physics papers indexed</div>
          <div className="mem-bar"><div className="mem-fill fill-purple" style={{ width: `${ragW}%` }}></div></div>
        </div>
        <div className="sys-card">
          <div className="sys-ch"><span className="sys-cn" style={{ color: 'var(--a3)' }}>▲ NEURAL NET</span><div className="sys-on" style={{ background: 'var(--a3)', boxShadow: '0 0 5px var(--a3)' }}></div></div>
          <div className="sys-desc">Circuit prediction · QNN inference</div>
          <div className="mem-bar"><div className="mem-fill fill-green" style={{ width: `${nnW}%` }}></div></div>
        </div>
      </div>
    </div>
  );
}
