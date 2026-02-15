import chalk from 'chalk';
import inquirer from 'inquirer';
import { callArchitect, callAssassin, callUserGhost, callGrounder } from './roles/index.js';
import {
  detectAlternativeHypothesis,
  detectConsensusAlert,
  detectTechEscape,
  validateFalsificationBlock,
  type AlternativeHypothesis,
} from './consensus-check.js';
import { createSession, saveSession, type Session, type Round, type GrounderOutput } from './storage.js';
import { saveMarkdownExport } from './export.js';

const MAX_ROUNDS = 5;
const MIN_RESPONSE_LENGTH = 50;

function divider(icon: string, title: string, color: (s: string) => string): void {
  console.log('\n' + color(`  ${'─'.repeat(37)}`));
  console.log(color(`  ${icon} ${title}`));
  console.log(color(`  ${'─'.repeat(37)}`));
}

function printRole(icon: string, title: string, content: string, color: (s: string) => string): void {
  divider(icon, title, color);
  console.log(color(content.split('\n').map(l => `  ${l}`).join('\n')));
}

async function getUserInput(prompt: string, minLength = 0): Promise<string> {
  while (true) {
    const { answer } = await inquirer.prompt([{
      type: 'input',
      name: 'answer',
      message: prompt,
    }]);
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

function buildRoundHistory(session: Session): string {
  if (session.rounds.length === 0) return '';
  return session.rounds.map(r =>
    `--- 第${r.round}轮 ---\n架构师：${r.architect}\n用户确认：${r.userConfirm}\n刺客：${r.assassin}\n用户鬼：${r.userGhost}\n用户回应：${r.userResponse}\n落地者：${r.grounder.raw}`
  ).join('\n\n');
}

// ── 规则1：替代假设阻断交互 ──
async function handleAlternativeHypothesis(alt: AlternativeHypothesis): Promise<string> {
  console.log(chalk.yellow(`\n  ⚠ 替代假设检测：`));
  console.log(chalk.yellow(`  ${alt.source}提出了替代假设：`));
  console.log(chalk.yellow(`  【${alt.content}】\n`));

  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: '在继续之前，你必须选择：',
    choices: [
      { name: '(1) 承认 — 将原假设降级，替代假设升级', value: 'accept' },
      { name: '(2) 提供反证 — 给出具体证据反驳', value: 'counter' },
      { name: '(3) 标记为待验证 — 生成验证实验', value: 'verify' },
    ],
  }]);

  if (choice === 'accept') {
    return `[用户承认替代假设] 原假设降级。替代假设"${alt.content}"升级为主要假设。`;
  } else if (choice === 'counter') {
    const evidence = await getUserInput('请提供具体反证：', 20);
    return `[用户反驳替代假设] 反证：${evidence}`;
  } else {
    return `[用户标记待验证] 替代假设"${alt.content}"需要通过实验验证。`;
  }
}

// ── 规则2：共识警报交互 ──
async function handleConsensusAlert(): Promise<string> {
  console.log(chalk.yellow('\n  ⚠ 共识警报：当前所有角色趋于一致，违反证伪原则。\n'));

  const q1 = await getUserInput('如果这个结论是错的，最可能错在哪里？');
  const q2 = await getUserInput('谁会强烈反对这个决策？');

  return `[共识警报回应] 可能错在：${q1}。反对者：${q2}`;
}

// ── 规则3：技术逃逸拦截交互 ──
async function handleTechEscape(): Promise<string> {
  console.log(chalk.magenta('\n  ⚠ 技术逃逸检测：你的回应主要在强调技术能力/开发速度，而非需求真实性。'));
  console.log(chalk.magenta('  即使开发成本为零，以下问题仍然存在：\n'));

  const q1 = await getUserInput('即使开发成本≈0，用户是否真的会买单/迁移？为什么？', MIN_RESPONSE_LENGTH);
  const q2 = await getUserInput('如果出了问题，风险归属如何转移？谁背锅？');
  const q3 = await getUserInput('验证用户真的需要这个东西的最小动作是什么？');

  return `[技术逃逸追问回应] 用户买单理由：${q1}。风险归属：${q2}。最小验证：${q3}`;
}

