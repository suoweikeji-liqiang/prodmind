'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebate } from '@/hooks/use-debate';
import { DialoguePanel } from '@/components/dialogue/dialogue-panel';
import { HumanInputBar } from '@/components/input/human-input-bar';
import { StateTreePanel } from '@/components/tree/state-tree-panel';
import { SnapshotTimeline } from '@/components/sidebar/snapshot-timeline';
import { SnapshotDiff } from '@/components/sidebar/snapshot-diff';
import { SimulationPaths } from '@/components/sidebar/simulation-paths';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentName } from '@/types';

export function WarRoom({ sessionId }: { sessionId: string }) {
  const { startRound, isRunning, round, confidenceIndex, setSession } = useDebate();
  const [diff, setDiff] = useState<{ a: number; b: number } | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'tree' | 'snap' | null>(null);
  const sbRef = useRef<SupabaseClient | null>(null);
  function sb() { return (sbRef.current ??= createClient()); }

  useEffect(() => { setSession(sessionId); }, [sessionId, setSession]);

  async function handleModify(goal: string, expected: string) {
    const { data: existing } = await sb()
      .from('problem_definitions').select('version')
      .eq('session_id', sessionId).order('version', { ascending: false }).limit(1);
    const nextVer = (existing?.[0]?.version ?? 0) + 1;
    await sb().from('problem_definitions').insert({
      session_id: sessionId, version: nextVer,
      description: goal, expected_outcome: expected,
    });
    startRound(sessionId);
  }

  async function handleReject(agent: AgentName, reason: string) {
    await sb().from('agent_comments').insert({
      session_id: sessionId, round, agent: agent,
      content: `[用户驳回] ${reason}`,
    });
    startRound(sessionId);
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2 md:px-4 md:py-3">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-base md:text-lg font-bold">作战室</h1>
          <span className="text-xs md:text-sm text-gray-500">第{round}轮</span>
          <span className="text-xs md:text-sm text-gray-500">{confidenceIndex}%</span>
        </div>
        <div className="flex gap-2 md:gap-3">
          {/* Mobile panel toggles */}
          <button onClick={() => setMobilePanel(mobilePanel === 'tree' ? null : 'tree')}
            className="md:hidden rounded border px-2 py-1 text-xs text-gray-600">
            状态树
          </button>
          <button onClick={() => setMobilePanel(mobilePanel === 'snap' ? null : 'snap')}
            className="md:hidden rounded border px-2 py-1 text-xs text-gray-600">
            快照
          </button>
          <a href={`/api/sessions/${sessionId}/export`}
            className="hidden md:inline-block rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
            导出
          </a>
          <button onClick={() => startRound(sessionId)} disabled={isRunning}
            className="rounded bg-gray-900 px-2 md:px-3 py-1 text-xs md:text-sm text-white disabled:opacity-50">
            {isRunning ? '分析中...' : round === 0 ? '开始' : '下一轮'}
          </button>
          <a href="/sessions" className="text-xs md:text-sm text-gray-500 underline leading-8">返回</a>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: State Tree (hidden on mobile, toggle via button) */}
        <div className={`${mobilePanel === 'tree' ? 'absolute inset-0 z-30 bg-white' : 'hidden'} md:block md:static md:w-1/4 border-r overflow-hidden`}>
          <StateTreePanel sessionId={sessionId} />
        </div>

        {/* Center: Dialogue + Input */}
        <div className="flex flex-1 flex-col min-w-0">
          <DialoguePanel />
          <HumanInputBar
            onRespond={async (text: string) => {
              await sb().from('agent_comments').insert({
                session_id: sessionId, round, agent: 'problem-architect',
                content: `[用户回应] ${text}`,
              });
              startRound(sessionId);
            }}
            onModify={handleModify}
            onReject={handleReject}
            onForce={() => startRound(sessionId)}
            onEnd={() => { window.location.href = '/sessions'; }}
            disabled={isRunning}
          />
        </div>

        {/* Right: Snapshots + Simulation (hidden on mobile, toggle via button) */}
        <div className={`${mobilePanel === 'snap' ? 'absolute inset-0 z-30 bg-white' : 'hidden'} md:block md:static md:w-1/4 border-l overflow-y-auto p-3 space-y-4`}>
          <SimulationPaths sessionId={sessionId} />
          <SnapshotTimeline sessionId={sessionId}
            onCompare={(a, b) => setDiff({ a, b })} />
        </div>
      </div>

      {/* Snapshot diff modal */}
      {diff && (
        <SnapshotDiff sessionId={sessionId}
          versionA={diff.a} versionB={diff.b}
          onClose={() => setDiff(null)} />
      )}
    </div>
  );
}
