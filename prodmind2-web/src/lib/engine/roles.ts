import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentName } from '@/types';

const PROMPT_DIR = path.join(process.cwd(), 'prompts');

function loadPrompt(agent: AgentName): string {
  return fs.readFileSync(path.join(PROMPT_DIR, `${agent}.md`), 'utf-8');
}

const _clients = new Map<string, OpenAI>();

function getClient(apiKey: string, baseURL?: string): OpenAI {
  const key = `${apiKey}|${baseURL ?? ''}`;
  if (!_clients.has(key)) {
    _clients.set(key, new OpenAI({ apiKey, baseURL: baseURL || undefined, timeout: 5 * 60 * 1000 }));
  }
  return _clients.get(key)!;
}

export async function resolveAgent(
  supabase: SupabaseClient,
  userId: string,
  agent: AgentName,
): Promise<{ apiKey: string; baseURL?: string; model: string }> {
  const { data: routing } = await supabase
    .from('agent_routings').select('provider_name, model_override')
    .eq('user_id', userId).eq('agent_name', agent).single();

  const providerName = routing?.provider_name;
  if (!providerName) {
    // fallback: first provider
    const { data: providers } = await supabase
      .from('provider_configs').select('*').eq('user_id', userId).limit(1);
    const p = providers?.[0];
    if (!p) throw new Error('未配置任何 AI Provider，请先在设置页添加。');
    return { apiKey: p.api_key, baseURL: p.base_url || undefined, model: p.default_model };
  }

  const { data: provider } = await supabase
    .from('provider_configs').select('*')
    .eq('user_id', userId).eq('provider_name', providerName).single();

  if (!provider) throw new Error(`Provider "${providerName}" 未配置`);
  return {
    apiKey: provider.api_key,
    baseURL: provider.base_url || undefined,
    model: routing.model_override || provider.default_model,
  };
}

const TEMPERATURES: Partial<Record<AgentName, number>> = {
  'devils-advocate': 0.8,
};

export async function* streamAgent(
  supabase: SupabaseClient,
  userId: string,
  agent: AgentName,
  context: string,
): AsyncGenerator<string, string> {
  const { apiKey, baseURL, model } = await resolveAgent(supabase, userId, agent);
  const client = getClient(apiKey, baseURL);
  const systemPrompt = loadPrompt(agent);
  const temp = TEMPERATURES[agent] ?? 0.4;

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context },
    ],
    temperature: temp,
    max_tokens: 2000,
    stream: true,
  });

  let full = '';
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? '';
    if (token) {
      full += token;
      yield token;
    }
  }
  return full;
}
