import type { AgentName } from '@/types';

interface StateForScheduling {
  problem: { description: string };
  assumptions: { status: string }[];
  risks: { probability: string; severity: string }[];
}

export function getActiveAgents(state: StateForScheduling, round: number): AgentName[] {
  const agents: AgentName[] = [];

  if (round <= 1 || !state.problem.description) {
    agents.push('problem-architect');
  }

  const unvalidated = state.assumptions.filter(a => a.status === 'unvalidated').length;
  const total = state.assumptions.length;
  if (total > 0 && unvalidated / total > 0.5) {
    agents.push('critical-examiner');
  }

  if (state.assumptions.length >= 3 || state.risks.length >= 2) {
    agents.push('system-mapper');
  }

  agents.push('devils-advocate');

  if (state.risks.filter(r => r.probability === 'high' || r.severity === 'high').length > 0) {
    agents.push('risk-architect');
  }

  if (round >= 3) {
    agents.push('strategic-evaluator');
  }

  return [...new Set(agents)];
}
