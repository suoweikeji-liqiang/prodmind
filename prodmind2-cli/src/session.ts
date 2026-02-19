import chalk from 'chalk';
import inquirer from 'inquirer';
import { callAgent, type AgentName } from './roles/index.js';
import { getActiveAgents } from './scheduler.js';
import { takeSnapshot, updateProblem, addAssumption, addRisk, recalcConfidence } from './state.js';
import { createSession, saveSession, type DecisionSession } from './storage.js';
import { saveMarkdownExport } from './export.js';

const MAX_ROUNDS = 5;
const MIN_RESPONSE_LENGTH = 50;

const AGENT_LABELS: Record<AgentName, { icon: string; name: string; color: (s: string) => string }> = {
  'problem-architect': { icon: '🏗️', name: '问题澄清官', color: chalk.blue },
  'critical-examiner': { icon: '🔍', name: '批判官', color: chalk.yellow },
  'system-mapper': { icon: '🗺️', name: '系统分析官', color: chalk.cyan },
  'devils-advocate': { icon: '⚔️', name: '反对者代理', color: chalk.red },
  'risk-architect': { icon: '🛡️', name: '风险官', color: chalk.magenta },
  'strategic-evaluator': { icon: '📈', name: '长期价值官', color: chalk.green },
};

function divider(icon: string, title: string, color: (s: string) => string): void {
  console.log('\n' + color(`  ${'─'.repeat(37)}`));
  console.log(color(`  ${icon} ${title}`));
  console.log(color(`  ${'─'.repeat(37)}`));
}

function printAgent(agent: AgentName, content: string): void {
  const { icon, name, color } = AGENT_LABELS[agent];
  divider(icon, name, color);
  console.log(color(content.split('\n').map(l => `  ${l}`).join('\n')));
}

async function getUserInput(prompt: string, minLength = 0): Promise<string> {
  while (true) {
    const { answer } = await inquirer.prompt([{ type: 'input', name: 'answer', message: prompt }]);
    const trimmed = (answer as string).trim();
    if (minLength > 0 && trimmed.length < minLength) {
      console.log(chalk.yellow(`  ⚠ 至少输入${minLength}字（当前${trimmed.length}字），请重新输入。`));
      continue;
    }
    if (!trimmed) {
      console.log(chalk.yellow('  ⚠ 不能为空，请输入内容。'));
      continue;
    }
    return trimmed;
  }
}

function buildContext(session: DecisionSession): string {
  const tree = session.stateTree;
  let ctx = '';
  if (tree.problem.description) {
    ctx += `## 当前问题定义 (v${tree.problem.version})\n${tree.problem.description}\n期望结果：${tree.problem.expectedOutcome}\n\n`;
  }
  if (tree.assumptions.length) {
    ctx += `## 假设库\n${tree.assumptions.map(a => `- [${a.status}] ${a.content}`).join('\n')}\n\n`;
  }
  if (tree.risks.length) {
    ctx += `## 风险库\n${tree.risks.map(r => `- [${r.probability}/${r.severity}] ${r.content}`).join('\n')}\n\n`;
  }
  // 最近的智能体发言
  const recent = session.agentComments.filter(c => c.round === session.currentRound);
  if (recent.length) {
    ctx += `## 本轮发言\n${recent.map(c => `${c.agent}：${c.content}`).join('\n\n')}\n\n`;
  }
  return ctx;
}

function parseAssumptions(output: string): string[] {
  const section = output.match(/##\s*隐含假设[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
  if (!section) return [];
  return section[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^[-\s]*/, '').trim()).filter(Boolean);
}

