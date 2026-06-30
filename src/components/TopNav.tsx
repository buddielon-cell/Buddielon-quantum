import { useEffect, useState } from 'react';
import { useAppStore } from '../store';

export default function TopNav() {
  const { apiCfg, setIsModalOpen, isOffline, setIsOffline } = useAppStore();
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
    <div className="header" style={{ padding: '0 20px' }}>
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
        <span>WORLD MONITOR <span style={{ fontSize: '9px', fontWeight: 300, color: 'var(--dim)', letterSpacing: '1px' }}>BY SOMEONE.CEO</span></span>
      </div>
      <div className="hdr-mid" style={{ display: 'flex', gap: '20px', fontSize: '11px', textTransform: 'uppercase', fontFamily: "'Share Tech Mono', monospace" }}>
        <span style={{ cursor: 'pointer', color: 'var(--dim)' }}>Free</span>
        <span style={{ cursor: 'pointer', color: 'var(--dim)' }}>Pro</span>
        <span style={{ cursor: 'pointer', color: 'var(--dim)' }}>API</span>
        <span style={{ cursor: 'pointer', color: 'var(--dim)' }}>Enterprise</span>
      </div>
      <div className="hdr-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {isOffline && (
          <div className="offline-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444', padding: '4px 8px', borderRadius: '4px', color: '#ff4444', fontSize: '10px', fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace" }}>
            <div style={{ width: '6px', height: '6px', background: '#ff4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
            OFFLINE
          </div>
        )}
        {!isOffline && (
          <div className="prov-status" style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => setIsOffline(!isOffline)} title="Toggle Offline Mode">
            <div className="prov-dot" style={{ background: pColor, boxShadow: `0 0 6px ${pColor}` }}></div>
            <span className="prov-name" style={{ color: pColor }}>
              {apiCfg.provider.toUpperCase()}
            </span>
          </div>
        )}
        <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '5px 10px', fontSize: '10px', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px' }} onClick={() => useAppStore.getState().setCurrentView('upgrade')}>SIGN IN</button>
        <button style={{ background: 'var(--a3)', color: '#000', border: 'none', padding: '5px 15px', fontSize: '10px', fontWeight: 'bold', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px' }} onClick={() => useAppStore.getState().setCurrentView('upgrade')}>UPGRADE TO PRO</button>
        <button className="icon-btn" onClick={() => setIsModalOpen(true)} title="API Keys">⚙</button>
      </div>
    </div>
  );
}
