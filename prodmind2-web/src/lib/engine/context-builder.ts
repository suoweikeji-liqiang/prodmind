import type { SupabaseClient } from '@supabase/supabase-js';

export interface SessionState {
  idea: string;
  round: number;
  problem: { version: number; description: string; expected_outcome: string } | null;
  assumptions: { content: string; status: string }[];
  risks: { content: string; probability: string; severity: string }[];
  recentComments: { agent: string; content: string }[];
}

export async function loadSessionState(
  supabase: SupabaseClient,
  sessionId: string,
  round: number,
): Promise<SessionState> {
  const { data: session } = await supabase
    .from('sessions').select('idea, current_round').eq('id', sessionId).single();

  const { data: pd } = await supabase
    .from('problem_definitions').select('version, description, expected_outcome')
    .eq('session_id', sessionId).order('version', { ascending: false }).limit(1);

  const { data: assumptions } = await supabase
    .from('assumptions').select('content, status').eq('session_id', sessionId);

  const { data: risks } = await supabase
    .from('risks').select('content, probability, severity').eq('session_id', sessionId);

  const { data: comments } = await supabase
    .from('agent_comments').select('agent, content')
    .eq('session_id', sessionId).eq('round', round);

  return {
    idea: session?.idea ?? '',
    round: session?.current_round ?? round,
    problem: pd?.[0] ?? null,
    assumptions: assumptions ?? [],
    risks: risks ?? [],
    recentComments: comments ?? [],
  };
}

export function buildAgentContext(state: SessionState): string {
  let ctx = `用户的决策问题：\n${state.idea}\n\n`;

  if (state.problem?.description) {
    ctx += `## 当前问题定义 (v${state.problem.version})\n`;
    ctx += `${state.problem.description}\n`;
    ctx += `期望结果：${state.problem.expected_outcome}\n\n`;
  }

  if (state.assumptions.length) {
    ctx += `## 假设库\n`;
    ctx += state.assumptions.map(a => `- [${a.status}] ${a.content}`).join('\n') + '\n\n';
  }

  if (state.risks.length) {
    ctx += `## 风险库\n`;
    ctx += state.risks.map(r => `- [${r.probability}/${r.severity}] ${r.content}`).join('\n') + '\n\n';
  }

  if (state.recentComments.length) {
    ctx += `## 本轮发言\n`;
    ctx += state.recentComments.map(c => `${c.agent}：${c.content}`).join('\n\n') + '\n\n';
  }

  return ctx;
}
