import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Agent, Session, Message, AttachedFile, ApiConfig } from './types';
import { AGENTS, QSTATES } from './constants';

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface AppState {
  currentView: string;
  setCurrentView: (v: string) => void;
  currentExp: string;
  setCurrentExp: (exp: string) => void;
  activeAgentId: string;
  setActiveAgentId: (id: string) => void;
  agentTasks: Record<string, string>;
  setAgentTask: (id: string, task: string) => void;
  apiCfg: ApiConfig;
  setApiCfg: (cfg: Partial<ApiConfig>) => void;
  sessions: Session[];
  currentSessionId: string | null;
  addSession: (session: Session) => void;
  removeSession: (id: string) => void;
  setCurrentSessionId: (id: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  messages: Message[];
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  queuedMessages: string[];
  addQueuedMessage: (msg: string) => void;
  clearQueuedMessages: () => void;
  isThinking: boolean;
  setIsThinking: (val: boolean) => void;
  memoryStore: { u: string; a: string }[];
  addMemory: (u: string, a: string) => void;
  ragCount: number;
  incRagCount: () => void;
  fileCount: number;
  incFileCount: (n: number) => void;
  attachedFiles: AttachedFile[];
  setAttachedFiles: (files: AttachedFile[]) => void;
  qubitData: any[];
  setQubitData: (data: any[]) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  triggerAction: string | null;
  setTriggerAction: (val: string | null) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  liveNews: any[];
  setLiveNews: (news: any[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'chat',
      setCurrentView: (v) => set({ currentView: v }),
      currentExp: 'superposition',
      setCurrentExp: (exp) => set({ currentExp: exp }),
      activeAgentId: 'quantum-core',
      setActiveAgentId: (id) => set({ activeAgentId: id }),
      agentTasks: Object.fromEntries(AGENTS.map((a) => [a.id, a.task])),
      setAgentTask: (id, task) => set((state) => ({ agentTasks: { ...state.agentTasks, [id]: task } })),
      apiCfg: {
        provider: 'gemini',
        keys: { openrouter: '', openai: '', groq: '', together: '', cohere: '' },
        models: {
          gemini: 'gemini-2.5-flash',
          anthropic: 'claude-sonnet-4-6',
          openrouter: 'mistralai/mistral-7b-instruct:free',
          openai: 'gpt-4o-mini',
          groq: 'llama-3.3-70b-versatile',
          together: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
          cohere: 'command-r-plus',
        },
      },
      setApiCfg: (cfg) => set((state) => ({ apiCfg: { ...state.apiCfg, ...cfg } })),
      sessions: [],
      currentSessionId: null,
      addSession: (s) => set((state) => ({ sessions: [...state.sessions, s], currentSessionId: s.id, messages: [] })),
      removeSession: (id) => set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
      })),
      setCurrentSessionId: (id) => set((state) => {
        const sess = state.sessions.find(s => s.id === id);
        return { currentSessionId: id, messages: sess ? sess.history : [] };
      }),
      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),
      messages: [],
      addMessage: (msg) => set((state) => {
        const newMessages = [...state.messages, msg];
        return {
          messages: newMessages,
          sessions: state.sessions.map(s =>
            s.id === state.currentSessionId ? { ...s, history: newMessages, messages: newMessages.length, updatedAt: Date.now() } : s
          )
        };
      }),
      setMessages: (msgs) => set((state) => ({
        messages: msgs,
        sessions: state.sessions.map(s =>
          s.id === state.currentSessionId ? { ...s, history: msgs, messages: msgs.length, updatedAt: Date.now() } : s
        )
      })),
      queuedMessages: [],
      addQueuedMessage: (msg) => set((state) => ({ queuedMessages: [...state.queuedMessages, msg] })),
      clearQueuedMessages: () => set({ queuedMessages: [] }),
      isThinking: false,
      setIsThinking: (val) => set({ isThinking: val }),
      memoryStore: [],
      addMemory: (u, a) => set((state) => {
        const mem = [...state.memoryStore, { u, a }];
        if (mem.length > 50) mem.shift();
        return { memoryStore: mem };
      }),
      ragCount: 0,
      incRagCount: () => set((state) => ({ ragCount: state.ragCount + 1 })),
      fileCount: 0,
      incFileCount: (n) => set((state) => ({ fileCount: state.fileCount + n })),
      attachedFiles: [],
      setAttachedFiles: (files) => set({ attachedFiles: files }),
      qubitData: Array.from({ length: 12 }, (_, i) => ({
        id: 'Q' + i,
        state: QSTATES[i % 4],
        ent: i > 7,
        active: i < 4,
      })),
      setQubitData: (data) => set({ qubitData: data }),
      isModalOpen: false,
      setIsModalOpen: (val) => set({ isModalOpen: val }),
      triggerAction: null,
      setTriggerAction: (val) => set({ triggerAction: val }),
      isOffline: !navigator.onLine,
      setIsOffline: (val) => set({ isOffline: val }),
      liveNews: [],
      setLiveNews: (news) => set({ liveNews: news })
    }),
    {
      name: 'claw-ai-store',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        currentExp: state.currentExp,
        apiCfg: state.apiCfg,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        messages: state.messages,
        memoryStore: state.memoryStore,
        ragCount: state.ragCount,
        fileCount: state.fileCount,
        queuedMessages: state.queuedMessages,
      }),
    }
  )
);
