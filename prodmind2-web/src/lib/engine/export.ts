import type { SupabaseClient } from '@supabase/supabase-js';

export async function exportSessionToMarkdown(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<string> {
  const { data: session } = await supabase
    .from('sessions').select('*').eq('id', sessionId).single();
  if (!session) throw new Error('Session not found');

  const { data: pd } = await supabase
    .from('problem_definitions').select('*')
    .eq('session_id', sessionId).order('version', { ascending: false }).limit(1);

  const { data: assumptions } = await supabase
    .from('assumptions').select('*').eq('session_id', sessionId);

  const { data: risks } = await supabase
    .from('risks').select('*').eq('session_id', sessionId);

  const { data: paths } = await supabase
    .from('simulation_paths').select('*').eq('session_id', sessionId);

  const { data: comments } = await supabase
    .from('agent_comments').select('*')
    .eq('session_id', sessionId).order('round').order('created_at');

  const { data: snapshots } = await supabase
    .from('snapshots').select('version, trigger, human_judgment, created_at')
    .eq('session_id', sessionId).order('version');

  let md = `# ProdMind 2.0 决策报告\n\n`;
  md += `**会话ID**: ${session.id}\n`;
  md += `**创建时间**: ${session.created_at}\n`;
  md += `**总轮数**: ${session.current_round}\n`;
  md += `**决策信心指数**: ${session.confidence_index}%\n\n---\n\n`;

  const p = pd?.[0];
  if (p?.description) {
    md += `## 问题定义 (v${p.version})\n\n${p.description}\n\n`;
    if (p.expected_outcome) md += `**期望结果**: ${p.expected_outcome}\n\n`;
  }

  if (assumptions?.length) {
    md += `## 假设库\n\n`;
    for (const a of assumptions) {
      const icon = a.status === 'validated' ? '✅' : a.status === 'rejected' ? '❌' : '❓';
      md += `- ${icon} [${a.status}] ${a.content}（来源：${a.source}）\n`;
    }
    md += '\n';
  }

  if (risks?.length) {
    md += `## 风险库\n\n`;
    for (const r of risks) {
      md += `- [${r.probability}/${r.severity}] ${r.content}\n`;
    }
    md += '\n';
  }

  if (paths?.length) {
    md += `## 推演路径\n\n`;
    for (const sp of paths) {
      md += `### ${sp.label}\n`;
      sp.steps.forEach((s: string, i: number) => { md += `${i + 1}. ${s}\n`; });
      md += `**结果**: ${sp.outcome}\n\n`;
    }
  }

  if (comments?.length) {
    md += `## 智能体发言记录\n\n`;
    let curRound = 0;
    for (const c of comments) {
      if (c.round !== curRound) {
        curRound = c.round;
        md += `### 第${curRound}轮\n\n`;
      }
      md += `**${c.agent}**:\n${c.content}\n\n`;
    }
  }

  if (snapshots && snapshots.length > 1) {
    md += `## 决策版本历史\n\n`;
    for (const s of snapshots) {
      md += `- v${s.version} (${s.created_at.slice(0, 19)}) — ${s.trigger}`;
      if (s.human_judgment) md += ` — ${s.human_judgment}`;
      md += '\n';
    }
  }

  return md;
}
