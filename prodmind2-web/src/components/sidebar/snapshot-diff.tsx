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

interface DiffItem { key: string; a: string; b: string; changed: boolean }

function flattenObj(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flattenObj(v, `${prefix}[${i}]`)));
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      Object.assign(out, flattenObj(v, prefix ? `${prefix}.${k}` : k));
    }
  } else {
    out[prefix] = String(obj ?? '');
  }
  return out;
}

function computeDiff(a: Record<string, unknown> | null, b: Record<string, unknown> | null): DiffItem[] {
  const fa = flattenObj(a ?? {});
  const fb = flattenObj(b ?? {});
  const keys = [...new Set([...Object.keys(fa), ...Object.keys(fb)])].sort();
  return keys.map(key => ({
    key,
    a: fa[key] ?? '',
    b: fb[key] ?? '',
    changed: fa[key] !== fb[key],
  }));
}

export function SnapshotDiff({ sessionId, versionA, versionB, onClose }: DiffProps) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  const [items, setItems] = useState<DiffItem[]>([]);
  const [changesOnly, setChangesOnly] = useState(true);

  useEffect(() => { load(); }, [sessionId, versionA, versionB]);

  async function load() {
    const [{ data: da }, { data: db }] = await Promise.all([
      sb().from('snapshots').select('state_tree').eq('session_id', sessionId).eq('version', versionA).single(),
      sb().from('snapshots').select('state_tree').eq('session_id', sessionId).eq('version', versionB).single(),
    ]);
    setItems(computeDiff(da?.state_tree ?? null, db?.state_tree ?? null));
  }

  const visible = changesOnly ? items.filter(i => i.changed) : items;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[80vh] w-[90vw] max-w-3xl overflow-auto rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">v{versionA} vs v{versionB}</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input type="checkbox" checked={changesOnly}
                onChange={e => setChangesOnly(e.target.checked)} />
              仅显示变更
            </label>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">无差异</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-1 pr-2">字段</th>
                <th className="py-1 pr-2">v{versionA}</th>
                <th className="py-1">v{versionB}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(i => (
                <tr key={i.key} className={i.changed ? 'bg-yellow-50' : ''}>
                  <td className="py-1 pr-2 font-mono text-gray-500 whitespace-nowrap">{i.key}</td>
                  <td className={`py-1 pr-2 ${i.changed ? 'text-red-600 line-through' : ''}`}>{i.a}</td>
                  <td className={`py-1 ${i.changed ? 'text-green-700 font-medium' : ''}`}>{i.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
