import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Session } from './storage.js';

const SESSIONS_DIR = path.join(os.homedir(), '.prodmind', 'sessions');

export function exportSessionToMarkdown(session: Session): string {
  let md = `# ProdMind 会话导出\n\n`;
  md += `**会话ID**: ${session.id}\n`;
  md += `**创建时间**: ${session.createdAt}\n`;
  md += `**总轮数**: ${session.rounds.length}\n\n`;
  md += `---\n\n`;

  for (const round of session.rounds) {
    md += `## 第${round.round}轮\n\n`;

    md += `### 🏗️ 架构师\n\n${round.architect}\n\n`;
    md += `### 用户确认\n\n${round.userConfirm}\n\n`;
    md += `### ⚔️ 刺客\n\n${round.assassin}\n\n`;
    md += `### 👤 用户鬼\n\n${round.userGhost}\n\n`;
    md += `### 用户回应\n\n${round.userResponse}\n\n`;
    md += `### 📋 落地者\n\n${round.grounder.raw}\n\n`;
    md += `---\n\n`;
  }

  if (session.finalOutput) {
    md += `## 最终产出\n\n${session.finalOutput.raw}\n`;
  }

  return md;
}

export function saveMarkdownExport(session: Session, customName?: string): string {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  const safeName = customName ? customName.replace(/[<>:"/\\|?*]/g, '_').trim() : session.id;
  const filename = `${session.createdAt.slice(0, 10)}-${safeName}.md`;
  const filepath = path.join(SESSIONS_DIR, filename);
  const content = exportSessionToMarkdown(session);
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}
