"use client";

import { useEffect, useRef } from "react";
import type { MessageInfo } from "@/types";
import { MessageCard } from "./message-card";
import { StreamingText } from "./streaming-text";
import { useI18n } from "@/i18n/context";

interface RoleStream {
  role: string;
  content: string;
  complete: boolean;
}

interface MessageListProps {
  messages: MessageInfo[];
  streams: RoleStream[];
  round: number;
}

export function MessageList({ messages, streams, round }: MessageListProps) {
  const { t } = useI18n();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streams]);

  // Group messages by round
  const maxRound = Math.max(...messages.map((m) => m.round), round, 0);
  const rounds: { round: number; msgs: MessageInfo[] }[] = [];
  for (let r = 1; r <= maxRound; r++) {
    rounds.push({ round: r, msgs: messages.filter((m) => m.round === r) });
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {rounds.map((r) => (
        <div key={r.round}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-medium text-neutral-400">
              {t.debate.round.replace("{n}", String(r.round))}
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          <div className="space-y-3">
            {r.msgs.map((msg) => (
              <MessageCard key={msg.id} role={msg.role} content={msg.content} />
            ))}
          </div>
        </div>
      ))}

      {/* Active streams */}
      {streams.length > 0 && (
        <div className="space-y-3">
          {round > maxRound && (
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium text-neutral-400">
                {t.debate.round.replace("{n}", String(round))}
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
          )}
          {streams.map((s, i) => (
            <StreamingText key={`${s.role}-${i}`} role={s.role} content={s.content} complete={s.complete} />
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
