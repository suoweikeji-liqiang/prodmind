/**
 * Export engine — generates Markdown/JSON from DB data.
 */

import type { MessageInfo, ConflictEventInfo, SessionInfo } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  architect: "🏗️ 架构师",
  assassin: "⚔️ 刺客",
  user_ghost: "👤 用户鬼",
  grounder: "📋 落地者",
  user: "用户",
  system: "系统",
};

export function exportToMarkdown(
  session: SessionInfo,
  messages: MessageInfo[],
  conflicts: ConflictEventInfo[]
): string {
  let md = `# ProdMind 会话导出\n\n`;
  md += `**会话ID**: ${session.id}\n`;
  md += `**创建时间**: ${session.createdAt}\n`;
  md += `**总轮数**: ${session.currentRound}\n\n`;
  md += `---\n\n`;

  const maxRound = Math.max(...messages.map((m) => m.round), 0);
  for (let r = 1; r <= maxRound; r++) {
    md += `## 第${r}轮\n\n`;
    const roundMsgs = messages.filter((m) => m.round === r);
    for (const msg of roundMsgs) {
      const label = ROLE_LABELS[msg.role] || msg.role;
      md += `### ${label}\n\n${msg.content}\n\n`;
    }

    const roundConflicts = conflicts.filter((c) => c.round === r);
    if (roundConflicts.length > 0) {
      md += `### 冲突事件\n\n`;
      for (const c of roundConflicts) {
        md += `- **${c.ruleType}**: ${c.detail}`;
        if (c.userChoice) md += ` → ${c.userChoice}`;
        md += `\n`;
      }
      md += `\n`;
    }
    md += `---\n\n`;
  }

  return md;
}

export function exportToJSON(
  session: SessionInfo,
  messages: MessageInfo[],
  conflicts: ConflictEventInfo[]
): string {
  return JSON.stringify({ session, messages, conflicts }, null, 2);
}
