#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import { startDebate } from './debate.js';
import { isConfigured, saveConfig, getConfig, listSessions, loadSession } from './storage.js';
import { exportSessionToMarkdown, saveMarkdownExport } from './export.js';

const args = process.argv.slice(2);
const command = args[0] ?? '';

async function ensureConfig(): Promise<boolean> {
  if (isConfigured()) return true;

  console.log(chalk.yellow('\n  ⚠ 尚未配置 API Key。请先运行 prodmind config\n'));

  const { apiKey } = await inquirer.prompt([{
    type: 'password',
    name: 'apiKey',
    message: 'OpenAI API Key：',
    mask: '*',
  }]);

  if (!apiKey.trim()) {
    console.log(chalk.red('  API Key 不能为空。'));
    return false;
  }

  const { baseURL } = await inquirer.prompt([{
    type: 'input',
    name: 'baseURL',
    message: 'API Base URL（直接回车使用默认）：',
    default: '',
  }]);

  saveConfig({ apiKey: apiKey.trim(), baseURL: baseURL.trim() || undefined });
  console.log(chalk.green('  ✅ 配置已保存。\n'));
  return true;
}

async function handleConfig(): Promise<void> {
  const current = getConfig();
  console.log(chalk.cyan('\n  ProdMind 配置\n'));

  if (current.apiKey) {
    console.log(`  当前 API Key：${current.apiKey.slice(0, 8)}...`);
    if (current.baseURL) console.log(`  当前 Base URL：${current.baseURL}`);
    if (current.model) console.log(`  当前模型：${current.model}`);
  }

  const { apiKey } = await inquirer.prompt([{
    type: 'password',
    name: 'apiKey',
    message: 'OpenAI API Key（回车保持不变）：',
    mask: '*',
    default: current.apiKey,
  }]);

  const { baseURL } = await inquirer.prompt([{
    type: 'input',
    name: 'baseURL',
    message: 'API Base URL（回车保持不变）：',
    default: current.baseURL ?? '',
  }]);

  const { model } = await inquirer.prompt([{
    type: 'input',
    name: 'model',
    message: '模型名称（如 gpt-4o、claude-sonnet-4-20250514 等，回车默认 gpt-4o）：',
    default: current.model ?? 'gpt-4o',
  }]);

  saveConfig({ apiKey: apiKey.trim(), baseURL: baseURL.trim() || undefined, model: model.trim() || undefined });
  console.log(chalk.green('  ✅ 配置已更新。\n'));
}

function handleList(): void {
  const sessions = listSessions();
  if (sessions.length === 0) {
    console.log(chalk.gray('\n  暂无历史会话。运行 prodmind 开始第一次辩论。\n'));
    return;
  }

  console.log(chalk.cyan('\n  历史会话\n'));
  for (const s of sessions) {
    console.log(`  ${chalk.gray(s.id)} | ${s.title} | ${s.createdAt.slice(0, 10)} | ${s.rounds}轮`);
  }
  console.log();
}

function handleView(sessionId: string): void {
  if (!sessionId) {
    console.log(chalk.red('\n  用法：prodmind view <session-id>\n'));
    return;
  }
  const session = loadSession(sessionId);
  if (!session) {
    console.log(chalk.red(`\n  未找到会话：${sessionId}\n`));
    return;
  }
  console.log(exportSessionToMarkdown(session));
}

function handleExport(sessionId: string, customName?: string): void {
  if (!sessionId) {
    console.log(chalk.red('\n  用法：prodmind export <session-id> [名称]\n'));
    return;
  }
  const session = loadSession(sessionId);
  if (!session) {
    console.log(chalk.red(`\n  未找到会话：${sessionId}\n`));
    return;
  }
  const mdPath = saveMarkdownExport(session, customName);
  console.log(chalk.green(`\n  ✅ 已导出：${mdPath}\n`));
}

async function main(): Promise<void> {
  switch (command) {
    case 'config':
      await handleConfig();
      break;
    case 'list':
      handleList();
      break;
    case 'view':
      handleView(args[1]);
      break;
    case 'export':
      handleExport(args[1], args[2]);
      break;
    case 'help':
    case '--help':
    case '-h':
      console.log(chalk.cyan('\n  ProdMind v0.1 — 认知对抗机器（CLI版）\n'));
      console.log('  用法：');
      console.log('    prodmind                     启动新会话');
      console.log('    prodmind list                查看历史会话');
      console.log('    prodmind view <session-id>   查看某次会话记录');
      console.log('    prodmind export <session-id> [名称] 导出为Markdown');
      console.log('    prodmind config              配置API Key');
      console.log();
      break;
    default:
      if (!(await ensureConfig())) return;
      await startDebate();
      break;
  }
}

main().catch(err => {
  console.error(chalk.red(`\n  错误：${err.message}\n`));
  process.exit(1);
});
