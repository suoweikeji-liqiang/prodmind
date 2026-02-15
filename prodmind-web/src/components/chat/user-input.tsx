"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useI18n } from "@/i18n/context";

const MIN_RESPONSE_LENGTH = 50;

interface UserInputProps {
  phase: string;
  onSend: (content: string) => void;
  disabled?: boolean;
  requireMinLength?: boolean;
}

export function UserInput({ phase, onSend, disabled, requireMinLength }: UserInputProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const minLen = requireMinLength ? MIN_RESPONSE_LENGTH : 0;
  const isValid = value.trim().length >= (minLen || 1);

  const placeholder =
    phase === "user_confirm"
      ? t.debate.waitingConfirm
      : phase === "user_response"
        ? t.debate.waitingResponse
        : "";

  const handleSend = () => {
    if (!isValid) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={2}
            className="resize-none pr-16"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          {minLen > 0 && (
            <span
              className={`absolute bottom-2 right-14 text-xs ${
                value.trim().length >= minLen ? "text-neutral-400" : "text-red-400"
              }`}
            >
              {value.trim().length}/{minLen}
            </span>
          )}
        </div>
        <Button onClick={handleSend} disabled={disabled || !isValid} size="icon" className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {minLen > 0 && value.trim().length > 0 && value.trim().length < minLen && (
        <p className="text-xs text-red-500 mt-1">
          {t.debate.minChars.replace("{n}", String(minLen)).replace("{c}", String(value.trim().length))}
        </p>
      )}
    </div>
  );
}
