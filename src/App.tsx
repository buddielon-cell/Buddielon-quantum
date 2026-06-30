/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import TopNav from './components/TopNav';
import SidebarLeft from './components/SidebarLeft';
import SidebarNav from './components/SidebarNav';
import CenterConsole from './components/CenterConsole';
import NewsTicker from './components/NewsTicker';
import ApiModal from './components/ApiModal';
import CommandPalette from './components/CommandPalette';
import UpgradeView from './components/UpgradeView';
import WorldMonitorView from './components/WorldMonitorView';
import { useAppStore } from './store';
import { AGENTS } from './constants';

export default function App() {
  const { 
    addSession, addMessage, sessions, currentView,
    isOffline, setIsOffline, queuedMessages, clearQueuedMessages, setTriggerAction 
  } = useAppStore();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  useEffect(() => {
    if (!isOffline && queuedMessages.length > 0) {
      // Sync offline messages
      addMessage({
        role: 'system',
        content: `Connection restored. Synchronizing ${queuedMessages.length} queued messages...`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      queuedMessages.forEach((msg, idx) => {
        setTimeout(() => {
          setTriggerAction(msg);
        }, 1500 * (idx + 1));
      });
      clearQueuedMessages();
    }
  }, [isOffline, queuedMessages, clearQueuedMessages, setTriggerAction, addMessage]);

  useEffect(() => {
    // initialize first session on load
    if (sessions.length === 0) {
      const s = {
        id: 'sess-' + Date.now(),
        name: 'Session 1',
        created: new Date().toLocaleTimeString('en-US', { hour12: false }),
        history: [],
        messages: 0,
        exp: 'superposition'
      };
      addSession(s);

      // Intro message
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: `QAIOS v3 online. All 14 agents synchronised.\n\n<code>⚙ API KEYS</code> — click the gear icon to configure providers. Gemini is built-in via the server-side proxy and ready now.\n\n<code>📎 Files</code> — attach images, PDFs, or text files to any message\n<code>🎤 Mic</code> — speak your query (Web Speech API)\n<code>◈ Sessions</code> — manage multiple research sessions in the left panel\n<code>↻ Refresh</code> — reload the live world news ticker\n\nLive news is loading across: Sports · Politics · Science · Geopolitics · Finance · Health · Entertainment · Tech\n\nReady to run quantum experiments or answer any domain query. Use Cmd+K for Command Palette.`,
          agent: AGENTS[0],
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }, 600);
    }
  }, [sessions.length, addSession, addMessage]);

  return (
    <>
      <CommandPalette />
      <ApiModal />
      <TopNav />
      <div className="workspace">
        <SidebarNav />
        <SidebarLeft />
        {currentView === 'upgrade' ? (
           <div style={{ flex: 1, height: '100%', background: 'var(--panel)', borderLeft: '1px solid var(--border)' }}>
             <UpgradeView />
           </div>
        ) : currentView === 'monitor' ? (
           <div style={{ flex: 1, height: '100%', borderLeft: '1px solid var(--border)' }}>
             <WorldMonitorView />
           </div>
        ) : (
           <CenterConsole />
        )}
      </div>
      <NewsTicker />
    </>
  );
}

