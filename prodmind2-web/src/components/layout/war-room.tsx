'use client';

import { useEffect, useState } from 'react';
import { useDebate } from '@/hooks/use-debate';
import { DialoguePanel } from '@/components/dialogue/dialogue-panel';
import { HumanInputBar } from '@/components/input/human-input-bar';
import { StateTreePanel } from '@/components/tree/state-tree-panel';
import { SnapshotTimeline } from '@/components/sidebar/snapshot-timeline';
import { SnapshotDiff } from '@/components/sidebar/snapshot-diff';
import { SimulationPaths } from '@/components/sidebar/simulation-paths';

export function WarRoom({ sessionId }: { sessionId: string }) {
  const { startRound, isRunning, round, confidenceIndex, setSession } = useDebate();
  const [diff, setDiff] = useState<{ a: number; b: number } | null>(null);

  useEffect(() => { setSession(sessionId); }, [sessionId, setSession]);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">作战室</h1>
          <span className="text-sm text-gray-500">第{round}轮</span>
          <span className="text-sm text-gray-500">信心 {confidenceIndex}%</span>
        </div>
        <div className="flex gap-3">
          <a href={`/api/sessions/${sessionId}/export`}
            className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
            导出
          </a>
          <button onClick={() => startRound(sessionId)} disabled={isRunning}
            className="rounded bg-gray-900 px-3 py-1 text-sm text-white disabled:opacity-50">
            {isRunning ? '分析中...' : round === 0 ? '开始辩论' : '下一轮'}
          </button>
          <a href="/sessions" className="text-sm text-gray-500 underline leading-8">返回</a>
        </div>
      </div>

      {/* 3-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: State Tree */}
        <div className="w-1/4 border-r overflow-hidden">
          <StateTreePanel sessionId={sessionId} />
        </div>

        {/* Center: Dialogue + Input */}
        <div className="flex flex-1 flex-col">
          <DialoguePanel />
          <HumanInputBar
            onRespond={() => startRound(sessionId)}
            onModify={() => {}}
            onForce={() => startRound(sessionId)}
            onEnd={() => { window.location.href = '/sessions'; }}
            disabled={isRunning}
          />
        </div>

        {/* Right: Snapshots + Simulation */}
        <div className="w-1/4 border-l overflow-y-auto p-3 space-y-4">
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
