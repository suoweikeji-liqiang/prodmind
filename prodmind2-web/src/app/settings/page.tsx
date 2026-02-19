'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ALL_AGENTS, AGENT_CONFIG } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Provider {
  id?: string;
  provider_name: string;
  api_key: string;
  base_url: string;
  default_model: string;
}

interface Routing {
  id?: string;
  agent_name: string;
  provider_name: string;
  model_override: string;
}

export default function SettingsPage() {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }
  const [providers, setProviders] = useState<Provider[]>([]);
  const [routings, setRoutings] = useState<Routing[]>([]);
  const [form, setForm] = useState<Provider>({
    provider_name: '', api_key: '', base_url: '', default_model: 'gpt-4o',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await sb().auth.getUser();
    if (!user) return;
    const { data: p } = await sb()
      .from('provider_configs').select('*').eq('user_id', user.id);
    const { data: r } = await sb()
      .from('agent_routings').select('*').eq('user_id', user.id);
    setProviders(p ?? []);
    setRoutings(r ?? []);
  }

  async function saveProvider(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await sb().auth.getUser();
    if (!user) return;
    const { error } = await sb().from('provider_configs').upsert({
      user_id: user.id,
      provider_name: form.provider_name.trim(),
      api_key: form.api_key.trim(),
      base_url: form.base_url.trim() || null,
      default_model: form.default_model.trim(),
    }, { onConflict: 'user_id,provider_name' });
    if (error) { setMsg(error.message); return; }
    setMsg('已保存');
    setForm({ provider_name: '', api_key: '', base_url: '', default_model: 'gpt-4o' });
    loadData();
  }

  async function deleteProvider(name: string) {
    const { data: { user } } = await sb().auth.getUser();
    if (!user) return;
    await sb().from('provider_configs')
      .delete().eq('user_id', user.id).eq('provider_name', name);
    loadData();
  }

  async function saveRouting(agent: string, providerName: string, model: string) {
    const { data: { user } } = await sb().auth.getUser();
    if (!user) return;
    if (!providerName) {
      await sb().from('agent_routings')
        .delete().eq('user_id', user.id).eq('agent_name', agent);
    } else {
      await sb().from('agent_routings').upsert({
        user_id: user.id,
        agent_name: agent,
        provider_name: providerName,
        model_override: model || null,
      }, { onConflict: 'user_id,agent_name' });
    }
    loadData();
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">设置</h1>
        <a href="/sessions" className="text-sm text-gray-500 underline">返回</a>
      </div>

      {/* Provider 列表 */}
      <section className="space-y-3">
        <h2 className="font-semibold">AI Providers</h2>
        {providers.map(p => (
          <div key={p.provider_name}
            className="flex items-center justify-between rounded border p-3 text-sm">
            <div>
              <span className="font-medium">{p.provider_name}</span>
              <span className="ml-2 text-gray-500">
                {p.base_url || 'OpenAI默认'} — {p.default_model}
              </span>
            </div>
            <button onClick={() => deleteProvider(p.provider_name)}
              className="text-red-500 text-xs">删除</button>
          </div>
        ))}

        {/* 添加 Provider */}
        <form onSubmit={saveProvider} className="space-y-2 rounded border p-3">
          <p className="text-sm font-medium">添加 / 更新 Provider</p>
          <input placeholder="名称 (如 deepseek)" value={form.provider_name}
            onChange={e => setForm({ ...form, provider_name: e.target.value })}
            required className="w-full rounded border px-2 py-1 text-sm" />
          <input placeholder="API Key" type="password" value={form.api_key}
            onChange={e => setForm({ ...form, api_key: e.target.value })}
            required className="w-full rounded border px-2 py-1 text-sm" />
          <input placeholder="Base URL (可选)" value={form.base_url}
            onChange={e => setForm({ ...form, base_url: e.target.value })}
            className="w-full rounded border px-2 py-1 text-sm" />
          <input placeholder="默认模型" value={form.default_model}
            onChange={e => setForm({ ...form, default_model: e.target.value })}
            required className="w-full rounded border px-2 py-1 text-sm" />
          <button type="submit"
            className="rounded bg-gray-900 px-3 py-1 text-sm text-white">保存</button>
          {msg && <p className="text-xs text-green-600">{msg}</p>}
        </form>
      </section>

      {/* 角色路由 */}
      <section className="space-y-3">
        <h2 className="font-semibold">角色路由</h2>
        <p className="text-xs text-gray-500">为每个角色指定 Provider 和模型（留空使用默认）</p>
        {ALL_AGENTS.map(agent => {
          const r = routings.find(x => x.agent_name === agent);
          return (
            <div key={agent} className="flex items-center gap-2 text-sm">
              <span className="w-28 shrink-0">{AGENT_CONFIG[agent].label}</span>
              <select value={r?.provider_name ?? ''}
                onChange={e => saveRouting(agent, e.target.value, r?.model_override ?? '')}
                className="rounded border px-2 py-1 text-sm">
                <option value="">默认</option>
                {providers.map(p => (
                  <option key={p.provider_name} value={p.provider_name}>
                    {p.provider_name}
                  </option>
                ))}
              </select>
              <input placeholder="模型覆盖" value={r?.model_override ?? ''}
                onChange={e => saveRouting(agent, r?.provider_name ?? '', e.target.value)}
                className="rounded border px-2 py-1 text-sm flex-1" />
            </div>
          );
        })}
      </section>
    </div>
  );
}
