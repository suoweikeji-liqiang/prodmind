export type AgentName =
  | 'problem-architect'
  | 'critical-examiner'
  | 'system-mapper'
  | 'devils-advocate'
  | 'risk-architect'
  | 'strategic-evaluator';

export const AGENT_CONFIG: Record<AgentName, {
  icon: string; label: string; color: string;
  bgClass: string; textClass: string; borderClass: string;
}> = {
  'problem-architect':    { icon: 'Building2',   label: '问题澄清官', color: 'blue',    bgClass: 'bg-blue-50',    textClass: 'text-blue-700',    borderClass: 'border-blue-200' },
  'critical-examiner':    { icon: 'Search',      label: '批判官',     color: 'amber',   bgClass: 'bg-amber-50',   textClass: 'text-amber-700',   borderClass: 'border-amber-200' },
  'system-mapper':        { icon: 'Network',     label: '系统分析官', color: 'cyan',    bgClass: 'bg-cyan-50',    textClass: 'text-cyan-700',    borderClass: 'border-cyan-200' },
  'devils-advocate':      { icon: 'Swords',      label: '反对者代理', color: 'red',     bgClass: 'bg-red-50',     textClass: 'text-red-700',     borderClass: 'border-red-200' },
  'risk-architect':       { icon: 'Shield',      label: '风险官',     color: 'purple',  bgClass: 'bg-purple-50',  textClass: 'text-purple-700',  borderClass: 'border-purple-200' },
  'strategic-evaluator':  { icon: 'TrendingUp',  label: '长期价值官', color: 'emerald', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', borderClass: 'border-emerald-200' },
};

export const ALL_AGENTS: AgentName[] = [
  'problem-architect', 'critical-examiner', 'system-mapper',
  'devils-advocate', 'risk-architect', 'strategic-evaluator',
];
