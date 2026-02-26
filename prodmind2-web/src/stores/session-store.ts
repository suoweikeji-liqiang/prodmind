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
  streaming: Record<string, string>;
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
  streaming: {},
  scheduledAgents: [],
  isRunning: false,

  setSession: (id) => set({ sessionId: id }),
  setRunning: (v) => set({ isRunning: v }),

  onAgentsScheduled: (agents, round) => set({
    scheduledAgents: agents,
    round,
    streaming: {},
  }),

  onRoleStart: (agent) => set((s) => ({
    activeAgent: agent,
    streaming: { ...s.streaming, [agent]: '' },
  })),

  onToken: (agent, token) => set((s) => ({
    streaming: { ...s.streaming, [agent]: (s.streaming[agent] ?? '') + token },
  })),

  onRoleComplete: (agent) => set((s) => ({
    activeAgent: null,
    agentComments: [...s.agentComments, { round: s.round, agent, content: s.streaming[agent] ?? '' }],
  })),

  onStateUpdate: (ci) => set({ confidenceIndex: ci }),

  onDone: () => set({ isRunning: false, activeAgent: null, scheduledAgents: [] }),
}));
