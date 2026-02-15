/**
 * Streaming role calls — ported from CLI roles/index.ts
 * Uses async generators to yield tokens for SSE streaming.
 */

import OpenAI from "openai";
import { loadPrompt } from "@/lib/prompts";
import { getAppConfig } from "@/lib/config";
import type { RoleCallOptions } from "@/types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function getClient(): Promise<OpenAI> {
  const cfg = await getAppConfig();
  return new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL || undefined,
    timeout: 5 * 60 * 1000,
  });
}

async function* callRoleStream(
  systemPromptFile: string,
  userMessage: string,
  extraSystemNote?: string
): AsyncGenerator<string, string, undefined> {
  const client = await getClient();
  const cfg = await getAppConfig();
  const systemPrompt = loadPrompt(systemPromptFile) + (extraSystemNote ? `\n\n${extraSystemNote}` : "");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const stream = await client.chat.completions.create({
        model: cfg.model || "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: systemPromptFile === "assassin.md" ? 0.8 : 0.4,
        max_tokens: 2000,
        stream: true,
      });

      let full = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          full += delta;
          yield delta;
        }
      }
      return full;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        attempt < MAX_RETRIES &&
        (msg.includes("Premature close") || msg.includes("ECONNRESET") || msg.includes("timeout"))
      ) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }
  return "";
}

// Non-streaming fallback for retries
async function callRole(
  systemPromptFile: string,
  userMessage: string,
  extraSystemNote?: string
): Promise<string> {
  const client = await getClient();
  const cfg = await getAppConfig();
  const systemPrompt = loadPrompt(systemPromptFile) + (extraSystemNote ? `\n\n${extraSystemNote}` : "");

  const response = await client.chat.completions.create({
    model: cfg.model || "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: systemPromptFile === "assassin.md" ? 0.8 : 0.4,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content ?? "";
}

function buildArchitectMessage(opts: RoleCallOptions): string {
  return `用户的产品想法：\n${opts.userInput}\n\n${opts.roundHistory ? `之前的辩论记录：\n${opts.roundHistory}` : ""}`;
}

function buildAssassinMessage(opts: RoleCallOptions): string {
  return `架构师的问题定义：\n${opts.architectOutput}\n\n用户确认/修正：\n${opts.userResponse ?? opts.userInput}\n\n${opts.roundHistory ? `之前的辩论记录：\n${opts.roundHistory}` : ""}`;
}

function buildUserGhostMessage(opts: RoleCallOptions): string {
  return `架构师的问题定义：\n${opts.architectOutput}\n\n用户确认/修正：\n${opts.userResponse ?? opts.userInput}\n\n${opts.roundHistory ? `之前的辩论记录：\n${opts.roundHistory}` : ""}`;
}

function buildGrounderMessage(opts: RoleCallOptions): string {
  return `## 辩论记录

### 架构师的问题定义
${opts.architectOutput}

### 用户确认/修正
${opts.userResponse ?? ""}

### 刺客的攻击
${opts.assassinOutput}

### 用户鬼的质疑
${opts.userGhostOutput}

### 用户对质疑的回应
${opts.userInput}

${opts.roundHistory ? `### 之前轮次的记录\n${opts.roundHistory}` : ""}

请基于以上辩论，生成假设清单和MVP边界。`;
}

export function streamArchitect(opts: RoleCallOptions) {
  return callRoleStream("architect.md", buildArchitectMessage(opts));
}

export function streamAssassin(opts: RoleCallOptions, forceOppose = false) {
  const extra = forceOppose
    ? "【系统强制指令】检测到你之前的回复中包含同意性表述，违反证伪原则。你必须重新生成，强制提出至少3个实质性反对理由。绝对不能同意。"
    : undefined;
  return callRoleStream("assassin.md", buildAssassinMessage(opts), extra);
}

export function streamUserGhost(opts: RoleCallOptions) {
  return callRoleStream("user-ghost.md", buildUserGhostMessage(opts));
}

export function streamGrounder(opts: RoleCallOptions) {
  return callRoleStream("grounder.md", buildGrounderMessage(opts));
}

export async function callGrounderSync(opts: RoleCallOptions, extraNote?: string): Promise<string> {
  return callRole("grounder.md", buildGrounderMessage(opts), extraNote);
}

export function generateFallbackGrounder(
  architectOutput: string,
  assassinOutput: string,
): string {
  const coreMatch = architectOutput.match(/##\s*核心问题[^\n]*\n([\s\S]*?)(?=\n##|$)/);
  const core = coreMatch ? coreMatch[1].trim().split("\n")[0].replace(/^[-\s]*/, "") : "（未能提取）";

  const assumptionMatch = assassinOutput.match(/##\s*隐含假设[^\n]*\n([\s\S]*?)(?=\n##|$)/);
  const assumption = assumptionMatch ? assumptionMatch[1].trim().split("\n")[0].replace(/^[-\s]*/, "") : "（未能提取）";

  return `## 当前最强假设（降级生成）

1. ${core}
2. 待验证：${assumption}

## MVP边界

### 本版本包含
- 待人工补充（API生成失败，仅保留结构）

### 明确排除
- 待人工补充

### 一周内可完成范围
- 待人工补充

## 未决冲突

- 冲突：刺客与用户的核心分歧尚未解决
- 争议点：${assumption}
- 下一步证伪：需要用户提供具体数据或案例

## 本轮证伪检查

当前最重要假设：${core}
如果我是错的，最可能因为什么？需求本身不成立
验证这个假设的最小动作是什么？对5个目标用户做快速访谈

⚠ 注意：本输出为API失败后的降级生成，信息密度较低，建议下一轮重新收敛。`;
}
