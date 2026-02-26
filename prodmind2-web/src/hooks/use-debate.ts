import { useCallback } from 'react';
import { useSessionStore } from '@/stores/session-store';

export function useDebate() {
  const store = useSessionStore();

  const startRound = useCallback(async (sessionId: string) => {
    const s = useSessionStore.getState();
    s.setRunning(true);

    const res = await fetch('/api/debate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    if (!res.ok || !res.body) {
      useSessionStore.getState().setRunning(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const data = line.replace(/^data: /, '').trim();
        if (!data) continue;
        try {
          const event = JSON.parse(data);
          const actions = useSessionStore.getState();
          switch (event.type) {
            case 'agents_scheduled':
              actions.onAgentsScheduled(event.agents, event.round);
              break;
            case 'role_start':
              actions.onRoleStart(event.agent);
              break;
            case 'token':
              actions.onToken(event.agent, event.content);
              break;
            case 'role_complete':
              actions.onRoleComplete(event.agent);
              break;
            case 'state_update':
              actions.onStateUpdate(event.confidenceIndex);
              break;
            case 'done':
              actions.onDone();
              break;
          }
        } catch { /* skip malformed */ }
      }
    }

    useSessionStore.getState().setRunning(false);
  }, []);

  return { startRound, ...store };
}
