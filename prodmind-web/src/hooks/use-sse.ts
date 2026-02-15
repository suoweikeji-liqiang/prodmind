import { useCallback, useRef, useState } from "react";
import type { SSEEvent } from "@/types";

export function useSSE() {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (
      url: string,
      body: unknown,
      onEvent?: (event: SSEEvent) => void
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      setEvents([]);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const err: SSEEvent = { type: "error", content: `HTTP ${res.status}` };
          setEvents([err]);
          onEvent?.(err);
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataLine = line.trim();
            if (!dataLine.startsWith("data: ")) continue;
            try {
              const event: SSEEvent = JSON.parse(dataLine.slice(6));
              setEvents((prev) => [...prev, event]);
              onEvent?.(event);
            } catch {
              // skip malformed
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : String(err);
        const errEvent: SSEEvent = { type: "error", content: msg };
        setEvents((prev) => [...prev, errEvent]);
        onEvent?.(errEvent);
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { events, isStreaming, start, stop };
}
