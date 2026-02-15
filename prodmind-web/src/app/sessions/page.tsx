"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { NewSessionDialog } from "@/components/session/new-session-dialog";
import { SessionCard } from "@/components/session/session-card";
import type { SessionInfo } from "@/types";
import { MessageSquare } from "lucide-react";

export default function SessionsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        setSessions(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{t.session.title}</h1>
        <NewSessionDialog onCreated={(id) => router.push(`/sessions/${id}`)} />
      </div>

      {loading ? (
        <p className="text-neutral-400 text-sm">{t.common.loading}</p>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <MessageSquare className="h-12 w-12 mb-3" />
          <p className="text-sm">{t.session.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s as SessionInfo} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
