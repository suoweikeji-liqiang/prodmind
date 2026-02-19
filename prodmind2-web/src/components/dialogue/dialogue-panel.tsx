'use client';

import { useRef, useEffect } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { AgentMessage } from './agent-message';
import type { AgentName } from '@/types';

export function DialoguePanel() {
  const { agentComments, streaming, activeAgent, round } = useSessionStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentComments.length, streaming]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {agentComments.map((c, i) => (
        <div key={i}>
          {i === 0 || agentComments[i - 1].round !== c.round ? (
            <div className="text-center text-xs text-gray-400 my-3">
              ── 第{c.round}轮 ──
            </div>
          ) : null}
          <AgentMessage agent={c.agent} content={c.content} />
        </div>
      ))}
      {activeAgent && (
        <AgentMessage
          agent={activeAgent}
          content={streaming.get(activeAgent) ?? ''}
          isStreaming
        />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
