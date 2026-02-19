'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Node { id: string; label: string; type: 'assumption' | 'risk'; x: number; y: number }
interface Link { source: string; target: string }

export function CausalLoopDiagram({ sessionId }: { sessionId: string }) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    const { data: assumptions } = await sb()
      .from('assumptions').select('id, content, status').eq('session_id', sessionId);
    const { data: risks } = await sb()
      .from('risks').select('id, content').eq('session_id', sessionId);

    const a = (assumptions ?? []).map((item, i) => ({
      id: item.id, label: item.content.slice(0, 20),
      type: 'assumption' as const,
      x: 100 + (i % 3) * 120, y: 60 + Math.floor(i / 3) * 80,
    }));
    const r = (risks ?? []).map((item, i) => ({
      id: item.id, label: item.content.slice(0, 20),
      type: 'risk' as const,
      x: 100 + (i % 3) * 120, y: 250 + Math.floor(i / 3) * 80,
    }));

    setNodes([...a, ...r]);

    // Simple heuristic: link each risk to the nearest assumptions
    const ls: Link[] = [];
    for (const risk of r) {
      for (const ass of a.slice(0, 2)) {
        ls.push({ source: ass.id, target: risk.id });
      }
    }
    setLinks(ls);
  }

  if (!nodes.length) return null;

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-400 mb-1">因果循环图</div>
      <svg ref={svgRef} width="100%" height="200" viewBox="0 0 460 350" className="rounded border bg-gray-50">
        {links.map((l, i) => {
          const s = nodes.find(n => n.id === l.source);
          const t = nodes.find(n => n.id === l.target);
          if (!s || !t) return null;
          return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#ccc" strokeWidth={1} />;
        })}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={18}
              fill={n.type === 'assumption' ? '#dbeafe' : '#fee2e2'}
              stroke={n.type === 'assumption' ? '#3b82f6' : '#ef4444'}
              strokeWidth={1.5} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={8} fill="#333">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
