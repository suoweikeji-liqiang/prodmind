"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDebate } from "@/hooks/use-debate";
import { useI18n } from "@/i18n/context";
import { MessageList } from "@/components/chat/message-list";
import { UserInput } from "@/components/chat/user-input";
import { ConflictAlert } from "@/components/chat/conflict-alert";
import { OutputPanel } from "@/components/panel/output-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Play, SkipForward, Square } from "lucide-react";
import Link from "next/link";
import type { ConflictRuleType } from "@/types";

export default function DebateSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { t } = useI18n();

  const {
    phase,
    round,
    messages,
    conflicts,
    streams,
    converged,
    error,
    isStreaming,
    sendAction,
    loadSession,
  } = useDebate(sessionId);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Phase status text for loading indicator
  const phaseStatusText = isStreaming
    ? phase === "architect"
      ? t.debate.architectWorking
      : phase === "attacking"
        ? t.debate.assassinWorking
        : phase === "grounding"
          ? t.debate.grounderWorking
          : t.common.loading
    : null;

  const handleStartRound = useCallback(() => {
    sendAction({ type: "start_round" });
  }, [sendAction]);

  const handleUserConfirm = useCallback(
    (content: string) => {
      sendAction({ type: "user_confirm", content });
    },
    [sendAction]
  );

  const handleUserResponse = useCallback(
    (content: string) => {
      sendAction({ type: "user_response", content });
    },
    [sendAction]
  );

  const handleConflictResolve = useCallback(
    (choice: string, content: string) => {
      sendAction({ type: "conflict_choice", choice, content });
    },
    [sendAction]
  );

  const handleNextRound = useCallback(() => {
    sendAction({ type: "next_round" });
  }, [sendAction]);

  const handleEndSession = useCallback(() => {
    sendAction({ type: "end_session" });
  }, [sendAction]);

  const handleExport = useCallback(
    async (format: "md" | "json") => {
      const res = await fetch(`/api/sessions/${sessionId}/export?format=${format}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prodmind-${sessionId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [sessionId]
  );

  // Find pending conflict alerts that need user interaction
  const pendingConflicts = useMemo(() => {
    if (phase !== "conflict_check" && phase !== "user_response") return [];
    return conflicts
      .filter((c) => c.round === round && !c.userChoice)
      .map((c) => c.ruleType as ConflictRuleType);
  }, [conflicts, phase, round]);

  const latestConflict = pendingConflicts[0];
  const latestConflictDetail = useMemo(() => {
    if (!latestConflict) return undefined;
    const c = conflicts.find((c) => c.round === round && c.ruleType === latestConflict && !c.userChoice);
    return c?.detail;
  }, [conflicts, latestConflict, round]);

  // Streaming grounder content for the output panel
  const streamingGrounder = useMemo(() => {
    const gs = streams.find((s) => s.role === "grounder");
    return gs?.content;
  }, [streams]);

  const showInput =
    !isStreaming &&
    (phase === "user_confirm" || phase === "user_response");

  const showRoundControls = !isStreaming && phase === "round_complete";
  const showStartButton = !isStreaming && phase === "idle" && round === 0;
  const isCompleted = phase === "idle" && round > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 bg-white">
        <div className="flex items-center gap-3">
          <Link href="/sessions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <span className="text-sm font-medium">
              {round > 0 ? t.debate.round.replace("{n}", String(round)) : t.common.sessions}
            </span>
            {converged === true && (
              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                Converged
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleExport("md")} className="gap-1 text-xs">
            <Download className="h-3 w-3" />
            {t.export.markdown}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport("json")} className="gap-1 text-xs">
            <Download className="h-3 w-3" />
            {t.export.json}
          </Button>
        </div>
      </div>

      {/* Main content: 70/30 split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat panel (70%) */}
        <div className="flex flex-col w-[70%]">
          <MessageList messages={messages} streams={streams} round={round} />

          {/* Loading indicator when streaming but no SSE events yet */}
          {isStreaming && streams.length === 0 && (
            <div className="px-4 pb-2">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-sm text-neutral-500">{phaseStatusText}</span>
              </div>
            </div>
          )}

          {/* Streaming phase status */}
          {isStreaming && streams.length > 0 && phaseStatusText && (
            <div className="px-4 pb-1">
              <span className="text-xs text-neutral-400">{phaseStatusText}</span>
            </div>
          )}

          {/* Conflict alerts */}
          {latestConflict && (
            <div className="px-4 pb-2">
              <ConflictAlert
                type={latestConflict}
                detail={latestConflictDetail}
                onResolve={handleConflictResolve}
              />
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="px-4 pb-2">
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          {/* Start button */}
          {showStartButton && (
            <div className="p-4 flex justify-center">
              <Button onClick={handleStartRound} className="gap-2">
                <Play className="h-4 w-4" />
                {t.debate.round.replace("{n}", "1")}
              </Button>
            </div>
          )}

          {/* User input */}
          {showInput && phase === "user_confirm" && (
            <UserInput phase={phase} onSend={handleUserConfirm} disabled={isStreaming} />
          )}
          {showInput && phase === "user_response" && (
            <UserInput
              phase={phase}
              onSend={handleUserResponse}
              disabled={isStreaming}
              requireMinLength
            />
          )}

          {/* Round controls */}
          {showRoundControls && (
            <div className="border-t border-neutral-200 bg-white p-4 flex items-center justify-center gap-3">
              {round < 5 ? (
                <>
                  <Button onClick={handleNextRound} className="gap-1.5">
                    <SkipForward className="h-4 w-4" />
                    {t.debate.nextRound}
                  </Button>
                  <Button variant="outline" onClick={handleEndSession} className="gap-1.5">
                    <Square className="h-4 w-4" />
                    {t.debate.endSession}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-neutral-500 mb-2">{t.debate.maxRoundsReached}</p>
                  <Button variant="outline" onClick={handleEndSession} className="gap-1.5">
                    <Square className="h-4 w-4" />
                    {t.debate.endSession}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Completed state */}
          {isCompleted && (
            <div className="border-t border-neutral-200 bg-white p-4 text-center">
              <p className="text-sm text-neutral-500">{t.session.status.completed}</p>
            </div>
          )}
        </div>

        {/* Right: Output panel (30%) */}
        <div className="w-[30%]">
          <OutputPanel
            messages={messages}
            conflicts={conflicts}
            streamingGrounder={streamingGrounder}
          />
        </div>
      </div>
    </div>
  );
}
