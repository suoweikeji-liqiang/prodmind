import { create } from 'zustand';
import type { AgentName } from '@/types';

export interface AgentComment {
  round: number;
  agent: AgentName;
  content: string;
}

interface SessionStore {
  sessionId: string | null;
  round: number;
  confidenceIndex: number;
  agentComments: AgentComment[];
  activeAgent: AgentName | null;
  streaming: Map<AgentName, string>;
  scheduledAgents: AgentName[];
  isRunning: boolean;

  setSession: (id: string) => void;
  setRunning: (v: boolean) => void;
  onAgentsScheduled: (agents: AgentName[], round: number) => void;
  onRoleStart: (agent: AgentName) => void;
  onToken: (agent: AgentName, token: string) => void;
  onRoleComplete: (agent: AgentName) => void;
  onStateUpdate: (ci: number) => void;
  onDone: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessionId: null,
  round: 0,
  confidenceIndex: 0,
  agentComments: [],
  activeAgent: null,
  streaming: new Map(),
  scheduledAgents: [],
  isRunning: false,

  setSession: (id) => set({ sessionId: id }),
  setRunning: (v) => set({ isRunning: v }),

  onAgentsScheduled: (agents, round) => set({
    scheduledAgents: agents,
    round,
    streaming: new Map(),
  }),

  onRoleStart: (agent) => set((s) => {
    const m = new Map(s.streaming);
    m.set(agent, '');
    return { activeAgent: agent, streaming: m };
  }),

  onToken: (agent, token) => set((s) => {
    const m = new Map(s.streaming);
    m.set(agent, (m.get(agent) ?? '') + token);
    return { streaming: m };
  }),

  onRoleComplete: (agent) => set((s) => {
    const full = s.streaming.get(agent) ?? '';
    return {
      activeAgent: null,
      agentComments: [...s.agentComments, { round: s.round, agent, content: full }],
    };
  }),

  onStateUpdate: (ci) => set({ confidenceIndex: ci }),

  onDone: () => set({ isRunning: false, activeAgent: null, scheduledAgents: [] }),
}));
