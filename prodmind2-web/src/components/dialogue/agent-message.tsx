'use client';

import { AGENT_CONFIG } from '@/types';
import type { AgentName } from '@/types';

export function AgentMessage({
  agent,
  content,
  isStreaming,
}: {
  agent: AgentName;
  content: string;
  isStreaming?: boolean;
}) {
  const cfg = AGENT_CONFIG[agent];
  return (
    <div className={`rounded-lg p-4 text-sm ${cfg.bgClass}`}>
      <div className={`font-semibold mb-1 ${cfg.textClass}`}>
        {cfg.label}
      </div>
      <div className="whitespace-pre-wrap text-gray-800">
        {content}
        {isStreaming && <span className="animate-pulse">▊</span>}
      </div>
    </div>
  );
}
