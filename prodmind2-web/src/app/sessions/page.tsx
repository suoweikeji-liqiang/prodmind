'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { StatsOverview } from '@/components/dashboard/stats-overview';

interface Session {
  id: string;
  title: string;
  status: string;
  current_round: number;
  confidence_index: number;
  created_at: string;
}

export default function SessionsPage() {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }
  const [sessions, setSessions] = useState<Session[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    const { data } = await sb()
      .from('sessions').select('*').order('created_at', { ascending: false });
    setSessions(data ?? []);
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { data: { user } } = await sb().auth.getUser();
    if (!user) return;
    const { data } = await sb().from('sessions').insert({
      user_id: user.id,
      title: title.trim().slice(0, 30),
      idea: title.trim(),
    }).select().single();
    if (data) window.location.href = `/sessions/${data.id}`;
  }

  async function logout() {
    await sb().auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ProdMind 2.0</h1>
        <div className="flex gap-3 text-sm">
          <a href="/settings" className="text-gray-500 underline">设置</a>
          <button onClick={logout} className="text-gray-500 underline">退出</button>
        </div>
      </div>

      {sessions.length > 0 && (
        <StatsOverview stats={{
          totalSessions: sessions.length,
          activeSessions: sessions.filter(s => s.status === 'active').length,
          avgRounds: sessions.reduce((a, s) => a + s.current_round, 0) / sessions.length,
          avgConfidence: Math.round(sessions.reduce((a, s) => a + s.confidence_index, 0) / sessions.length),
        }} />
      )}

      <form onSubmit={createSession} className="flex gap-2">
        <input placeholder="输入决策问题，开始新会话..." value={title}
          onChange={e => setTitle(e.target.value)} required
          className="flex-1 rounded border px-3 py-2 text-sm" />
        <button type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white">开始</button>
      </form>

      <div className="space-y-2">
        {sessions.length === 0 && (
          <p className="text-sm text-gray-400">暂无历史会话</p>
        )}
        {sessions.map(s => (
          <a key={s.id} href={`/sessions/${s.id}`}
            className="block rounded border p-3 text-sm hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.title}</span>
              <span className="text-xs text-gray-400">
                {s.status === 'active' ? '进行中' : '已完成'}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              第{s.current_round}轮 · 信心{s.confidence_index}% · {s.created_at.slice(0, 10)}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
