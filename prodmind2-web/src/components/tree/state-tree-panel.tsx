'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CausalLoopDiagram } from './causal-loop-diagram';

interface Problem { version: number; description: string; expected_outcome: string }
interface Assumption { id: string; content: string; status: string; source: string }
interface Risk { id: string; content: string; probability: string; severity: string }

export function StateTreePanel({ sessionId }: { sessionId: string }) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  const [problem, setProblem] = useState<Problem | null>(null);
  const [assumptions, setAssumptions] = useState<Assumption[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [ci, setCi] = useState(0);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    const { data: pd } = await sb()
      .from('problem_definitions').select('*')
      .eq('session_id', sessionId).order('version', { ascending: false }).limit(1);
    setProblem(pd?.[0] ?? null);

    const { data: a } = await sb()
      .from('assumptions').select('*').eq('session_id', sessionId);
    setAssumptions(a ?? []);

    const { data: r } = await sb()
      .from('risks').select('*').eq('session_id', sessionId);
    setRisks(r ?? []);

    const { data: s } = await sb()
      .from('sessions').select('confidence_index').eq('id', sessionId).single();
    setCi(s?.confidence_index ?? 0);
  }

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = sb().channel(`state-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assumptions', filter: `session_id=eq.${sessionId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risks', filter: `session_id=eq.${sessionId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` }, () => load())
      .subscribe();
    return () => { sb().removeChannel(channel); };
  }, [sessionId]);

  async function toggleAssumption(id: string, current: string) {
    const next = current === 'validated' ? 'unvalidated' : current === 'unvalidated' ? 'validated' : 'unvalidated';
    await sb().from('assumptions').update({ status: next }).eq('id', id);
    load();
  }

  async function rejectAssumption(id: string) {
    await sb().from('assumptions').update({ status: 'rejected' }).eq('id', id);
    load();
  }

  const statusIcon = (s: string) => s === 'validated' ? '✅' : s === 'rejected' ? '❌' : '❓';
  const riskColor = (p: string, s: string) =>
    (p === 'high' && s === 'high') ? 'text-red-600' :
    (p === 'high' || s === 'high') ? 'text-orange-500' : 'text-yellow-600';

  return (
    <div className="h-full overflow-y-auto p-3 space-y-4 text-sm">
      {/* Confidence */}
      <div>
        <div className="text-xs text-gray-500 mb-1">决策信心指数</div>
        <div className="h-2 rounded bg-gray-200">
          <div className="h-2 rounded bg-gray-800 transition-all" style={{ width: `${ci}%` }} />
        </div>
        <div className="text-right text-xs text-gray-500 mt-0.5">{ci}%</div>
      </div>

      {/* Problem */}
      {problem && (
        <div className="rounded border p-2">
          <div className="text-xs text-gray-400 mb-1">问题定义 v{problem.version}</div>
          <div>{problem.description}</div>
          {problem.expected_outcome && (
            <div className="text-xs text-gray-500 mt-1">期望：{problem.expected_outcome}</div>
          )}
        </div>
      )}

      {/* Assumptions */}
      <div>
        <div className="text-xs text-gray-400 mb-1">
          假设库 ({assumptions.length})
        </div>
        {assumptions.map(a => (
          <div key={a.id} className="flex items-start gap-1 py-1 border-b last:border-0">
            <button onClick={() => toggleAssumption(a.id, a.status)} className="shrink-0">
              {statusIcon(a.status)}
            </button>
            <span className={a.status === 'rejected' ? 'line-through text-gray-400' : ''}>
              {a.content}
            </span>
            {a.status !== 'rejected' && (
              <button onClick={() => rejectAssumption(a.id)}
                className="ml-auto shrink-0 text-xs text-red-400 hover:text-red-600">✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Risks */}
      <div>
        <div className="text-xs text-gray-400 mb-1">
          风险库 ({risks.length})
        </div>
        {risks.map(r => (
          <div key={r.id} className={`py-1 border-b last:border-0 ${riskColor(r.probability, r.severity)}`}>
            [{r.probability}/{r.severity}] {r.content}
          </div>
        ))}
      </div>

      {/* Causal Loop */}
      <CausalLoopDiagram sessionId={sessionId} />
    </div>
  );
}
