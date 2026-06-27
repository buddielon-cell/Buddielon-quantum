import { useEffect, useState } from 'react';
import { useAppStore } from '../store';

export default function TopNav() {
  const { apiCfg, setIsModalOpen } = useAppStore();
  const [timeStr, setTimeStr] = useState('--:--:--');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getProvColor = (prov: string) => {
    switch (prov) {
      case 'gemini': return 'var(--a2)';
      case 'anthropic': return 'var(--gold)';
      case 'openrouter': return 'var(--a3)';
      case 'openai': return '#00aaff';
      case 'groq': return '#ff8844';
      case 'together': return 'var(--a2)';
      case 'cohere': return '#ff44aa';
      default: return 'var(--gold)';
    }
  };

  const pColor = getProvColor(apiCfg.provider);

  return (
    <div className="header">
      <div className="logo">QA<span>IO</span>S <span style={{ fontSize: '9px', fontWeight: 300, color: 'var(--dim)', letterSpacing: '1px' }}>v3 QUANTUM AGENTIC OS</span></div>
      <div className="hdr-mid">
        <div className="prov-status">
          <div className="prov-dot" style={{ background: pColor, boxShadow: `0 0 6px ${pColor}` }}></div>
          <span className="prov-name" style={{ color: pColor }}>{apiCfg.provider.toUpperCase()}</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'var(--dim)', marginLeft: '2px' }}>{apiCfg.models[apiCfg.provider]}</span>
        </div>
      </div>
      <div className="hdr-right">
        <div className="live-dot"></div>
        <div className="hdr-clock">{timeStr}</div>
        <button className="icon-btn" onClick={() => setIsModalOpen(true)} title="API Keys">⚙</button>
        <button className="icon-btn" title="Refresh News" onClick={() => {
           // Quick refresh anim
           const btn = document.getElementById('newsRefreshBtn');
           if (btn) {
              btn.style.color = 'var(--a3)';
              setTimeout(() => btn.style.color = '', 2000);
           }
        }} id="newsRefreshBtn">↻</button>
      </div>
    </div>
  );
}
