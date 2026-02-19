'use client';

import { useState } from 'react';
import type { AgentName } from '@/types';
import { AGENT_CONFIG, ALL_AGENTS } from '@/types';

interface Props {
  onRespond: (text: string) => void;
  onModify: (goal: string, expected: string) => void;
  onReject: (agent: AgentName, reason: string) => void;
  onForce: () => void;
  onEnd: () => void;
  disabled: boolean;
}

export function HumanInputBar({ onRespond, onModify, onReject, onForce, onEnd, disabled }: Props) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'respond' | 'modify' | 'reject'>('respond');
  const [expected, setExpected] = useState('');
  const [rejectAgent, setRejectAgent] = useState<AgentName>('devils-advocate');

  function submit() {
    if (!text.trim()) return;
    if (mode === 'respond') { onRespond(text.trim()); }
    else if (mode === 'modify') { onModify(text.trim(), expected.trim()); setExpected(''); }
    else if (mode === 'reject') { onReject(rejectAgent, text.trim()); }
    setText('');
    setMode('respond');
  }

  const placeholders = {
    respond: '回应质疑...',
    modify: '输入新的决策目标...',
    reject: '输入驳回理由...',
  };

  return (
    <div className="border-t bg-white p-3 space-y-2">
      {mode === 'modify' && (
        <input value={expected} onChange={e => setExpected(e.target.value)}
          placeholder="期望结果（可选）" disabled={disabled}
          className="w-full rounded border px-3 py-1.5 text-sm disabled:opacity-50" />
      )}
      {mode === 'reject' && (
        <select value={rejectAgent} onChange={e => setRejectAgent(e.target.value as AgentName)}
          className="rounded border px-2 py-1 text-sm">
          {ALL_AGENTS.map(a => (
            <option key={a} value={a}>{AGENT_CONFIG[a].label}</option>
          ))}
        </select>
      )}
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder={placeholders[mode]} disabled={disabled}
          className="flex-1 rounded border px-3 py-2 text-sm disabled:opacity-50"
          onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
        <button onClick={submit} disabled={disabled || !text.trim()}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">
          发送
        </button>
      </div>
      <div className="flex gap-2 text-xs">
        {(['respond', 'modify', 'reject'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} disabled={disabled}
            className={`rounded border px-2 py-1 ${mode === m ? 'bg-gray-100 font-medium' : 'text-gray-600 hover:bg-gray-50'} disabled:opacity-50`}>
            {{ respond: '回应质疑', modify: '修改目标', reject: '驳回结论' }[m]}
          </button>
        ))}
        <button onClick={onForce} disabled={disabled}
          className="rounded border px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          强制推进
        </button>
        <button onClick={onEnd} disabled={disabled}
          className="rounded border px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50">
          结束会话
        </button>
      </div>
    </div>
  );
}
