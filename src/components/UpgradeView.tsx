import React, { useState } from 'react';

export default function UpgradeView() {
  const [showSignIn, setShowSignIn] = useState(false);

  if (showSignIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--panel)', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: 'var(--deep)', padding: '40px', border: '1px solid var(--border)', borderRadius: '4px', width: '300px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Sign In</h2>
          <input type="text" placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#000', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
          <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#000', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
          <button style={{ width: '100%', padding: '10px', background: 'var(--a2)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setShowSignIn(false)}>AUTHENTICATE</button>
          <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--dim)', cursor: 'pointer' }} onClick={() => setShowSignIn(false)}>← Back to Upgrade</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', overflowY: 'auto', height: '100%', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
         <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', fontSize: '12px', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px', cursor: 'pointer' }} onClick={() => setShowSignIn(true)}>SIGN IN TO UPGRADE</button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Intelligence Infrastructure</h1>
        <p style={{ color: 'var(--dim)', maxWidth: '600px', margin: '0 auto' }}>
          For governments, institutions, trading desks, and organizations that need the full platform with maximum security, AI agents, TV apps, and data depth.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '80px' }}>
        {[
          { title: 'Government-Grade Security', desc: 'Air-gapped deployment, on-premises Docker, dedicated cloud tenant, SOC 2 Type II path, SSO/MFA, and full audit trail.', icon: '🛡️' },
          { title: 'AI Agents & MCP', desc: 'Autonomous intelligence agents with investor personas. Connect World Monitor as a tool to Claude, GPT, or custom LLMs via MCP.', icon: '🧠' },
          { title: 'Expanded Data Layers', desc: 'Tens of thousands of infrastructure assets mapped globally. Satellite imagery integration with change detection and SAR.', icon: '🌐' },
          { title: '100+ Data Connectors', desc: 'PostgreSQL, Snowflake, Splunk, Sentinel, Jira, Slack, Teams, and more. Export to PDF, PowerPoint, CSV, GeoJSON.', icon: '🔌' },
          { title: 'White-Label, TV & Embeddable', desc: 'Your brand, your domain, your desktop app. Android TV app for SOC walls and trading floors. Embeddable iframe panels.', icon: '📺' },
          { title: 'Financial Intelligence', desc: 'Earnings calendar, energy grid data, enhanced commodity tracking with cargo inference, sanctions screening with AIS correlation.', icon: '📊' }
        ].map(item => (
          <div key={item.title} style={{ background: 'var(--deep)', padding: '30px', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>{item.icon}</div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>{item.title}</h3>
            <p style={{ color: 'var(--dim)', fontSize: '13px', lineHeight: '1.5' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <button style={{ background: 'var(--a3)', color: '#000', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '1px', borderRadius: '4px' }}>
          TALK TO SALES →
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Compare Tiers</h2>
      </div>

      <div style={{ background: 'var(--deep)', border: '1px solid var(--border)', borderRadius: '4px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '20px', color: 'var(--dim)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Feature</th>
              <th style={{ padding: '20px', color: 'var(--dim)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Free ($0)</th>
              <th style={{ padding: '20px', color: 'var(--a3)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Pro ($39.99)</th>
              <th style={{ padding: '20px', color: 'var(--dim)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>API ($99.99)</th>
              <th style={{ padding: '20px', color: 'var(--dim)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Enterprise (Contact)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Data refresh', '5-15 min', '<60 seconds', 'Per-request', 'Live-edge'],
              ['Dashboard', '50+ panels', '50+ panels', '—', 'White-label'],
              ['AI', 'BYOK', 'Included', '—', 'Agents + personas'],
              ['Briefs & alerts', '—', 'Daily + flash', '—', 'Team distribution'],
              ['Orbital Surveillance', 'Live tracking', 'Pass alerts + analysis', '—', 'Imagery + SAR']
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '13px' }}>{row[0]}</td>
                <td style={{ padding: '15px 20px', color: 'var(--dim)', fontSize: '13px' }}>{row[1]}</td>
                <td style={{ padding: '15px 20px', color: 'var(--a3)', fontSize: '13px' }}>{row[2]}</td>
                <td style={{ padding: '15px 20px', color: 'var(--dim)', fontSize: '13px' }}>{row[3]}</td>
                <td style={{ padding: '15px 20px', color: 'var(--dim)', fontSize: '13px' }}>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
