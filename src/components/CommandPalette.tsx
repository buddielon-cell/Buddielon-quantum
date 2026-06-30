import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { AGENTS } from '../constants';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { 
    activeAgentId, setActiveAgentId, 
    isOffline, setIsOffline, 
    setMessages, setCurrentView
  } = useAppStore();
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const commands = [
    {
      id: 'toggle-offline',
      title: isOffline ? 'Go Online' : 'Go Offline',
      description: 'Toggle the system offline mode',
      action: () => setIsOffline(!isOffline),
    },
    {
      id: 'clear-history',
      title: 'Clear History',
      description: 'Clear the current conversation history',
      action: () => setMessages([]),
    },
    {
      id: 'toggle-surveillance',
      title: 'Toggle World Surveillance Agent',
      description: 'Activate global event monitoring and geopolitical risk analysis',
      action: () => setActiveAgentId('surveil'),
    },
    {
      id: 'open-drones',
      title: 'Drone Fleet Management',
      description: 'Open the Drone Fleet Telemetry and Mission Logs view',
      action: () => setCurrentView('drones'),
    },
    ...AGENTS.map((agent) => ({
      id: `switch-agent-${agent.id}`,
      title: `Switch to ${agent.name}`,
      description: `Type: ${agent.type} | ${agent.task}`,
      action: () => setActiveAgentId(agent.id),
    })),
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) || 
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-header">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="command-palette-input"
          />
        </div>
        <div className="command-palette-list">
          {filteredCommands.length === 0 && (
            <div className="command-palette-empty">No commands found.</div>
          )}
          {filteredCommands.map((cmd, idx) => (
            <div
              key={cmd.id}
              className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                cmd.action();
                setIsOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="command-palette-item-title">{cmd.title}</div>
              <div className="command-palette-item-desc">{cmd.description}</div>
            </div>
          ))}
        </div>
        <div className="command-palette-footer">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
