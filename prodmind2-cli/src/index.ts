#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import { startSession } from './session.js';
import { isConfigured, saveConfig, getConfig, listSessions, loadSession } from './storage.js';
import { exportSessionToMarkdown, saveMarkdownExport } from './export.js';

const args = process.argv.slice(2);
const command = args[0] ?? '';

async function ensureConfig(): Promise<boolean> {
  if (isConfigured()) return true;

  console.log(chalk.yellow('\n  ⚠ 尚未配置。请先运行 prodmind2 config\n'));

  const { name } = await inquirer.prompt([{
    type: 'input', name: 'name', message: 'Provider 名称（如 deepseek、openrouter）：',
  }]);
  const { apiKey } = await inquirer.prompt([{
    type: 'password', name: 'apiKey', message: 'API Key：', mask: '*',
  }]);
  if (!apiKey.trim()) {
    console.log(chalk.red('  API Key 不能为空。'));
    return false;
  }
  const { baseURL } = await inquirer.prompt([{
    type: 'input', name: 'baseURL', message: 'API Base URL（回车使用 OpenAI 默认）：', default: '',
  }]);
  const { model } = await inquirer.prompt([{
    type: 'input', name: 'model', message: '默认模型：', default: 'gpt-4o',
  }]);

  saveConfig({
    providers: { [name.trim()]: { apiKey: apiKey.trim(), baseURL: baseURL.trim() || undefined, defaultModel: model.trim() } },
    defaultProvider: name.trim(),
  });
  console.log(chalk.green('  ✅ 配置已保存。\n'));
  return true;
}

async function handleConfig(): Promise<void> {
  const current = getConfig();
  console.log(chalk.cyan('\n  ProdMind 2.0 配置\n'));

  // 显示已有 providers
  const providerNames = Object.keys(current.providers);
  if (providerNames.length) {
    console.log('  已配置的 Providers：');
    for (const name of providerNames) {
      const p = current.providers[name];
      const isDefault = name === current.defaultProvider ? ' (默认)' : '';
      console.log(`    ${name}${isDefault} — ${p.baseURL ?? 'OpenAI默认'} — 模型：${p.defaultModel}`);
    }
    if (current.agentRouting) {
      console.log('\n  角色路由：');
      for (const [agent, r] of Object.entries(current.agentRouting)) {
        if (r) console.log(`    ${agent} → ${r.provider}${r.model ? ` (${r.model})` : ''}`);
      }
    }
  }

  const { action } = await inquirer.prompt([{
    type: 'list', name: 'action', message: '操作：',
    choices: [
      { name: '添加/更新 Provider', value: 'provider' },
      { name: '设置角色路由', value: 'routing' },
      { name: '退出', value: 'exit' },
    ],
  }]);

  if (action === 'exit') return;

  if (action === 'provider') {
    const { name } = await inquirer.prompt([{
      type: 'input', name: 'name', message: 'Provider 名称：',
    }]);
    const existing = current.providers[name.trim()];
    const { apiKey } = await inquirer.prompt([{
      type: 'password', name: 'apiKey', message: 'API Key：', mask: '*', default: existing?.apiKey,
    }]);
    const { baseURL } = await inquirer.prompt([{
      type: 'input', name: 'baseURL', message: 'Base URL：', default: existing?.baseURL ?? '',
    }]);
    const { model } = await inquirer.prompt([{
      type: 'input', name: 'model', message: '默认模型：', default: existing?.defaultModel ?? 'gpt-4o',
    }]);
    const { setDefault } = await inquirer.prompt([{
      type: 'confirm', name: 'setDefault', message: '设为默认 Provider？', default: !providerNames.length,
    }]);

    current.providers[name.trim()] = { apiKey: apiKey.trim(), baseURL: baseURL.trim() || undefined, defaultModel: model.trim() };
    if (setDefault) current.defaultProvider = name.trim();
    saveConfig(current);
    console.log(chalk.green('  ✅ Provider 已保存。\n'));
  }

  if (action === 'routing') {
    if (!providerNames.length) {
      console.log(chalk.red('  请先添加至少一个 Provider。'));
      return;
    }
    const { agent } = await inquirer.prompt([{
      type: 'list', name: 'agent', message: '选择角色：',
      choices: ['problem-architect', 'critical-examiner', 'system-mapper', 'devils-advocate', 'risk-architect', 'strategic-evaluator'],
    }]);
    const { provider } = await inquirer.prompt([{
      type: 'list', name: 'provider', message: 'Provider：',
      choices: Object.keys(current.providers),
    }]);
    const { model } = await inquirer.prompt([{
      type: 'input', name: 'model', message: '模型（回车用该 Provider 默认模型）：', default: '',
    }]);

    current.agentRouting = current.agentRouting ?? {};
    current.agentRouting[agent] = { provider, model: model.trim() || undefined };
    saveConfig(current);
    console.log(chalk.green('  ✅ 路由已保存。\n'));
  }
}

function handleList(): void {
  const sessions = listSessions();
  if (sessions.length === 0) {
    console.log(chalk.gray('\n  暂无历史会话。运行 prodmind2 开始第一次决策。\n'));
    return;
  }
  console.log(chalk.cyan('\n  历史会话\n'));
  for (const s of sessions) {
    console.log(`  ${chalk.gray(s.id)} | ${s.title} | ${s.createdAt.slice(0, 10)} | ${s.rounds}轮`);
  }
  console.log();
}

function handleView(sessionId: string): void {
  if (!sessionId) { console.log(chalk.red('\n  用法：prodmind2 view <session-id>\n')); return; }
  const session = loadSession(sessionId);
  if (!session) { console.log(chalk.red(`\n  未找到会话：${sessionId}\n`)); return; }
  console.log(exportSessionToMarkdown(session));
}

function handleExport(sessionId: string, customName?: string): void {
  if (!sessionId) { console.log(chalk.red('\n  用法：prodmind2 export <session-id> [名称]\n')); return; }
  const session = loadSession(sessionId);
  if (!session) { console.log(chalk.red(`\n  未找到会话：${sessionId}\n`)); return; }
  const mdPath = saveMarkdownExport(session, customName);
  console.log(chalk.green(`\n  ✅ 已导出：${mdPath}\n`));
}

async function main(): Promise<void> {
  switch (command) {
    case 'config': await handleConfig(); break;
    case 'list': handleList(); break;
    case 'view': handleView(args[1]); break;
    case 'export': handleExport(args[1], args[2]); break;
    case 'help': case '--help': case '-h':
      console.log(chalk.cyan('\n  ProdMind 2.0 — 决策结构操作系统（CLI版）\n'));
      console.log('  用法：');
      console.log('    prodmind2                     启动新决策会话');
      console.log('    prodmind2 list                查看历史会话');
      console.log('    prodmind2 view <session-id>   查看某次会话');
      console.log('    prodmind2 export <session-id> 导出为Markdown');
      console.log('    prodmind2 config              配置API Key');
      console.log();
      break;
    default:
      if (!(await ensureConfig())) return;
      await startSession();
      break;
  }
}

main().catch(err => {
  console.error(chalk.red(`\n  错误：${err.message}\n`));
  process.exit(1);
});
