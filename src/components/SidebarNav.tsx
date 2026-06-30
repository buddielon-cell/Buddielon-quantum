import React from 'react';
import { useAppStore } from '../store';

export default function SidebarNav() {
  const { currentView, setCurrentView } = useAppStore();

  const navItems = [
    { id: 'chat', label: 'Chat', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
    { id: 'monitor', label: 'MONITOR', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
    { id: 'experiments', label: 'EXPS', icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/> },
    { id: 'agents', label: 'AGENTS', icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></> },
    { id: 'system', label: 'SYSTEM', icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/> },
    { id: 'sessions', label: 'SESSIONS', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> },
    { id: 'drones', label: 'DRONES', icon: <path d="M17.65 21.36L12 18.23l-5.65 3.13 1.08-6.3-4.58-4.46 6.33-.92L12 4l2.82 5.73 6.33.92-4.58 4.46 1.08 6.3z" /> },
    { id: 'channels', label: 'CHANNELS', icon: <path d="M2 20h20M5 20V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12M12 2v4" /> },
  ];

  return (
    <div className="left-nav-bar">
      {navItems.map(item => (
        <div
          key={item.id}
          className={`left-nav-btn ${currentView === item.id ? 'active' : ''}`}
          onClick={() => setCurrentView(item.id)}
          title={item.label}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {item.icon}
          </svg>
          <span className="left-nav-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
