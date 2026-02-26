'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Node { id: string; label: string; type: 'assumption' | 'risk'; x: number; y: number }
interface Link { source: string; target: string }

const W = 400, H = 280, CX = W / 2, CY = H / 2;

function radialLayout(items: { id: string; label: string; type: 'assumption' | 'risk' }[]): Node[] {
  const assumptions = items.filter(i => i.type === 'assumption');
  const risks = items.filter(i => i.type === 'risk');
  const nodes: Node[] = [];
  // Assumptions on inner ring
  assumptions.forEach((a, i) => {
    const angle = (2 * Math.PI * i) / Math.max(assumptions.length, 1) - Math.PI / 2;
    nodes.push({ ...a, x: CX + Math.cos(angle) * 80, y: CY + Math.sin(angle) * 60 });
  });
  // Risks on outer ring
  risks.forEach((r, i) => {
    const angle = (2 * Math.PI * i) / Math.max(risks.length, 1) - Math.PI / 2 + (risks.length > 0 ? Math.PI / risks.length : 0);
    nodes.push({ ...r, x: CX + Math.cos(angle) * 150, y: CY + Math.sin(angle) * 110 });
  });
  return nodes;
}

export function CausalLoopDiagram({ sessionId }: { sessionId: string }) {
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => { load(); }, [sessionId]);

  async function load() {
    const { data: assumptions } = await sb()
      .from('assumptions').select('id, content, status').eq('session_id', sessionId);
    const { data: risks } = await sb()
      .from('risks').select('id, content').eq('session_id', sessionId);

    const items = [
      ...(assumptions ?? []).map(a => ({ id: a.id, label: a.content.slice(0, 12), type: 'assumption' as const })),
      ...(risks ?? []).map(r => ({ id: r.id, label: r.content.slice(0, 12), type: 'risk' as const })),
    ];
    const laid = radialLayout(items);
    setNodes(laid);

    const aIds = (assumptions ?? []).map(a => a.id);
    const ls: Link[] = [];
    for (const r of (risks ?? [])) {
      for (const aId of aIds.slice(0, 2)) {
        ls.push({ source: aId, target: r.id });
      }
    }
    setLinks(ls);
  }

  if (!nodes.length) return null;

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-400 mb-1">因果循环图</div>
      <svg width="100%" height="200" viewBox={`0 0 ${W} ${H}`} className="rounded border bg-gray-50">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX={28} refY={5}
            markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#aaa" />
          </marker>
        </defs>
        {links.map((l, i) => {
          const s = nodes.find(n => n.id === l.source);
          const t = nodes.find(n => n.id === l.target);
          if (!s || !t) return null;
          return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
            stroke="#bbb" strokeWidth={1} markerEnd="url(#arrow)" />;
        })}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={20}
              fill={n.type === 'assumption' ? '#dbeafe' : '#fee2e2'}
              stroke={n.type === 'assumption' ? '#3b82f6' : '#ef4444'}
              strokeWidth={1.5} />
            <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize={7} fill="#333">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
