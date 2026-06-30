import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { AGENTS } from '../constants';
import { Message } from '../types';
import { LocalEngine } from '../utils/LocalEngine';

export default function CenterConsole() {
  const { 
    activeAgentId, setActiveAgentId, isThinking, setIsThinking, messages, addMessage,
    attachedFiles, setAttachedFiles, incRagCount, setAgentTask, apiCfg, memoryStore, currentExp,
    triggerAction, setTriggerAction, currentSessionId, isOffline
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState('General');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCapture = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      alert('Camera access denied or unavailable.');
      setIsCapturing(false);
    }
  };

  const stopCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }
    setIsCapturing(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        const currentFiles = useAppStore.getState().attachedFiles;
        setAttachedFiles([...currentFiles, { name: `snapshot_${Date.now()}.jpg`, type: 'image/jpeg', data: dataUrl, kind: 'image' } as any]);
        stopCapture();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (triggerAction) {
      handleSend(triggerAction);
      setTriggerAction(null);
    }
  }, [triggerAction]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const filePromises = Array.from(files).map((f: File) => {
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        const type = f.type || 'text/plain';
        if (type.startsWith('image/')) {
          reader.onload = ev => resolve({ name: f.name, type, data: ev.target?.result, kind: 'image' });
          reader.readAsDataURL(f);
        } else if (type === 'application/pdf') {
          reader.onload = ev => resolve({ name: f.name, type, data: ev.target?.result, kind: 'pdf' });
          reader.readAsDataURL(f);
        } else {
          reader.onload = ev => resolve({ name: f.name, type: 'text', data: ev.target?.result, kind: 'text' });
          reader.readAsText(f);
        }
      });
    });

    const newFiles = await Promise.all(filePromises);
    setAttachedFiles([...attachedFiles, ...newFiles]);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random()*999).toString().padStart(3,'0');

  const formatText = (text: string) => {
    return text
      .replace(/\[R\]([\s\S]*?)\[\/R\]/g, '<div class="result-block">$1</div>')
      .replace(/\[RAG\]([\s\S]*?)\[\/RAG\]/g, '<div class="rag-block">◫ RAG: $1</div>')
      .replace(/\[MEM\]([\s\S]*?)\[\/MEM\]/g, '<div class="mem-block">⬡ MEMORY: $1</div>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  };

  const runSwarmWorkflow = async (taskText: string) => {
    setIsThinking(true);
    setInputText('');

    addMessage({
      role: 'user',
      content: formatText(taskText),
      timestamp: ts(),
      badge: 'SWARM-INIT'
    });

    const getAgent = (nameRegex: RegExp) => AGENTS.find(a => nameRegex.test(a.name)) || AGENTS[0];

    const makeSwarmCall = async (systemPrompt: string) => {
      if (isOffline) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return `[OFFLINE SIMULATION] Synthesized local data for: ${systemPrompt.split('.')[0]}`;
      }
      const res = await fetch('/api/gemini', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            model: apiCfg.models.gemini,
            systemPrompt: systemPrompt,
            messages: [{ role: 'user', content: taskText }]
         })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.text;
    }

    try {
        const swarm1 = getAgent(/SWARM-01/i);
        setAgentTask(swarm1.id, 'Gathering data...');
        const researchData = await makeSwarmCall("You are the SWARM RESEARCHER. Gather relevant concepts, theories, and data for the user's task. Output a concise summary.");
        addMessage({ role: 'assistant', content: researchData, agent: swarm1, timestamp: ts(), badge: 'RESEARCHER' });
        
        const strategist = getAgent(/ANALYSIS/i);
        setAgentTask(strategist.id, 'Developing strategy...');
        const strategyPlan = await makeSwarmCall(`You are the STRATEGIST. Based on this research: ${researchData}\n\nOutline a high-level strategy for the user's task.`);
        addMessage({ role: 'assistant', content: strategyPlan, agent: strategist, timestamp: ts(), badge: 'STRATEGIST' });

        const architect = getAgent(/SYNTHESIS/i);
        setAgentTask(architect.id, 'Designing architecture...');
        const architecture = await makeSwarmCall(`You are the ARCHITECT. Based on this strategy: ${strategyPlan}\n\nDesign the technical architecture and specifications.`);
        addMessage({ role: 'assistant', content: architecture, agent: architect, timestamp: ts(), badge: 'ARCHITECT' });

        const critic = getAgent(/UPGRADE-CORE/i);
        setAgentTask(critic.id, 'Critiquing design...');
        const critique = await makeSwarmCall(`You are the CRITIC. Critique this architecture: ${architecture}\n\nFind logical gaps and suggest improvements. Be harsh but constructive.`);
        addMessage({ role: 'assistant', content: critique, agent: critic, timestamp: ts(), badge: 'CRITIC' });

        const factChecker = getAgent(/QUANTUM-CORE/i);
        setAgentTask(factChecker.id, 'Verifying...');
        const finalOutput = await makeSwarmCall(`You are the FACT-CHECKER. Verify the strategy and architecture based on this critique: ${critique}\n\nProvide a final verified output and conclusion.`);
        addMessage({ role: 'assistant', content: finalOutput, agent: factChecker, timestamp: ts(), badge: 'FACT-CHECKER' });

        addMessage({ role: 'system', content: `[QAIOS] Swarm R&D Simulation complete. All 5 agents synchronized successfully.`, timestamp: ts() });
    } catch (e: any) {
        addMessage({ role: 'system', content: `⚠ Swarm execution failed: ${e.message}`, timestamp: ts() });
    }

    setAgentTask(getAgent(/SWARM-01/i).id, 'Sync · listening');
    setAgentTask(getAgent(/ANALYSIS/i).id, 'Sync · listening');
    setAgentTask(getAgent(/SYNTHESIS/i).id, 'Sync · listening');
    setAgentTask(getAgent(/UPGRADE-CORE/i).id, 'Sync · listening');
    setAgentTask(getAgent(/QUANTUM-CORE/i).id, 'Sync · listening');
    setIsThinking(false);
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText !== undefined ? overrideText : inputText.trim();
    if (!text && attachedFiles.length === 0) return;
    if (isThinking) return;

    const isSwarm = /swarm|simulate|simulation|r&d|realtime|research|Initiate quantum function/i.test(text);
    if (isSwarm) {
      return runSwarmWorkflow(text);
    }

    setIsThinking(true);
    setInputText('');

    const currentAttachedFiles = useAppStore.getState().attachedFiles;

    // format for UI
    const fileInd = currentAttachedFiles.length ? `<div class="file-msg-preview">📎 ${currentAttachedFiles.map(f => f.name).join(' · ')}</div>` : '';
    
    const isFirstMessage = messages.length === 0;

    // Add User Message to UI
    addMessage({
      role: 'user',
      content: text + fileInd,
      timestamp: ts(),
      badge: category.toUpperCase()
    });
    
    if (isFirstMessage && currentSessionId && !isOffline) {
      setTimeout(async () => {
        try {
          const titleRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: apiCfg.models.gemini,
              systemPrompt: 'You are a summarization bot. Summarize the user query into a concise 2-4 word title. Respond ONLY with the title string.',
              messages: [{ role: 'user', content: text }]
            })
          });
          const titleData = await titleRes.json();
          if (titleData.text) {
             useAppStore.getState().updateSession(currentSessionId, { name: titleData.text.replace(/["']/g, '').trim() });
          }
        } catch (e) {
          console.error('Failed to generate session title', e);
        }
      }, 0);
    }

    const isRAG = /rag|search|paper|literature|find|retrieve/i.test(text);
    if (isRAG) incRagCount();

    const isUpgrade = /upgrade|improve|evolution|self-improve/i.test(text);
    const effectiveAgentId = isUpgrade ? 'upgrade-core' : activeAgentId;
    
    const ag = AGENTS.find(a => a.id === effectiveAgentId) || AGENTS[0];
    setAgentTask(ag.id, 'Processing...');

    // Prepare API payload
    let contentForApi: any = [];
    if (currentAttachedFiles.length > 0) {
       currentAttachedFiles.forEach(f => {
          if (f.kind === 'image' || f.kind === 'pdf') {
             contentForApi.push({ type: 'document', source: { data: f.data, media_type: f.type } });
          } else {
             contentForApi.push({ type: 'text', text: `[File: ${f.name}]\n${f.data}\n[End File]` });
          }
       });
       if (text) contentForApi.push({ type: 'text', text });
    } else {
       contentForApi = text;
    }

    const memCtx = memoryStore.slice(-15).map(m => `Q:"${m.u.slice(0, 100)}" A:"${m.a.slice(0, 150)}"`).join('\n') || 'None';
    const liveNewsCtx = useAppStore.getState().liveNews.slice(0, 5).map((n: any) => `- [${n.src}] ${n.text}`).join('\n') || 'None';
    const sysProm = `You are QAIOS v3 — a Quantum Agentic Intelligence OS running on ${apiCfg.provider.toUpperCase()}.
Active Agent: ${ag.name} (${ag.type})
Active experiment: ${currentExp} | Query category: ${category}
Session memory:\n${memCtx}
Live Global Events:\n${liveNewsCtx}
Rules: be concise + powerful. Use [R]...[/R] for results, [RAG]...[/RAG] for retrieved knowledge, [MEM]...[/MEM] for memory.
CRITICAL CAPABILITIES:
- If acting as UPGRADE-CORE, simulate the upgrade process with detailed config/code changes or simulated compilation logs.
- If acting as OVERSEER (Surveillance), ingest any provided news or simulated global events and trigger automated summaries and alerts based on geopolitical risk parameters.
- If acting as CAPITAL (Business Intelligence), calculate investment projections and provide actionable business management suggestions.
- If acting as SWARM, format output as a parallel multi-agent stream (e.g. SWARM-01: [Simulating X], SWARM-02: [Validating Y]).`;

    try {
      let replyText = "";
      if (isOffline) {
        useAppStore.getState().addQueuedMessage(text);
        replyText = await LocalEngine.generate(text, sysProm);
      } else if (apiCfg.provider === 'gemini') {
        try {
          const res = await fetch('/api/gemini', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                model: apiCfg.models.gemini,
                systemPrompt: sysProm,
                messages: [{ role: 'user', content: contentForApi }]
             })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          replyText = data.text;
        } catch (apiError) {
          // Graceful fallback if API call fails
          useAppStore.getState().addQueuedMessage(text);
          replyText = await LocalEngine.generate(text, sysProm);
        }
      } else {
        // Mocking for other providers since we only implemented gemini backend
        replyText = `[R]Response from ${apiCfg.provider}[/R]\nSimulated response for ${text}`;
      }

      addMessage({
        role: 'assistant',
        content: replyText,
        agent: ag,
        timestamp: ts()
      });

      setAgentTask(ag.id, ag.task); // reset
      setAttachedFiles([]);
    } catch (e: any) {
      addMessage({
        role: 'system',
        content: `⚠ Provider error: ${e.message}\n\nTip: Check API key in ⚙ API Settings, or switch provider.`,
        timestamp: ts()
      });
    }

    setIsThinking(false);
  };

  return (
    <div className="center-panel">
      <div className="console-area">
        <div className="messages">
          {messages.map((m, i) => {
            if (m.role === 'system') {
               return (
                  <div key={i} className="msg">
                     <div className="msg-av av-red">SYS</div>
                     <div className="msg-body">
                        <div className="msg-hdr"><span className="msg-name" style={{color:'#ff4444'}}>SYSTEM</span><span className="msg-time">{m.timestamp}</span></div>
                        <div className="msg-text" dangerouslySetInnerHTML={{ __html: formatText(m.content as string) }}></div>
                     </div>
                  </div>
               );
            }
            if (m.role === 'user') {
               return (
                  <div key={i} className="msg">
                     <div className="msg-av av-u">ME</div>
                     <div className="msg-body">
                        <div className="msg-hdr">
                           <span className="msg-name" style={{ color: '#aaa' }}>YOU</span>
                           {m.badge && <span className="msg-badge" style={{ background: 'rgba(150,150,150,.1)', color: '#666' }}>{m.badge}</span>}
                           <span className="msg-time">{m.timestamp}</span>
                        </div>
                        <div className="msg-text" dangerouslySetInnerHTML={{ __html: m.content as string }}></div>
                     </div>
                  </div>
               );
            }
            // Assistant
            const ag = m.agent || AGENTS[0];
            return (
               <div key={i} className="msg">
                  <div className={`msg-av ${ag.avClass}`}>{ag.name.slice(0, 2)}</div>
                  <div className="msg-body">
                     <div className="msg-hdr">
                        <span className="msg-name" style={{ color: ag.color }}>{ag.name}</span>
                        <span className="msg-badge" style={{ background: `${ag.color}22`, color: ag.color }}>{ag.type}</span>
                        <span className="msg-time">{m.timestamp}</span>
                     </div>
                     <div className="msg-text" dangerouslySetInnerHTML={{ __html: formatText(m.content as string) }}></div>
                  </div>
               </div>
            );
          })}
          {isThinking && (
            <div className="msg">
               <div className={`msg-av ${(AGENTS.find(a=>a.id===activeAgentId)||AGENTS[0]).avClass}`}>
                  {(AGENTS.find(a=>a.id===activeAgentId)||AGENTS[0]).name.slice(0,2)}
               </div>
               <div className="msg-body">
                  <div className="msg-hdr">
                     <span className="msg-name" style={{color: (AGENTS.find(a=>a.id===activeAgentId)||AGENTS[0]).color}}>{(AGENTS.find(a=>a.id===activeAgentId)||AGENTS[0]).name}</span>
                     <span className="msg-time">{ts()}</span>
                  </div>
                  <div className="typing"><span></span><span></span><span></span></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
        
      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--void)' }}>
        <div className="kimi-input-area" style={{ borderTop: 'none' }}>
          <div className="kimi-tools">
            <button className="kimi-tool" onClick={() => document.getElementById('fileInput')?.click()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              File
            </button>
            <button className="kimi-tool" onClick={() => alert('Mic listening enabled')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              Mic
            </button>
            <button className="kimi-tool" onClick={() => alert('TTS engine active')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              TTS
            </button>
            <button className="kimi-tool" onClick={() => handleSend('Initialize realtime Swarm R&D simulation')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Swarm
            </button>
            <button className="kimi-tool" onClick={() => handleSend('Analyze business intelligence and calculate investment projections based on the current data.')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
              BI Agent
            </button>
            <button className="kimi-tool" onClick={() => setCategory('Analysis')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Analysis
            </button>
          </div>

          {attachedFiles.length > 0 && (
            <div className="file-bar has-files" style={{ borderRadius: '12px', background: 'transparent', border: 'none', padding: '0 4px', borderTop: 'none' }}>
              <span className="file-bar-lbl">📎 ATTACHED:</span>
              {attachedFiles.map((f, i) => (
                <div key={i} className="file-tag">
                  <span>{f.kind === 'image' ? '🖼' : f.kind === 'pdf' ? '📄' : '📝'} {f.name}</span>
                  <span className="file-rm" onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}>✕</span>
                </div>
              ))}
            </div>
          )}

          <div className="kimi-input-box">
            <button className="kimi-icon-btn" title="Voice Input">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8.5 9.5a3 3 0 0 0 0 5"/>
                <path d="M15.5 9.5a3 3 0 0 1 0 5"/>
                <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            
            <textarea 
              className="kimi-textarea"
              rows={1} 
              placeholder="Ask away. Pics work too." 
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />

            {inputText || attachedFiles.length > 0 ? (
              <button className="kimi-icon-btn send-active" onClick={() => handleSend()} disabled={isThinking}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            ) : (
              <>
                <button className="kimi-icon-btn" title="Live Capture" onClick={startCapture}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
                <label className="kimi-icon-btn" title="Attach File" htmlFor="fileInput">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v8M8 12h8"/>
                  </svg>
                </label>
                <input type="file" id="fileInput" ref={fileInputRef} accept="image/*,.pdf,.txt,.md,.csv,.json" multiple onChange={handleFiles} style={{display:'none'}} />
              </>
            )}
          </div>

          {isCapturing && (
            <div style={{ position: 'absolute', bottom: '100%', right: '10px', background: '#000', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', zIndex: 10 }}>
              <div style={{ position: 'relative', width: '300px', marginBottom: '10px' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--a3)', display: 'block' }}></video>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(var(--a2) 1px, transparent 1px)', backgroundSize: '100% 20%', animation: 'scanline 2s linear infinite', opacity: 0.3 }}></div>
                <div style={{ position: 'absolute', top: '5px', left: '5px', color: '#ff4444', fontSize: '10px', fontWeight: 'bold', fontFamily: "'Share Tech Mono', monospace", animation: 'pulse 1s infinite' }}>● REC</div>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={takeSnapshot} style={{ flex: 1, padding: '8px', background: 'var(--a2)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Capture Snapshot</button>
                <button onClick={() => { takeSnapshot(); setInputText('Analyze this live video stream and report findings.'); setTriggerAction('Analyze this live video stream and report findings.'); }} style={{ flex: 1, padding: '8px', background: 'var(--a3)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Analyze Stream</button>
                <button onClick={stopCapture} style={{ padding: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