function parseRisks(output: string): { content: string; prob: 'high' | 'medium' | 'low'; sev: 'high' | 'medium' | 'low' }[] {
  const section = output.match(/##\s*(?:失败路径|风险集中度|最坏情境)[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
  if (!section) return [];
  return section[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => ({
    content: l.replace(/^[-\s]*/, '').trim(),
    prob: 'medium' as const,
    sev: 'medium' as const,
  })).filter(r => r.content);
}

export async function startSession(): Promise<void> {
  console.log(chalk.cyan('\n  ProdMind 2.0 — 决策结构操作系统（CLI版）\n'));

  const idea = await getUserInput('输入你的决策问题（越具体越好）：');
  const session = createSession(idea);

  for (let roundNum = 1; roundNum <= MAX_ROUNDS; roundNum++) {
    session.currentRound = roundNum;
    console.log(chalk.gray(`\n  ══════════ 第 ${roundNum} 轮 ══════════\n`));

    const agents = getActiveAgents(session.stateTree, roundNum);
    console.log(chalk.gray(`  本轮激活角色：${agents.map(a => AGENT_LABELS[a].name).join('、')}`));

    // 调用每个激活的智能体
    for (const agent of agents) {
      const label = AGENT_LABELS[agent];
      console.log(chalk.gray(`\n  ${label.icon} ${label.name}正在分析...`));

      const context = `用户的决策问题：\n${idea}\n\n${buildContext(session)}`;
      let output: string;
      try {
        output = await callAgent(agent, context);
      } catch {
        console.log(chalk.yellow(`  ⚠ ${label.name} API调用失败，跳过。`));
        continue;
      }

      printAgent(agent, output);
      session.agentComments.push({
        round: roundNum,
        agent: label.name,
        content: output,
        timestamp: new Date().toISOString(),
      });

      // 从问题澄清官输出中提取问题定义
      if (agent === 'problem-architect') {
        const coreMatch = output.match(/##\s*核心问题[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
        const expectedMatch = output.match(/##\s*期望结果[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
        if (coreMatch) {
          const desc = coreMatch[1].trim().split('\n')[0].replace(/^[-\s]*/, '');
          const expected = expectedMatch ? expectedMatch[1].trim().split('\n')[0].replace(/^[-\s]*/, '') : '';
          updateProblem(session, desc, expected);
        }
        // 提取假设
        for (const a of parseAssumptions(output)) {
          addAssumption(session.stateTree, a, label.name);
        }
      }

      // 从反对者/风险官输出中提取风险
      if (agent === 'devils-advocate' || agent === 'risk-architect') {
        for (const r of parseRisks(output)) {
          addRisk(session.stateTree, r.content, r.prob, r.sev);
        }
      }

      // 从批判官输出中提取未验证假设
      if (agent === 'critical-examiner') {
        const unverified = output.match(/##\s*未验证假设[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
        if (unverified) {
          for (const line of unverified[1].split('\n').filter(l => l.trim().startsWith('-'))) {
            addAssumption(session.stateTree, line.replace(/^[-\s]*/, '').trim(), label.name);
          }
        }
      }
    }

    recalcConfidence(session.stateTree);
    console.log(chalk.gray(`\n  ┄┄ 决策信心指数：${session.stateTree.confidenceIndex}% | 假设：${session.stateTree.assumptions.length}条 | 风险：${session.stateTree.risks.length}条 ┄┄`));

    // 人在环路
    console.log(chalk.cyan('\n  ── 人在环路 ──'));
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: '你的操作：',
      choices: [
        { name: '(1) 回应质疑并继续', value: 'respond' },
        { name: '(2) 修改决策目标', value: 'modify' },
        { name: '(3) 驳回某个智能体结论', value: 'reject' },
        { name: '(4) 强制进入下一阶段', value: 'force' },
        { name: '(5) 结束并保存', value: 'end' },
      ],
    }]);

    if (action === 'end') {
      takeSnapshot(session, '用户主动结束', '决策完成');
      break;
    }

    if (action === 'respond') {
      const response = await getUserInput(`回应质疑（至少${MIN_RESPONSE_LENGTH}字）：`, MIN_RESPONSE_LENGTH);
      takeSnapshot(session, `第${roundNum}轮用户回应`, response);
    }

    if (action === 'modify') {
      const newGoal = await getUserInput('输入新的决策目标：');
      const newExpected = await getUserInput('期望结果：');
      updateProblem(session, newGoal, newExpected);
      takeSnapshot(session, '用户修改决策目标');
      console.log(chalk.green(`  ✅ 问题定义已更新为 v${session.stateTree.problem.version}`));
    }

    if (action === 'reject') {
      const rejectTarget = await getUserInput('你要驳回哪个智能体的结论？（输入角色名）：');
      const reason = await getUserInput('驳回理由：', 20);
      takeSnapshot(session, `驳回${rejectTarget}`, reason);
      console.log(chalk.green(`  ✅ 已记录驳回，下一轮将重新推演。`));
    }

    if (action === 'force') {
      takeSnapshot(session, '强制推进（高风险）', '用户跳过未完成检查');
      console.log(chalk.yellow('  ⚠ 已标记为高风险强制决策。'));
    }

    saveSession(session);

    if (roundNum >= MAX_ROUNDS) {
      console.log(chalk.yellow(`\n  已达到最大轮数（${MAX_ROUNDS}轮），自动结束。`));
      takeSnapshot(session, '达到最大轮数');
    }
  }

  // 保存最终结果
  saveSession(session);

  const { exportName } = await inquirer.prompt([{
    type: 'input',
    name: 'exportName',
    message: '给这次决策会话起个名字（回车使用默认）：',
    default: session.title,
  }]);
  const mdPath = saveMarkdownExport(session, (exportName as string).trim() || undefined);
  console.log(chalk.cyan(`\n  ✅ 会话已保存`));
  console.log(chalk.cyan(`  📄 Markdown 导出：${mdPath}`));
  console.log(chalk.cyan(`  🆔 会话ID：${session.id}\n`));
}
