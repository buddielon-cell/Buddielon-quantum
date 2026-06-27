export interface Agent {
  id: string;
  name: string;
  type: string;
  short: string;
  color: string;
  avClass: string;
  task: string;
}

export interface Session {
  id: string;
  name: string;
  created: string;
  history: Message[];
  messages: number;
  exp: string;
  updatedAt?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
  agent?: Agent;
  timestamp?: string;
  badge?: string;
}

export interface AttachedFile {
  name: string;
  type: string;
  data: string;
  kind: 'image' | 'pdf' | 'text';
}

export interface ApiConfig {
  provider: string;
  keys: Record<string, string>;
  models: Record<string, string>;
}
