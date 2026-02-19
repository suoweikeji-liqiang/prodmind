import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

const PRODMIND_DIR = path.join(os.homedir(), '.prodmind2');
const SESSIONS_DIR = path.join(PRODMIND_DIR, 'sessions');
const CONFIG_PATH = path.join(PRODMIND_DIR, 'config.json');

function ensureDirs(): void {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// ── Config ──

export interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel: string;
}

export interface AgentRouting {
  provider: string;
  model?: string; // 不填则用该 provider 的 defaultModel
}

export interface ProdMindConfig {
  providers: Record<string, ProviderConfig>;
  defaultProvider: string;
  agentRouting?: Partial<Record<string, AgentRouting>>;
}

export function getConfig(): ProdMindConfig {
  ensureDirs();
  if (!fs.existsSync(CONFIG_PATH)) return { providers: {}, defaultProvider: '' };
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

export function saveConfig(config: ProdMindConfig): void {
  ensureDirs();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function isConfigured(): boolean {
  const c = getConfig();
  return !!c.providers[c.defaultProvider]?.apiKey;
}

export function resolveAgent(agent: string): { apiKey: string; baseURL?: string; model: string } {
  const config = getConfig();
  const routing = config.agentRouting?.[agent];
  const providerName = routing?.provider ?? config.defaultProvider;
  const provider = config.providers[providerName];
  if (!provider) throw new Error(`Provider "${providerName}" 未配置`);
  return {
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    model: routing?.model ?? provider.defaultModel,
  };
}

// ── Data Types ──

export interface Assumption {
  id: string;
  content: string;
  status: 'validated' | 'unvalidated' | 'rejected';
  source: string;
}

export interface Risk {
  id: string;
  content: string;
  probability: 'high' | 'medium' | 'low';
  severity: 'high' | 'medium' | 'low';
}

export interface SimulationPath {
  id: string;
  label: string;
  steps: string[];
  outcome: string;
}

export interface ProblemDefinition {
  version: number;
  description: string;
  expectedOutcome: string;
  constraints: string[];
  irreversibleCosts: string[];
}

export interface DecisionStateTree {
  problem: ProblemDefinition;
  assumptions: Assumption[];
  risks: Risk[];
  simulationPaths: SimulationPath[];
  confidenceIndex: number;
}

export interface AgentComment {
  round: number;
  agent: string;
  content: string;
  timestamp: string;
}

export interface DecisionSnapshot {
  version: number;
  timestamp: string;
  stateTree: DecisionStateTree;
  humanJudgment: string;
  trigger: string;
}

export interface DecisionSession {
  id: string;
  title: string;
  createdAt: string;
  stateTree: DecisionStateTree;
  snapshots: DecisionSnapshot[];
  agentComments: AgentComment[];
  currentRound: number;
}

// ── Session CRUD ──

export function createEmptyStateTree(): DecisionStateTree {
  return {
    problem: { version: 0, description: '', expectedOutcome: '', constraints: [], irreversibleCosts: [] },
    assumptions: [],
    risks: [],
    simulationPaths: [],
    confidenceIndex: 0,
  };
}

export function createSession(title: string): DecisionSession {
  return {
    id: randomUUID().slice(0, 8),
    title: title.slice(0, 30),
    createdAt: new Date().toISOString(),
    stateTree: createEmptyStateTree(),
    snapshots: [],
    agentComments: [],
    currentRound: 0,
  };
}

export function saveSession(session: DecisionSession): void {
  ensureDirs();
  const filename = `${session.createdAt.slice(0, 10)}-${session.id}.json`;
  fs.writeFileSync(path.join(SESSIONS_DIR, filename), JSON.stringify(session, null, 2), 'utf-8');
}

export function listSessions(): { id: string; title: string; createdAt: string; rounds: number }[] {
  ensureDirs();
  return fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(file => {
      const s = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8')) as DecisionSession;
      return { id: s.id, title: s.title, createdAt: s.createdAt, rounds: s.currentRound };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function loadSession(sessionId: string): DecisionSession | null {
  ensureDirs();
  for (const file of fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'))) {
    const s = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8')) as DecisionSession;
    if (s.id === sessionId) return s;
  }
  return null;
}
