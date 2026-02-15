"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n/context";
import type { ConflictRuleType } from "@/types";

interface ConflictAlertProps {
  type: ConflictRuleType;
  detail?: string;
  onResolve: (choice: string, content: string) => void;
}

export function ConflictAlert({ type, detail, onResolve }: ConflictAlertProps) {
  const { t } = useI18n();
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const setInput = (key: string, val: string) => setInputs((p) => ({ ...p, [key]: val }));

  if (type === "alternative_hypothesis") {
    let alt = { source: "", content: "" };
    if (detail) {
      try {
        alt = JSON.parse(detail);
      } catch {
        // DB stores plain text like "刺客: 内容", parse it
        const colonIdx = detail.indexOf(": ");
        alt = colonIdx >= 0
          ? { source: detail.slice(0, colonIdx), content: detail.slice(colonIdx + 2) }
          : { source: "", content: detail };
      }
    }
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-medium">
          <AlertTriangle className="h-4 w-4" />
          {t.conflict.altHypothesis}
        </div>
        <p className="text-sm text-amber-800">
          {t.conflict.altHypothesisDesc.replace("{source}", alt.source).replace("{content}", alt.content)}
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve("accept", `[用户承认替代假设] 原假设降级。替代假设"${alt.content}"升级为主要假设。`)}
          >
            {t.conflict.accept}
          </Button>
          <div className="space-y-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!inputs.counter || inputs.counter.length < 20}
              onClick={() => onResolve("counter", `[用户反驳替代假设] 反证：${inputs.counter}`)}
            >
              {t.conflict.counter}
            </Button>
            <Textarea
              placeholder={t.conflict.counterPrompt}
              value={inputs.counter || ""}
              onChange={(e) => setInput("counter", e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve("verify", `[用户标记待验证] 替代假设"${alt.content}"需要通过实验验证。`)}
          >
            {t.conflict.verify}
          </Button>
        </div>
      </div>
    );
  }

  if (type === "consensus_alert") {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-medium">
          <AlertTriangle className="h-4 w-4" />
          {t.conflict.consensus}
        </div>
        <p className="text-sm text-amber-800">{t.conflict.consensusDesc}</p>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-amber-700">{t.conflict.consensusQ1}</label>
            <Textarea
              value={inputs.q1 || ""}
              onChange={(e) => setInput("q1", e.target.value)}
              rows={2}
              className="text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-amber-700">{t.conflict.consensusQ2}</label>
            <Textarea
              value={inputs.q2 || ""}
              onChange={(e) => setInput("q2", e.target.value)}
              rows={2}
              className="text-sm mt-1"
            />
          </div>
          <Button
            size="sm"
            disabled={!inputs.q1 || !inputs.q2}
            onClick={() =>
              onResolve("consensus_response", `[共识警报回应] 可能错在：${inputs.q1}。反对者：${inputs.q2}`)
            }
          >
            {t.common.confirm}
          </Button>
        </div>
      </div>
    );
  }

  if (type === "tech_escape") {
    return (
      <div className="rounded-lg border border-purple-300 bg-purple-50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-purple-700 font-medium">
          <AlertTriangle className="h-4 w-4" />
          {t.conflict.techEscape}
        </div>
        <p className="text-sm text-purple-800">{t.conflict.techEscapeDesc}</p>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-purple-700">{t.conflict.techEscapeQ1}</label>
            <Textarea value={inputs.q1 || ""} onChange={(e) => setInput("q1", e.target.value)} rows={2} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-purple-700">{t.conflict.techEscapeQ2}</label>
            <Textarea value={inputs.q2 || ""} onChange={(e) => setInput("q2", e.target.value)} rows={2} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-purple-700">{t.conflict.techEscapeQ3}</label>
            <Textarea value={inputs.q3 || ""} onChange={(e) => setInput("q3", e.target.value)} rows={2} className="text-sm mt-1" />
          </div>
          <Button
            size="sm"
            disabled={!inputs.q1 || !inputs.q2 || !inputs.q3}
            onClick={() =>
              onResolve(
                "tech_escape_response",
                `[技术逃逸追问回应] 用户买单理由：${inputs.q1}。风险归属：${inputs.q2}。最小验证：${inputs.q3}`
              )
            }
          >
            {t.common.confirm}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
