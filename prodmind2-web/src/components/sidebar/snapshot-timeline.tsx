'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Snapshot {
  id: string;
  version: number;
  trigger: string;
  human_judgment: string;
  created_at: string;
}

export function SnapshotTimeline({
  sessionId,
  onCompare,
}: {
  sessionId: string;
  onCompare: (a: number, b: number) => void;
}) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    const { data } = await sb()
      .from('snapshots').select('id, version, trigger, human_judgment, created_at')
      .eq('session_id', sessionId).order('version', { ascending: false });
    setSnapshots(data ?? []);
  }

  useEffect(() => {
    const ch = sb().channel(`snap-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'snapshots', filter: `session_id=eq.${sessionId}` }, () => load())
      .subscribe();
    return () => { sb().removeChannel(ch); };
  }, [sessionId]);

  function toggle(ver: number) {
    setSelected(prev => {
      if (prev.includes(ver)) return prev.filter(v => v !== ver);
      const next = [...prev, ver].slice(-2);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400">快照历史</div>
      {snapshots.map(s => (
        <button key={s.id} onClick={() => toggle(s.version)}
          className={`block w-full text-left rounded border p-2 text-xs ${selected.includes(s.version) ? 'border-gray-800 bg-gray-50' : ''}`}>
          <div className="font-medium">v{s.version} · {s.created_at.slice(11, 16)}</div>
          <div className="text-gray-500">{s.trigger}</div>
        </button>
      ))}
      {selected.length === 2 && (
        <button onClick={() => onCompare(selected[0], selected[1])}
          className="w-full rounded bg-gray-900 py-1 text-xs text-white">
          对比 v{selected[0]} vs v{selected[1]}
        </button>
      )}
    </div>
  );
}
