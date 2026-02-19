import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { resolveAgent } from '../storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadPrompt(filename: string): string {
  return fs.readFileSync(path.join(__dirname, '..', '..', 'prompts', filename), 'utf-8');
}

const _clients = new Map<string, OpenAI>();

function getClient(apiKey: string, baseURL?: string): OpenAI {
  const key = `${apiKey}|${baseURL ?? ''}`;
  if (!_clients.has(key)) {
    _clients.set(key, new OpenAI({ apiKey, baseURL: baseURL || undefined, timeout: 5 * 60 * 1000 }));
  }
  return _clients.get(key)!;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function callRole(agent: AgentName, promptFile: string, userMessage: string, temperature = 0.4): Promise<string> {
  const { apiKey, baseURL, model } = resolveAgent(agent);
  const client = getClient(apiKey, baseURL);
  const systemPrompt = loadPrompt(promptFile);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature,
        max_tokens: 2000,
      });
      return res.choices[0]?.message?.content ?? '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRIES && (msg.includes('Premature close') || msg.includes('ECONNRESET') || msg.includes('timeout'))) {
        console.log(`  ⚠ API 请求失败（${msg}），${RETRY_DELAY_MS / 1000}秒后重试（${attempt}/${MAX_RETRIES}）...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }
  return '';
}

export type AgentName = 'problem-architect' | 'critical-examiner' | 'system-mapper' | 'devils-advocate' | 'risk-architect' | 'strategic-evaluator';

const PROMPT_FILES: Record<AgentName, string> = {
  'problem-architect': 'problem-architect.md',
  'critical-examiner': 'critical-examiner.md',
  'system-mapper': 'system-mapper.md',
  'devils-advocate': 'devils-advocate.md',
  'risk-architect': 'risk-architect.md',
  'strategic-evaluator': 'strategic-evaluator.md',
};

const TEMPERATURES: Partial<Record<AgentName, number>> = {
  'devils-advocate': 0.8,
};

export async function callAgent(agent: AgentName, context: string): Promise<string> {
  const temp = TEMPERATURES[agent] ?? 0.4;
  return callRole(agent, PROMPT_FILES[agent], context, temp);
}
