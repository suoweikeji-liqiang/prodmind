'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

interface DiffProps {
  sessionId: string;
  versionA: number;
  versionB: number;
  onClose: () => void;
}

export function SnapshotDiff({ sessionId, versionA, versionB, onClose }: DiffProps) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  const [a, setA] = useState<Record<string, unknown> | null>(null);
  const [b, setB] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    load();
  }, [sessionId, versionA, versionB]);

  async function load() {
    const { data: da } = await sb()
      .from('snapshots').select('state_tree')
      .eq('session_id', sessionId).eq('version', versionA).single();
    const { data: db } = await sb()
      .from('snapshots').select('state_tree')
      .eq('session_id', sessionId).eq('version', versionB).single();
    setA(da?.state_tree ?? null);
    setB(db?.state_tree ?? null);
  }

  if (!a || !b) return null;

  const aStr = JSON.stringify(a, null, 2).split('\n');
  const bStr = JSON.stringify(b, null, 2).split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[80vh] w-[90vw] max-w-4xl overflow-auto rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">v{versionA} vs v{versionB}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <pre className="overflow-auto rounded bg-red-50 p-2 max-h-96">
            {aStr.join('\n')}
          </pre>
          <pre className="overflow-auto rounded bg-green-50 p-2 max-h-96">
            {bStr.join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
}
