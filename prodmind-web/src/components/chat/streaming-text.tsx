"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

const ROLE_CONFIG: Record<string, { icon: string; colorClass: string }> = {
  architect: { icon: "🏗️", colorClass: "border-l-blue-500 bg-blue-50/50" },
  assassin: { icon: "⚔️", colorClass: "border-l-red-500 bg-red-50/50" },
  user_ghost: { icon: "👤", colorClass: "border-l-emerald-500 bg-emerald-50/50" },
  grounder: { icon: "📋", colorClass: "border-l-neutral-400 bg-neutral-50" },
};

interface StreamingTextProps {
  role: string;
  content: string;
  complete: boolean;
}

export function StreamingText({ role, content, complete }: StreamingTextProps) {
  const { t } = useI18n();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.grounder;
  const i18nKey = role === "user_ghost" ? "userGhost" : role;
  const label = (t.debate as Record<string, string>)[i18nKey] || role;

  return (
    <div className={cn("rounded-lg border-l-4 p-4", config.colorClass)}>
      <div className="flex items-center gap-2 mb-2">
        <span>{config.icon}</span>
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        {!complete && (
          <span className="inline-block w-2 h-4 bg-neutral-400 animate-pulse rounded-sm" />
        )}
      </div>
      <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
        {content || (
          <span className="text-neutral-400 italic">
            {role === "architect" && t.debate.architectWorking}
            {role === "assassin" && t.debate.assassinWorking}
            {role === "user_ghost" && t.debate.userGhostWorking}
            {role === "grounder" && t.debate.grounderWorking}
          </span>
        )}
      </div>
    </div>
  );
}
