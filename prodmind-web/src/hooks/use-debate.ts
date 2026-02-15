"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSSE } from "./use-sse";
import type { SSEEvent, DebatePhase, DebateAction, MessageInfo, ConflictEventInfo } from "@/types";

interface RoleStream {
  role: string;
  content: string;
  complete: boolean;
}

interface DebateState {
  phase: DebatePhase;
  round: number;
  messages: MessageInfo[];
  conflicts: ConflictEventInfo[];
  streams: RoleStream[];
  converged: boolean | null;
  error: string | null;
}

export function useDebate(sessionId: string) {
  const { isStreaming, start, stop } = useSSE();
  const [state, setState] = useState<DebateState>({
    phase: "idle",
    round: 0,
    messages: [],
    conflicts: [],
    streams: [],
    converged: null,
    error: null,
  });
  const streamsRef = useRef<RoleStream[]>([]);
  const needsRefreshRef = useRef(false);

  const handleEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case "phase_change":
        setState((s) => ({
          ...s,
          phase: event.phase || s.phase,
          round: event.round ?? s.round,
        }));
        break;

      case "role_start": {
        const newStream: RoleStream = { role: event.role || "", content: "", complete: false };
        streamsRef.current = [...streamsRef.current, newStream];
        setState((s) => ({ ...s, streams: streamsRef.current }));
        break;
      }

      case "token": {
        const streams = streamsRef.current;
        const last = streams[streams.length - 1];
        if (last && last.role === event.role) {
          last.content += event.content || "";
          streamsRef.current = [...streams];
          setState((s) => ({ ...s, streams: streamsRef.current }));
        }
        break;
      }

      case "role_complete": {
        const streams = streamsRef.current;
        const idx = streams.findIndex((s) => s.role === event.role && !s.complete);
        if (idx >= 0) {
          streams[idx] = { ...streams[idx], content: event.content || streams[idx].content, complete: true };
          streamsRef.current = [...streams];
          setState((s) => ({ ...s, streams: streamsRef.current }));
        }
        break;
      }

      case "conflict_alert":
        setState((s) => ({
          ...s,
          conflicts: [
            ...s.conflicts,
            {
              id: Date.now(),
              sessionId,
              round: s.round,
              ruleType: event.conflictType || "unknown",
              detail: event.detail || "",
              userChoice: null,
              createdAt: new Date().toISOString(),
            } as ConflictEventInfo,
          ],
        }));
        break;

      case "convergence_check":
        setState((s) => ({ ...s, converged: event.converged ?? null }));
        break;

      case "error":
        setState((s) => ({ ...s, error: event.content || "Unknown error" }));
        break;

      case "done":
        needsRefreshRef.current = true;
        break;
    }
  }, [sessionId]);

  // When streaming ends and we received a done event, refresh from DB
  useEffect(() => {
    if (!isStreaming && needsRefreshRef.current) {
      needsRefreshRef.current = false;
      (async () => {
        try {
          const res = await fetch(`/api/sessions/${sessionId}`);
          if (!res.ok) return;
          const data = await res.json();
          streamsRef.current = [];
          setState((s) => ({
            ...s,
            phase: data.session.debatePhase || s.phase,
            round: data.session.currentRound || s.round,
            messages: data.messages || [],
            conflicts: data.conflicts || [],
            streams: [],
          }));
        } catch {
          // ignore
        }
      })();
    }
  }, [isStreaming, sessionId]);

  const sendAction = useCallback(
    async (action: Omit<DebateAction, "sessionId">) => {
      setState((s) => ({ ...s, error: null }));
      if (action.type === "start_round" || action.type === "next_round") {
        streamsRef.current = [];
        setState((s) => ({ ...s, streams: [], converged: null }));
      }
      await start("/api/debate", { ...action, sessionId }, handleEvent);
    },
    [sessionId, start, handleEvent]
  );

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setState((s) => ({
        ...s,
        phase: data.session.debatePhase || "idle",
        round: data.session.currentRound || 0,
        messages: data.messages || [],
        conflicts: data.conflicts || [],
      }));
    } catch {
      // ignore
    }
  }, [sessionId]);

  const refreshMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setState((s) => ({
        ...s,
        phase: data.session.debatePhase || s.phase,
        round: data.session.currentRound || s.round,
        messages: data.messages || [],
        conflicts: data.conflicts || [],
      }));
    } catch {
      // ignore
    }
  }, [sessionId]);

  return {
    ...state,
    isStreaming,
    sendAction,
    stop,
    loadSession,
    refreshMessages,
  };
}
