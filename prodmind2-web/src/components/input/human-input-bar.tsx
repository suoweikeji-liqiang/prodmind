'use client';

import { useState } from 'react';

interface Props {
  onRespond: (text: string) => void;
  onModify: (goal: string, expected: string) => void;
  onForce: () => void;
  onEnd: () => void;
  disabled: boolean;
}

export function HumanInputBar({ onRespond, onModify, onForce, onEnd, disabled }: Props) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'respond' | 'modify'>('respond');

  return (
    <div className="border-t bg-white p-3 space-y-2">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={mode === 'respond' ? '回应质疑...' : '输入新的决策目标...'}
          disabled={disabled}
          className="flex-1 rounded border px-3 py-2 text-sm disabled:opacity-50"
          onKeyDown={e => {
            if (e.key === 'Enter' && text.trim()) {
              onRespond(text.trim());
              setText('');
            }
          }}
        />
        <button
          onClick={() => { if (text.trim()) { onRespond(text.trim()); setText(''); } }}
          disabled={disabled || !text.trim()}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          发送
        </button>
      </div>
      <div className="flex gap-2 text-xs">
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
