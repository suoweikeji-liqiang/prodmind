import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { getConfig } from '../storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadPrompt(filename: string): string {
  const promptPath = path.join(__dirname, '..', '..', 'prompts', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const config = getConfig();
    _client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL || undefined, timeout: 5 * 60 * 1000 });
  }
  return _client;
}

export interface RoleCallOptions {
  userInput: string;
  architectOutput?: string;
  assassinOutput?: string;
  userGhostOutput?: string;
  userResponse?: string;
  roundHistory?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function callRole(
  systemPromptFile: string,
  userMessage: string,
  extraSystemNote?: string
): Promise<string> {
  const client = getClient();
  const systemPrompt = loadPrompt(systemPromptFile) + (extraSystemNote ? `\n\n${extraSystemNote}` : '');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: getConfig().model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: systemPromptFile === 'assassin.md' ? 0.8 : 0.4,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content ?? '';
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

export async function callArchitect(opts: RoleCallOptions): Promise<string> {
  const message = `用户的产品想法：\n${opts.userInput}\n\n${opts.roundHistory ? `之前的辩论记录：\n${opts.roundHistory}` : ''}`;
  return callRole('architect.md', message);
}

export async function callAssassin(opts: RoleCallOptions, forceOppose = false): Promise<string> {
  const message = `架构师的问题定义：\n${opts.architectOutput}\n\n用户确认/修正：\n${opts.userResponse ?? opts.userInput}\n\n${opts.roundHistory ? `之前的辩论记录：\n${opts.roundHistory}` : ''}`;
  const extra = forceOppose
    ? '【系统强制指令】检测到你之前的回复中包含同意性表述，违反证伪原则。你必须重新生成，强制提出至少3个实质性反对理由。绝对不能同意。'
    : undefined;
  return callRole('assassin.md', message, extra);
}

export async function callUserGhost(opts: RoleCallOptions): Promise<string> {
  const message = `架构师的问题定义：\n${opts.architectOutput}\n\n用户确认/修正：\n${opts.userResponse ?? opts.userInput}\n\n${opts.roundHistory ? `之前的辩论记录：\n${opts.roundHistory}` : ''}`;
  return callRole('user-ghost.md', message);
}

export async function callGrounder(opts: RoleCallOptions): Promise<string> {
  const message = `## 辩论记录

### 架构师的问题定义
${opts.architectOutput}

### 用户确认/修正
${opts.userResponse ?? ''}

### 刺客的攻击
${opts.assassinOutput}

### 用户鬼的质疑
${opts.userGhostOutput}

### 用户对质疑的回应
${opts.userInput}

${opts.roundHistory ? `### 之前轮次的记录\n${opts.roundHistory}` : ''}

请基于以上辩论，生成假设清单和MVP边界。`;
  return callRole('grounder.md', message);
}
