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
import { useAppStore } from './store';
import { AGENTS } from './constants';

export default function App() {
  const { addSession, addMessage, sessions } = useAppStore();

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
          content: `QAIOS v3 online. All 9 agents synchronised.\n\n<code>⚙ API KEYS</code> — click the gear icon to configure providers. Gemini is built-in via the server-side proxy and ready now.\n\n<code>📎 Files</code> — attach images, PDFs, or text files to any message\n<code>🎤 Mic</code> — speak your query (Web Speech API)\n<code>◈ Sessions</code> — manage multiple research sessions in the left panel\n<code>↻ Refresh</code> — reload the live world news ticker\n\nLive news is loading across: Sports · Politics · Science · Geopolitics · Finance · Health · Entertainment · Tech\n\nReady to run quantum experiments or answer any domain query.`,
          agent: AGENTS[0],
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }, 600);
    }
  }, [sessions.length, addSession, addMessage]);

  return (
    <>
      <ApiModal />
      <TopNav />
      <div className="workspace">
        <SidebarNav />
        <SidebarLeft />
        <CenterConsole />
      </div>
      <NewsTicker />
    </>
  );
}

