import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentName } from '@/types';
import { getActiveAgents } from './scheduler';
import { loadSessionState, buildAgentContext } from './context-builder';
import { streamAgent } from './roles';
import { parseAssumptions, parseRisks, parseProblem, parseUnverifiedAssumptions } from './parsers';

export type SSEEvent =
  | { type: 'agents_scheduled'; agents: AgentName[]; round: number }
  | { type: 'role_start'; agent: AgentName }
  | { type: 'token'; agent: AgentName; content: string }
  | { type: 'role_complete'; agent: AgentName }
  | { type: 'state_update'; confidenceIndex: number }
  | { type: 'error'; message: string }
  | { type: 'done' };

export async function* runDebateRound(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): AsyncGenerator<SSEEvent> {
  // bump round
  const { data: session } = await supabase
    .from('sessions').select('current_round').eq('id', sessionId).single();
  const round = (session?.current_round ?? 0) + 1;
  await supabase.from('sessions').update({ current_round: round }).eq('id', sessionId);

  const state = await loadSessionState(supabase, sessionId, round);
  const agents = getActiveAgents(
    {
      problem: { description: state.problem?.description ?? '' },
      assumptions: state.assumptions,
      risks: state.risks,
    },
    round,
  );

  yield { type: 'agents_scheduled', agents, round };

  for (const agent of agents) {
    yield { type: 'role_start', agent };

    const context = buildAgentContext(state);
    let fullOutput = '';

    try {
      const gen = streamAgent(supabase, userId, agent, context);
      while (true) {
        const { value, done } = await gen.next();
        if (done) { fullOutput = value; break; }
        yield { type: 'token', agent, content: value };
        fullOutput += value;
      }
    } catch (err) {
      yield { type: 'error', message: `${agent} 调用失败: ${err instanceof Error ? err.message : String(err)}` };
      continue;
    }

    yield { type: 'role_complete', agent };

    // persist comment
    await supabase.from('agent_comments').insert({
      session_id: sessionId, round, agent, content: fullOutput,
    });

    // extract structured data
    await extractAndPersist(supabase, sessionId, agent, fullOutput);

    // add to state for next agent's context
    state.recentComments.push({ agent, content: fullOutput });
  }

  // recalc confidence
  const ci = await recalcAndUpdate(supabase, sessionId);
  yield { type: 'state_update', confidenceIndex: ci };

  // auto snapshot
  await takeSnapshot(supabase, sessionId, `第${round}轮自动快照`);

  yield { type: 'done' };
}

async function extractAndPersist(
  supabase: SupabaseClient, sessionId: string, agent: AgentName, output: string,
) {
  if (agent === 'problem-architect') {
    const p = parseProblem(output);
    if (p) {
      const { data: existing } = await supabase
        .from('problem_definitions').select('version')
        .eq('session_id', sessionId).order('version', { ascending: false }).limit(1);
      const nextVer = (existing?.[0]?.version ?? 0) + 1;
      await supabase.from('problem_definitions').insert({
        session_id: sessionId, version: nextVer,
        description: p.description, expected_outcome: p.expected,
      });
    }
    for (const a of parseAssumptions(output)) {
      await supabase.from('assumptions').insert({
        session_id: sessionId, content: a, source: agent, status: 'unvalidated',
      });
    }
  }

  if (agent === 'critical-examiner') {
    for (const a of parseUnverifiedAssumptions(output)) {
      await supabase.from('assumptions').insert({
        session_id: sessionId, content: a, source: agent, status: 'unvalidated',
      });
    }
  }

  if (agent === 'devils-advocate' || agent === 'risk-architect') {
    for (const r of parseRisks(output)) {
      await supabase.from('risks').insert({
        session_id: sessionId, content: r.content,
        probability: r.prob, severity: r.sev,
      });
    }
  }
}

async function recalcAndUpdate(supabase: SupabaseClient, sessionId: string): Promise<number> {
  const { data: assumptions } = await supabase
    .from('assumptions').select('status').eq('session_id', sessionId);
  const { data: risks } = await supabase
    .from('risks').select('probability, severity').eq('session_id', sessionId);

  const total = assumptions?.length || 1;
  const validated = assumptions?.filter(a => a.status === 'validated').length ?? 0;
  const ratio = validated / total;
  const highRisks = risks?.filter(r => r.probability === 'high' && r.severity === 'high').length ?? 0;
  const riskExposure = Math.max(0, 1 - highRisks * 0.2);
  const ci = Math.round(ratio * riskExposure * 100);

  await supabase.from('sessions').update({ confidence_index: ci }).eq('id', sessionId);
  return ci;
}

async function takeSnapshot(supabase: SupabaseClient, sessionId: string, trigger: string) {
  const { data: assumptions } = await supabase
    .from('assumptions').select('*').eq('session_id', sessionId);
  const { data: risks } = await supabase
    .from('risks').select('*').eq('session_id', sessionId);
  const { data: pd } = await supabase
    .from('problem_definitions').select('*')
    .eq('session_id', sessionId).order('version', { ascending: false }).limit(1);
  const { data: session } = await supabase
    .from('sessions').select('confidence_index').eq('id', sessionId).single();

  const { data: existing } = await supabase
    .from('snapshots').select('version')
    .eq('session_id', sessionId).order('version', { ascending: false }).limit(1);
  const nextVer = (existing?.[0]?.version ?? 0) + 1;

  await supabase.from('snapshots').insert({
    session_id: sessionId,
    version: nextVer,
    trigger,
    state_tree: {
      problem: pd?.[0] ?? null,
      assumptions: assumptions ?? [],
      risks: risks ?? [],
      confidenceIndex: session?.confidence_index ?? 0,
    },
  });
}
