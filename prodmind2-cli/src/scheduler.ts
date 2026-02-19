import type { DecisionStateTree } from './storage.js';
import type { AgentName } from './roles/index.js';

export function getActiveAgents(tree: DecisionStateTree, round: number): AgentName[] {
  const agents: AgentName[] = [];

  // 问题澄清官：首轮或问题未定义时
  if (round <= 1 || !tree.problem.description) {
    agents.push('problem-architect');
  }

  // 批判官：假设未验证比例 > 50%
  const unvalidated = tree.assumptions.filter(a => a.status === 'unvalidated').length;
  const total = tree.assumptions.length;
  if (total > 0 && unvalidated / total > 0.5) {
    agents.push('critical-examiner');
  }

  // 系统分析官：有多个假设或风险时
  if (tree.assumptions.length >= 3 || tree.risks.length >= 2) {
    agents.push('system-mapper');
  }

  // 反对者代理：每轮必触发
  agents.push('devils-advocate');

  // 风险官：高风险存在时
  const highRisks = tree.risks.filter(r => r.probability === 'high' || r.severity === 'high').length;
  if (highRisks > 0) {
    agents.push('risk-architect');
  }

  // 长期价值官：第3轮及以后
  if (round >= 3) {
    agents.push('strategic-evaluator');
  }

  return [...new Set(agents)];
}
