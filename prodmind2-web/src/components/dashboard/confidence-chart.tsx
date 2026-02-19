'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Point { version: number; confidence: number }

export function ConfidenceChart({ sessionId }: { sessionId: string }) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    const { data } = await sb()
      .from('snapshots').select('version, state_tree')
      .eq('session_id', sessionId).order('version', { ascending: true });
    if (!data) return;
    setPoints(data.map(s => ({
      version: s.version,
      confidence: (s.state_tree as Record<string, unknown>)?.confidenceIndex as number ?? 0,
    })));
  }

  if (points.length < 2) return null;

  const W = 280, H = 100, PX = 30, PY = 10;
  const maxV = points.length - 1;
  const x = (i: number) => PX + (i / maxV) * (W - PX * 2);
  const y = (v: number) => PY + (1 - v / 100) * (H - PY * 2);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.confidence)}`).join(' ');

  return (
    <div className="mt-3">
      <div className="text-xs text-gray-400 mb-1">信心指数趋势</div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="rounded border bg-gray-50">
        {/* Y axis labels */}
        <text x={4} y={PY + 4} fontSize={8} fill="#999">100</text>
        <text x={4} y={H - PY + 4} fontSize={8} fill="#999">0</text>
        {/* Grid lines */}
        <line x1={PX} y1={y(50)} x2={W - PX} y2={y(50)} stroke="#e5e7eb" strokeDasharray="3" />
        {/* Line */}
        <path d={line} fill="none" stroke="#1f2937" strokeWidth={1.5} />
        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.confidence)} r={3} fill="#1f2937" />
            <text x={x(i)} y={y(p.confidence) - 6} textAnchor="middle" fontSize={7} fill="#666">
              {p.confidence}%
            </text>
          </g>
        ))}
        {/* X axis labels */}
        {points.map((p, i) => (
          <text key={i} x={x(i)} y={H - 1} textAnchor="middle" fontSize={7} fill="#999">
            v{p.version}
          </text>
        ))}
      </svg>
    </div>
  );
}
