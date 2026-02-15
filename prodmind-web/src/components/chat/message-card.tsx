"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

const ROLE_CONFIG: Record<string, { icon: string; colorClass: string }> = {
  architect: { icon: "🏗️", colorClass: "border-l-blue-500 bg-blue-50/50" },
  assassin: { icon: "⚔️", colorClass: "border-l-red-500 bg-red-50/50" },
  user_ghost: { icon: "👤", colorClass: "border-l-emerald-500 bg-emerald-50/50" },
  grounder: { icon: "📋", colorClass: "border-l-neutral-400 bg-neutral-50" },
  user: { icon: "💬", colorClass: "border-l-violet-500 bg-violet-50/50" },
  system: { icon: "⚙️", colorClass: "border-l-amber-500 bg-amber-50/50" },
};

interface MessageCardProps {
  role: string;
  content: string;
}

export function MessageCard({ role, content }: MessageCardProps) {
  const { t } = useI18n();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.system;
  const i18nKey = role === "user_ghost" ? "userGhost" : role;
  const label = (t.debate as Record<string, string>)[i18nKey] || role;

  return (
    <div className={cn("rounded-lg border-l-4 p-4", config.colorClass)}>
      <div className="flex items-center gap-2 mb-2">
        <span>{config.icon}</span>
        <span className="text-sm font-medium text-neutral-700">{label}</span>
      </div>
      <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
        {content}
      </div>
    </div>
  );
}
