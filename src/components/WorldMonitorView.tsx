import React, { useState, useEffect } from 'react';

export default function WorldMonitorView() {
  const [layers, setLayers] = useState([
    { id: 'iran', label: 'Iran Attacks', active: true, icon: '🎯' },
    { id: 'intel', label: 'Intel Hotspots', active: true, icon: '🛰' },
    { id: 'conflict', label: 'Conflict Zones', active: true, icon: '⚔️' },
    { id: 'military', label: 'Military Bases', active: true, icon: '🏛' },
    { id: 'nuclear', label: 'Nuclear Sites', active: true, icon: '☢' },
  ]);

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#000', color: 'var(--text)', fontFamily: "'Share Tech Mono', monospace" }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: 'var(--a2)', fontWeight: 'bold' }}>WORLD</span>
          <span style={{ color: 'var(--dim)' }}>MONITOR <span style={{ color: 'var(--text)' }}>v2.8.0</span></span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: 'var(--a2)' }}>● LIVE</span>
          <select style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '2px 5px', fontFamily: 'inherit' }}>
            <option>Global</option>
            <option>MENA</option>
            <option>APAC</option>
            <option>EUROPE</option>
          </select>
          <button style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '2px 8px', fontWeight: 'bold' }}>MISSION</button>
          <button style={{ background: 'var(--a3)', color: '#000', border: 'none', padding: '2px 8px', fontWeight: 'bold' }}>DEFCON 3</button>
          <span style={{ color: 'var(--dim)' }}>Open full screen ↗</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Left Side Panel */}
        <div style={{ width: '260px', borderRight: '1px solid var(--border)', background: 'rgba(0,0,0,0.8)', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--dim)', marginBottom: '5px' }}>GLOBAL SITUATION</div>
            <div style={{ fontSize: '11px', color: 'var(--text)' }}>MON, 22 JUN 2026 22:07:19 UTC</div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
              {['1h', '6h', '24h', '48h', '7d', 'All'].map(t => (
                <button key={t} style={{ background: t === '7d' ? 'var(--a2)' : 'transparent', color: t === '7d' ? '#000' : 'var(--text)', border: '1px solid var(--border)', padding: '2px 5px', fontSize: '10px', flex: 1 }}>{t}</button>
              ))}
            </div>
            
            <div style={{ border: '1px solid var(--border)', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--dim)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                LAYERS <span>?</span>
              </div>
              <input type="text" placeholder="Search layers..." style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px', marginBottom: '10px', fontFamily: 'inherit' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {layers.map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleLayer(l.id)}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid var(--border)', background: l.active ? 'var(--a2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '10px' }}>
                      {l.active ? '✓' : ''}
                    </div>
                    <span style={{ filter: l.active ? 'none' : 'grayscale(1)', opacity: l.active ? 1 : 0.5 }}>{l.icon}</span>
                    <span style={{ fontSize: '11px', flex: 1, opacity: l.active ? 1 : 0.5 }}>{l.label}</span>
                    <span style={{ color: 'var(--dim)', fontSize: '10px' }}>ℹ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Simulated Grid / Map Background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
          
          {/* Central Globe Representation (CSS-based mock) */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', borderRadius: '50%', border: '1px dashed var(--a2)', opacity: 0.3, boxShadow: 'inset 0 0 50px rgba(0, 255, 170, 0.1)' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '380px', height: '100px', border: '1px solid var(--a3)', borderRadius: '50%', opacity: 0.2 }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', width: '380px', height: '100px', border: '1px solid var(--a3)', borderRadius: '50%', opacity: 0.2 }}></div>

          {/* Map Controls */}
          <div style={{ position: 'absolute', right: '20px', top: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button style={{ background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            <button style={{ background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
            <button style={{ background: 'var(--deep)', border: '1px solid var(--border)', color: 'var(--text)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>⌂</button>
          </div>

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '15px', fontSize: '9px', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--dim)' }}>LEGEND</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', background: 'var(--a3)', borderRadius: '50%' }}></div> High Alert</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%' }}></div> Elevated</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', background: 'var(--a2)', borderRadius: '50%' }}></div> Monitoring</span>
            <span style={{ color: 'var(--dim)' }}>WEBGL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