// ── 落地者降级兜底 ──
function generateFallbackGrounder(
  architectOutput: string,
  assassinOutput: string,
  userGhostOutput: string,
  userResponse: string,
): string {
  // 从架构师输出提取核心问题
  const coreMatch = architectOutput.match(/##\s*核心问题[^\n]*\n([\s\S]*?)(?=\n##|$)/);
  const core = coreMatch ? coreMatch[1].trim().split('\n')[0].replace(/^[-\s]*/, '') : '（未能提取）';

  // 从刺客输出提取隐含假设
  const assumptionMatch = assassinOutput.match(/##\s*隐含假设[^\n]*\n([\s\S]*?)(?=\n##|$)/);
  const assumption = assumptionMatch ? assumptionMatch[1].trim().split('\n')[0].replace(/^[-\s]*/, '') : '（未能提取）';

  return `## 当前最强假设（降级生成）

1. ${core}
2. 待验证：${assumption}

## MVP边界

### 本版本包含
- 待人工补充（API生成失败，仅保留结构）

### 明确排除
- 待人工补充

### 一周内可完成范围
- 待人工补充

## 未决冲突

- 冲突：刺客与用户的核心分歧尚未解决
- 争议点：${assumption}
- 下一步证伪：需要用户提供具体数据或案例

## 本轮证伪检查

当前最重要假设：${core}
如果我是错的，最可能因为什么？需求本身不成立
验证这个假设的最小动作是什么？对5个目标用户做快速访谈

⚠ 注意：本输出为API失败后的降级生成，信息密度较低，建议下一轮重新收敛。`;
}

export async function startDebate(): Promise<void> {
  console.log(chalk.cyan('\n  ProdMind v0.1 — 认知对抗机器（CLI版）\n'));

  const idea = await getUserInput('输入你的产品想法（越模糊越好）：');
  const session = createSession(idea);

  for (let roundNum = 1; roundNum <= MAX_ROUNDS; roundNum++) {
    console.log(chalk.gray(`\n  ══════════ 第 ${roundNum} 轮 ══════════\n`));

    const roundHistory = buildRoundHistory(session);

    // ── 架构师 ──
    console.log(chalk.blue('  🏗️  架构师正在定义问题...'));
    const architectOutput = await callArchitect({
      userInput: idea,
      roundHistory,
    });
    printRole('🏗️', '架构师', architectOutput, chalk.blue);

    // ── 用户确认 ──
    const userConfirm = await getUserInput('请确认或修正架构师的问题定义：');

    // ── 刺客 ──
    console.log(chalk.red('\n  ⚔️  刺客正在攻击...'));
    const assassinOutput = await callAssassin({
      userInput: idea,
      architectOutput,
      userResponse: userConfirm,
      roundHistory,
    });
    printRole('⚔️', '刺客', assassinOutput, chalk.red);

    // ── 用户鬼 ──
    console.log(chalk.green('\n  👤 用户鬼正在质疑...'));
    const userGhostOutput = await callUserGhost({
      userInput: idea,
      architectOutput,
      userResponse: userConfirm,
      roundHistory,
    });
    printRole('👤', '用户鬼', userGhostOutput, chalk.green);

    // ── 规则1：替代假设阻断 ──
    let altResponse = '';
    const altFromAssassin = detectAlternativeHypothesis(assassinOutput, '刺客');
    const altFromGhost = detectAlternativeHypothesis(userGhostOutput, '用户鬼');
    const alt = altFromAssassin || altFromGhost;
    if (alt) {
      altResponse = await handleAlternativeHypothesis(alt);
    }

    // ── 规则2：共识警报 ──
    let consensusResponse = '';
    if (detectConsensusAlert(assassinOutput, userGhostOutput, session.rounds)) {
      consensusResponse = await handleConsensusAlert();
    }

    // ── 用户回应质疑 ──
    console.log(chalk.yellow(`\n  你必须回应以上质疑（至少${MIN_RESPONSE_LENGTH}字）：`));
    const userResponse = await getUserInput('你的回应：', MIN_RESPONSE_LENGTH);

    // ── 规则3：技术逃逸拦截 ──
    let techEscapeResponse = '';
    const techEscapeTriggered = detectTechEscape(userResponse);
    if (techEscapeTriggered) {
      techEscapeResponse = await handleTechEscape();
    }

    // 合并所有用户回应作为落地者的输入
    const fullUserResponse = [userResponse, altResponse, consensusResponse, techEscapeResponse].filter(Boolean).join('\n');

    // ── 落地者 ──
    console.log(chalk.gray('\n  📋 落地者正在收敛...'));
    let grounderOutput: string;
    let grounderFallback = false;
    try {
      grounderOutput = await callGrounder({
        userInput: fullUserResponse,
        architectOutput,
        assassinOutput,
        userGhostOutput,
        userResponse: userConfirm,
        roundHistory,
      });

      // ── 规则5：强制证伪语句检查 ──
      if (!validateFalsificationBlock(grounderOutput)) {
        console.log(chalk.yellow('  ⚠ 落地者输出缺少证伪检查，要求重新生成...'));
        grounderOutput = await callGrounder({
          userInput: fullUserResponse + '\n\n【系统提示】你的上一次输出缺少"本轮证伪检查"部分。请务必在末尾包含：当前最重要假设、如果我是错的最可能因为什么、验证这个假设的最小动作。',
          architectOutput,
          assassinOutput,
          userGhostOutput,
          userResponse: userConfirm,
          roundHistory,
        });
      }
    } catch {
      console.log(chalk.yellow('  ⚠ 落地者API调用失败，启用本地降级生成...'));
      grounderOutput = generateFallbackGrounder(architectOutput, assassinOutput, userGhostOutput, fullUserResponse);
      grounderFallback = true;
    }

    printRole('📋', '落地者', grounderOutput, chalk.gray);

    // 保存本轮
    const round: Round = {
      round: roundNum,
      architect: architectOutput,
      userConfirm,
      assassin: assassinOutput,
      userGhost: userGhostOutput,
      userResponse: fullUserResponse,
      grounder: { hypotheses: '', mvpBoundary: '', raw: grounderOutput },
    };
    session.rounds.push(round);
    saveSession(session);

    // ── 诊断行 ──
    const altTag = alt ? `${alt.source}→${alt.content.slice(0, 20)}` : 'none';
    console.log(chalk.gray(`\n  ┄┄ 诊断 ┄┄ 替代假设：${altTag} | 技术逃逸：${techEscapeTriggered ? 'Y' : 'N'} | 共识警报：${consensusResponse ? 'Y' : 'N'} | 兜底：${grounderFallback ? 'fallback' : 'none'}`));

    // ── 用户选择 ──
    if (roundNum < MAX_ROUNDS) {
      const { choice } = await inquirer.prompt([{
        type: 'list',
        name: 'choice',
        message: '下一步？',
        choices: [
          { name: `(1) 继续挑战（进入第${roundNum + 1}轮）`, value: 'continue' },
          { name: '(2) 结束并保存', value: 'end' },
        ],
      }]);
      if (choice === 'end') break;
    } else {
      console.log(chalk.yellow(`\n  已达到最大轮数（${MAX_ROUNDS}轮），自动结束。`));
    }
  }

  // 保存最终结果
  const lastRound = session.rounds[session.rounds.length - 1];
  session.finalOutput = lastRound.grounder;
  saveSession(session);

  // 导出 Markdown
  const { exportName } = await inquirer.prompt([{
    type: 'input',
    name: 'exportName',
    message: '给这次会话起个名字（回车使用默认）：',
    default: session.title,
  }]);
  const mdPath = saveMarkdownExport(session, (exportName as string).trim() || undefined);
  console.log(chalk.cyan(`\n  ✅ 会话已保存`));
  console.log(chalk.cyan(`  📄 Markdown 导出：${mdPath}`));
  console.log(chalk.cyan(`  🆔 会话ID：${session.id}\n`));
}
