"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n/context";
import type { MessageInfo, ConflictEventInfo } from "@/types";

interface OutputPanelProps {
  messages: MessageInfo[];
  conflicts: ConflictEventInfo[];
  streamingGrounder?: string;
}

function parseGrounderSection(content: string, sectionPattern: RegExp): string {
  const match = content.match(sectionPattern);
  if (!match) return "";
  return match[1].trim();
}

export function OutputPanel({ messages, conflicts, streamingGrounder }: OutputPanelProps) {
  const { t } = useI18n();

  const latestGrounder = useMemo(() => {
    const grounderMsgs = messages.filter((m) => m.role === "grounder");
    const latest = grounderMsgs[grounderMsgs.length - 1];
    return latest?.content || streamingGrounder || "";
  }, [messages, streamingGrounder]);

  const hypotheses = useMemo(
    () => parseGrounderSection(latestGrounder, /##\s*当前最强假设[^\n]*\n([\s\S]*?)(?=\n##|$)/),
    [latestGrounder]
  );

  const mvp = useMemo(
    () => parseGrounderSection(latestGrounder, /##\s*MVP边界[^\n]*\n([\s\S]*?)(?=\n##|$)/),
    [latestGrounder]
  );

  const actions = useMemo(
    () => parseGrounderSection(latestGrounder, /##\s*下一步行动[^\n]*\n([\s\S]*?)(?=\n##|$)/),
    [latestGrounder]
  );

  return (
    <div className="h-full flex flex-col border-l border-neutral-200 bg-neutral-50/50">
      <Tabs defaultValue="hypotheses" className="flex flex-col h-full">
        <div className="px-3 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="hypotheses" className="flex-1 text-xs">
              {t.panel.hypotheses}
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="flex-1 text-xs">
              {t.panel.conflicts}
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex-1 text-xs">
              {t.panel.actions}
            </TabsTrigger>
            <TabsTrigger value="mvp" className="flex-1 text-xs">
              {t.panel.mvp}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <TabsContent value="hypotheses">
            {hypotheses ? (
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-neutral-700">{hypotheses}</div>
            ) : (
              <p className="text-sm text-neutral-400 italic">{t.panel.noData}</p>
            )}
          </TabsContent>

          <TabsContent value="conflicts">
            {conflicts.length > 0 ? (
              <div className="space-y-2">
                {conflicts.map((c) => (
                  <div key={c.id} className="rounded border border-neutral-200 bg-white p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                        {c.ruleType}
                      </span>
                      <span className="text-xs text-neutral-400">R{c.round}</span>
                    </div>
                    <p className="text-neutral-700">{c.detail}</p>
                    {c.userChoice && (
                      <p className="text-neutral-500 mt-1 text-xs">→ {c.userChoice}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">{t.panel.noData}</p>
            )}
          </TabsContent>

          <TabsContent value="actions">
            {actions ? (
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-neutral-700">{actions}</div>
            ) : (
              <p className="text-sm text-neutral-400 italic">{t.panel.noData}</p>
            )}
          </TabsContent>

          <TabsContent value="mvp">
            {mvp ? (
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-neutral-700">{mvp}</div>
            ) : (
              <p className="text-sm text-neutral-400 italic">{t.panel.noData}</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
