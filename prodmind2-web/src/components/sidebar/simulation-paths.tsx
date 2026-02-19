'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SimPath { id: string; label: string; steps: string[]; outcome: string }

export function SimulationPaths({ sessionId }: { sessionId: string }) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }
  const [paths, setPaths] = useState<SimPath[]>([]);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    const { data } = await sb()
      .from('simulation_paths').select('*').eq('session_id', sessionId);
    setPaths(data ?? []);
  }

  if (!paths.length) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400">推演路径</div>
      {paths.map(p => (
        <div key={p.id} className="rounded border p-2 text-xs">
          <div className="font-medium">{p.label}</div>
          <ol className="list-decimal ml-4 mt-1 text-gray-600">
            {p.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <div className="mt-1 text-gray-500">结果：{p.outcome}</div>
        </div>
      ))}
    </div>
  );
}
