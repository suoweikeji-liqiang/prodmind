import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

const PRODMIND_DIR = path.join(os.homedir(), '.prodmind');
const SESSIONS_DIR = path.join(PRODMIND_DIR, 'sessions');
const CONFIG_PATH = path.join(PRODMIND_DIR, 'config.json');

function ensureDirs(): void {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// ── Config ──

export interface ProdMindConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export function getConfig(): ProdMindConfig {
  ensureDirs();
  if (!fs.existsSync(CONFIG_PATH)) {
    return { apiKey: '' };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

export function saveConfig(config: ProdMindConfig): void {
  ensureDirs();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function isConfigured(): boolean {
  const config = getConfig();
  return !!config.apiKey;
}

// ── Session ──

export interface GrounderOutput {
  hypotheses: string;
  mvpBoundary: string;
  raw: string;
}

export interface Round {
  round: number;
  architect: string;
  userConfirm: string;
  assassin: string;
  userGhost: string;
  userResponse: string;
  grounder: GrounderOutput;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  rounds: Round[];
  finalOutput: GrounderOutput | null;
}

export function createSession(title: string): Session {
  return {
    id: randomUUID().slice(0, 8),
    title: title.slice(0, 20),
    createdAt: new Date().toISOString(),
    rounds: [],
    finalOutput: null,
  };
}

export function saveSession(session: Session): void {
  ensureDirs();
  const filename = `${session.createdAt.slice(0, 10)}-${session.id}.json`;
  const filepath = path.join(SESSIONS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(session, null, 2), 'utf-8');
}

export function listSessions(): { id: string; title: string; createdAt: string; rounds: number; file: string }[] {
  ensureDirs();
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const content = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8')) as Session;
    return {
      id: content.id,
      title: content.title,
      createdAt: content.createdAt,
      rounds: content.rounds.length,
      file,
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function loadSession(sessionId: string): Session | null {
  ensureDirs();
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8')) as Session;
    if (content.id === sessionId) {
      return content;
    }
  }
  return null;
}
