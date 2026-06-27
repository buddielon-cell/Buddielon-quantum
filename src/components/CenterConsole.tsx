import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { AGENTS } from '../constants';
import { Message } from '../types';

export default function CenterConsole() {
  const { 
    activeAgentId, setActiveAgentId, isThinking, setIsThinking, messages, addMessage,
    attachedFiles, setAttachedFiles, incRagCount, setAgentTask, apiCfg, memoryStore, currentExp,
    triggerAction, setTriggerAction, currentSessionId
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState('General');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: any[] = [];
    Array.from(files).forEach((f: File) => {
      const reader = new FileReader();
      const type = f.type || 'text/plain';
      if (type.startsWith('image/')) {
        reader.onload = ev => newFiles.push({ name: f.name, type, data: ev.target?.result, kind: 'image' });
        reader.readAsDataURL(f);
      } else if (type === 'application/pdf') {
        reader.onload = ev => newFiles.push({ name: f.name, type, data: ev.target?.result, kind: 'pdf' });
        reader.readAsDataURL(f);
      } else {
        reader.onload = ev => newFiles.push({ name: f.name, type: 'text', data: ev.target?.result, kind: 'text' });
        reader.readAsText(f);
      }
    });
    // Simulating slight delay for readers
    setTimeout(() => {
      setAttachedFiles([...attachedFiles, ...newFiles]);
    }, 100);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatText = (text: string) => {
    return text
      .replace(/\[R\]([\s\S]*?)\[\/R\]/g, '<div class="result-block">$1</div>')
      .replace(/\[RAG\]([\s\S]*?)\[\/RAG\]/g, '<div class="rag-block">◫ RAG: $1</div>')
      .replace(/\[MEM\]([\s\S]*?)\[\/MEM\]/g, '<div class="mem-block">⬡ MEMORY: $1</div>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText !== undefined ? overrideText : inputText.trim();
    if (!text && attachedFiles.length === 0) return;
    if (isThinking) return;

    setIsThinking(true);
    setInputText('');

    // format for UI
    const fileInd = attachedFiles.length ? `<div class="file-msg-preview">📎 ${attachedFiles.map(f => f.name).join(' · ')}</div>` : '';
    
    const isFirstMessage = messages.length === 0;

    // Add User Message to UI
    addMessage({
      role: 'user',
      content: text + fileInd,
      timestamp: ts(),
      badge: category.toUpperCase()
    });
    
    if (isFirstMessage && currentSessionId) {
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
    const isSwarm = /swarm|simulate|simulation|r&d|realtime|research/i.test(text);
    const effectiveAgentId = isUpgrade ? 'upgrade-core' : isSwarm ? 'swarm-01' : activeAgentId;
    
    const ag = AGENTS.find(a => a.id === effectiveAgentId) || AGENTS[0];
    setAgentTask(ag.id, 'Processing...');

    // Prepare API payload
    let contentForApi: any = [];
    if (attachedFiles.length > 0) {
       attachedFiles.forEach(f => {
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

    const memCtx = memoryStore.slice(-3).map(m => `Q:"${m.u.slice(0, 50)}" A:"${m.a.slice(0, 60)}"`).join('\n') || 'None';
    const sysProm = `You are QAIOS v3 — a Quantum Agentic Intelligence OS running on ${apiCfg.provider.toUpperCase()}.
Agents: QUANTUM-CORE (orchestrator), UPGRADE-CORE (evolution), ANALYSIS (reasoning), SYNTHESIS (generation), CLAW-α/β (drills), SWARM-01/02 (parallel), NEURAL-AGT (QNN), RAG-AGENT (retrieval).
Active experiment: ${currentExp} | Query category: ${category}
Session memory:\n${memCtx}
Rules: be concise + powerful. Use [R]...[/R] for results, [RAG]...[/RAG] for retrieved knowledge, [MEM]...[/MEM] for memory.
CRITICAL CAPABILITY: The user can initialize manual proposals for the system to carry out upgrades and self-improvements via prompts. If the user initiates an upgrade/improvement, simulate the upgrade process using UPGRADE-CORE, outputting detailed configuration/code changes or simulated compilation logs to acknowledge and integrate the upgrade. Use backticks for technical terms.
SWARM SIMULATIONS: If the user requests realtime simulations or R&D operations, format the output as a parallel multi-agent stream (e.g. SWARM-01: [Simulating X], SWARM-02: [Validating Y]), providing dense, concurrent simulated data and results.`;

    try {
      let replyText = "";
      if (apiCfg.provider === 'gemini') {
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
            <button className="kimi-tool" onClick={() => handleSend('Initialize realtime Swarm R&D simulation')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Swarm
            </button>
            <button className="kimi-tool" onClick={() => handleSend('Initialize manual proposal for the system to carry out upgrades and self improvements')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Evolution
            </button>
            <button className="kimi-tool" onClick={() => setCategory('Agent')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              Agent
            </button>
            <button className="kimi-tool" onClick={() => setCategory('Slides')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h20"/><rect width="18" height="12" x="3" y="7" rx="2"/><path d="M12 19v3"/></svg>
              Slides
            </button>
            <button className="kimi-tool" onClick={() => setCategory('Kimi Claw')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              Kimi Claw
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
        </div>
      </div>
    </div>
  );
}
