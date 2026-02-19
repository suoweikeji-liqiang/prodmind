'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = isSignUp
      ? await sb().auth.signUp({ email, password })
      : await sb().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (isSignUp) { setError('注册成功，请检查邮箱确认链接。'); return; }
    window.location.href = '/sessions';
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-80 space-y-4">
        <h1 className="text-xl font-bold text-center">ProdMind 2.0</h1>
        <p className="text-sm text-gray-500 text-center">决策结构操作系统</p>
        <input type="email" placeholder="邮箱" value={email}
          onChange={e => setEmail(e.target.value)} required
          className="w-full rounded border px-3 py-2 text-sm" />
        <input type="password" placeholder="密码" value={password}
          onChange={e => setPassword(e.target.value)} required minLength={6}
          className="w-full rounded border px-3 py-2 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded bg-gray-900 py-2 text-sm text-white disabled:opacity-50">
          {loading ? '...' : isSignUp ? '注册' : '登录'}
        </button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-gray-500 underline">
          {isSignUp ? '已有账号？登录' : '没有账号？注册'}
        </button>
      </form>
    </div>
  );
}
