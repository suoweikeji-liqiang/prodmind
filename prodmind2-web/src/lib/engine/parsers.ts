export function parseAssumptions(output: string): string[] {
  const section = output.match(/##\s*隐含假设[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
  if (!section) return [];
  return section[1]
    .split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^[-\s]*/, '').trim())
    .filter(Boolean);
}

export function parseRisks(output: string): { content: string; prob: 'high' | 'medium' | 'low'; sev: 'high' | 'medium' | 'low' }[] {
  const section = output.match(/##\s*(?:失败路径|风险集中度|最坏情境)[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
  if (!section) return [];
  return section[1]
    .split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => ({
      content: l.replace(/^[-\s]*/, '').trim(),
      prob: 'medium' as const,
      sev: 'medium' as const,
    }))
    .filter(r => r.content);
}

export function parseProblem(output: string): { description: string; expected: string } | null {
  const coreMatch = output.match(/##\s*核心问题[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
  if (!coreMatch) return null;
  const expectedMatch = output.match(/##\s*期望结果[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
  return {
    description: coreMatch[1].trim().split('\n')[0].replace(/^[-\s]*/, ''),
    expected: expectedMatch ? expectedMatch[1].trim().split('\n')[0].replace(/^[-\s]*/, '') : '',
  };
}

export function parseUnverifiedAssumptions(output: string): string[] {
  const section = output.match(/##\s*未验证假设[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
  if (!section) return [];
  return section[1]
    .split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^[-\s]*/, '').trim())
    .filter(Boolean);
}
