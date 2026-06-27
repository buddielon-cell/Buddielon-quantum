import { useState } from 'react';
import { useAppStore } from '../store';
import { OR_FREE_MODELS } from '../constants';

export default function ApiModal() {
  const { isModalOpen, setIsModalOpen, apiCfg, setApiCfg } = useAppStore();
  const [activeTab, setActiveTab] = useState('gemini');

  if (!isModalOpen) return null;

  return (
    <div className="modal-ov open" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
      <div className="modal-box">
        <div className="modal-hdr">
          <span className="modal-hdr-title">⚙ API PROVIDER CONFIGURATION</span>
          <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
        </div>
        <div className="prov-tabs">
          {['gemini', 'anthropic', 'openrouter', 'openai', 'groq', 'together', 'cohere'].map((p) => (
            <div key={p} className={`prov-tab ${activeTab === p ? 'active' : ''}`} onClick={() => setActiveTab(p)}>
              {p.toUpperCase()}
            </div>
          ))}
        </div>
        <div className="modal-body">
          {activeTab === 'gemini' && (
            <div className="prov-panel active">
              <span className="prov-badge prov-free">✦ DEFAULT — Powered by AI Studio Environment</span>
              <div className="field-lbl">ACTIVE MODEL</div>
              <select className="field-sel" value={apiCfg.models.gemini} onChange={(e) => setApiCfg({ models: { ...apiCfg.models, gemini: e.target.value } })}>
                <option value="gemini-2.5-flash">gemini-2.5-flash (default)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (capable)</option>
              </select>
              <div className="field-lbl">STATUS</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'var(--a2)' }}>◉ Integrated securely via backend proxy</div>
              <div className="btn-row">
                <button className="btn-prim" onClick={() => { setApiCfg({ provider: 'gemini' }); setIsModalOpen(false); }}>▶ USE THIS PROVIDER</button>
              </div>
            </div>
          )}

          {activeTab === 'anthropic' && (
            <div className="prov-panel active">
              <span className="prov-badge prov-free">✦ Requires valid key or backend override</span>
              <div className="field-lbl">API KEY</div>
              <input className="field-inp" type="password" placeholder="sk-ant-..." value={apiCfg.keys.anthropic || ''} onChange={(e) => setApiCfg({ keys: { ...apiCfg.keys, anthropic: e.target.value } })} />
              <div className="field-lbl">ACTIVE MODEL</div>
              <select className="field-sel" value={apiCfg.models.anthropic} onChange={(e) => setApiCfg({ models: { ...apiCfg.models, anthropic: e.target.value } })}>
                <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
                <option value="claude-3-5-sonnet-20240620">claude-3-5-sonnet</option>
              </select>
              <div className="btn-row">
                <button className="btn-prim" onClick={() => { setApiCfg({ provider: 'anthropic' }); setIsModalOpen(false); }}>▶ USE THIS PROVIDER</button>
              </div>
            </div>
          )}

          {activeTab === 'openrouter' && (
            <div className="prov-panel active">
              <span className="prov-badge prov-free">✦ FREE TIER AVAILABLE — 200+ Models</span>
              <div className="field-lbl">API KEY <span style={{ color: 'var(--dim)' }}>(from openrouter.ai/keys)</span></div>
              <input className="field-inp" type="password" placeholder="sk-or-v1-..." value={apiCfg.keys.openrouter} onChange={(e) => setApiCfg({ keys: { ...apiCfg.keys, openrouter: e.target.value } })} />
              <div className="field-lbl">FREE MODELS</div>
              <div className="model-grid">
                {OR_FREE_MODELS.map(m => (
                  <div key={m} className={`model-chip ${m === apiCfg.models.openrouter ? 'sel' : ''}`} onClick={() => setApiCfg({ models: { ...apiCfg.models, openrouter: m } })}>
                    {m.replace(':free','').split('/').pop()}<br/><span style={{ color: 'var(--a3)', fontSize: '6px' }}>FREE</span>
                  </div>
                ))}
              </div>
              <div className="field-lbl">CUSTOM MODEL STRING</div>
              <input className="field-inp" placeholder="e.g. meta-llama/llama-3.2-3b-instruct:free" value={apiCfg.models.openrouter} onChange={(e) => setApiCfg({ models: { ...apiCfg.models, openrouter: e.target.value } })} />
              <div className="btn-row">
                <button className="btn-prim" onClick={() => { setApiCfg({ provider: 'openrouter' }); setIsModalOpen(false); }}>▶ USE THIS PROVIDER</button>
              </div>
            </div>
          )}
          
          {/* Other tabs follow similar pattern. Since we just need functional parity, I will simplify the others. */}
          {['openai', 'groq', 'together', 'cohere'].includes(activeTab) && (
            <div className="prov-panel active">
              <span className="prov-badge prov-paid">💳 API KEY REQUIRED</span>
              <div className="field-lbl">API KEY</div>
              <input className="field-inp" type="password" placeholder="..." value={apiCfg.keys[activeTab]} onChange={(e) => setApiCfg({ keys: { ...apiCfg.keys, [activeTab]: e.target.value } })} />
              <div className="field-lbl">MODEL</div>
              <input className="field-inp" value={apiCfg.models[activeTab]} onChange={(e) => setApiCfg({ models: { ...apiCfg.models, [activeTab]: e.target.value } })} />
              <div className="btn-row">
                <button className="btn-prim" onClick={() => { setApiCfg({ provider: activeTab }); setIsModalOpen(false); }}>▶ USE THIS PROVIDER</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
