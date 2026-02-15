"use client";

import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/context";
import type { SessionInfo } from "@/types";

interface SessionCardProps {
  session: SessionInfo;
  onDelete: (id: string) => void;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const { t } = useI18n();
  const statusLabel =
    session.status === "active"
      ? t.session.status.active
      : session.status === "completed"
        ? t.session.status.completed
        : t.session.status.archived;

  const statusColor =
    session.status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : session.status === "completed"
        ? "bg-blue-100 text-blue-700"
        : "bg-neutral-100 text-neutral-500";

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors">
      <div className="rounded-lg bg-neutral-100 p-2">
        <MessageSquare className="h-5 w-5 text-neutral-500" />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/sessions/${session.id}`} className="block">
          <h3 className="font-medium text-neutral-900 truncate hover:text-blue-600 transition-colors">
            {session.title}
          </h3>
          <p className="text-sm text-neutral-500 truncate mt-0.5">{session.idea}</p>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor}`}>{statusLabel}</span>
          <span className="text-xs text-neutral-400">
            {session.currentRound} {t.session.rounds}
          </span>
          <span className="text-xs text-neutral-400">
            {new Date(session.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500"
        onClick={(e) => {
          e.preventDefault();
          onDelete(session.id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
