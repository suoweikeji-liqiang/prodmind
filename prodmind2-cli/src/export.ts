import fs from 'fs';
import path from 'path';
import os from 'os';
import type { DecisionSession } from './storage.js';

const SESSIONS_DIR = path.join(os.homedir(), '.prodmind2', 'sessions');

export function exportSessionToMarkdown(session: DecisionSession): string {
  let md = `# ProdMind 2.0 决策报告\n\n`;
  md += `**会话ID**: ${session.id}\n`;
  md += `**创建时间**: ${session.createdAt}\n`;
  md += `**总轮数**: ${session.currentRound}\n`;
  md += `**决策信心指数**: ${session.stateTree.confidenceIndex}%\n\n`;
  md += `---\n\n`;

  // 问题定义
  const p = session.stateTree.problem;
  if (p.description) {
    md += `## 问题定义 (v${p.version})\n\n`;
    md += `${p.description}\n\n`;
    if (p.expectedOutcome) md += `**期望结果**: ${p.expectedOutcome}\n\n`;
    if (p.constraints.length) md += `**约束**: ${p.constraints.join('、')}\n\n`;
    if (p.irreversibleCosts.length) md += `**不可逆成本**: ${p.irreversibleCosts.join('、')}\n\n`;
  }

  // 假设库
  if (session.stateTree.assumptions.length) {
    md += `## 假设库\n\n`;
    for (const a of session.stateTree.assumptions) {
      const icon = a.status === 'validated' ? '✅' : a.status === 'rejected' ? '❌' : '❓';
      md += `- ${icon} [${a.status}] ${a.content}（来源：${a.source}）\n`;
    }
    md += '\n';
  }

  // 风险库
  if (session.stateTree.risks.length) {
    md += `## 风险库\n\n`;
    for (const r of session.stateTree.risks) {
      md += `- [${r.probability}概率/${r.severity}严重] ${r.content}\n`;
    }
    md += '\n';
  }

  // 推演路径
  if (session.stateTree.simulationPaths.length) {
    md += `## 推演路径\n\n`;
    for (const sp of session.stateTree.simulationPaths) {
      md += `### ${sp.label}\n`;
      sp.steps.forEach((s, i) => { md += `${i + 1}. ${s}\n`; });
      md += `**结果**: ${sp.outcome}\n\n`;
    }
  }

  // 智能体发言记录
  if (session.agentComments.length) {
    md += `## 智能体发言记录\n\n`;
    let currentRound = 0;
    for (const c of session.agentComments) {
      if (c.round !== currentRound) {
        currentRound = c.round;
        md += `### 第${currentRound}轮\n\n`;
      }
      md += `**${c.agent}**:\n${c.content}\n\n`;
    }
  }

  // 快照历史
  if (session.snapshots.length > 1) {
    md += `## 决策版本历史\n\n`;
    for (const snap of session.snapshots) {
      md += `- v${snap.version} (${snap.timestamp.slice(0, 19)}) — ${snap.trigger}`;
      if (snap.humanJudgment) md += ` — ${snap.humanJudgment}`;
      md += '\n';
    }
  }

  return md;
}

export function saveMarkdownExport(session: DecisionSession, customName?: string): string {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  const safeName = customName ? customName.replace(/[<>:"/\\|?*]/g, '_').trim() : session.id;
  const filename = `${session.createdAt.slice(0, 10)}-${safeName}.md`;
  const filepath = path.join(SESSIONS_DIR, filename);
  fs.writeFileSync(filepath, exportSessionToMarkdown(session), 'utf-8');
  return filepath;
}
