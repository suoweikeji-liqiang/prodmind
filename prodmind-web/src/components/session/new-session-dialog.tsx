"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface NewSessionDialogProps {
  onCreated: (id: string) => void;
}

export function NewSessionDialog({ onCreated }: NewSessionDialogProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), locale }),
      });
      if (res.ok) {
        const data = await res.json();
        setOpen(false);
        setIdea("");
        onCreated(data.id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t.common.newSession}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.common.newSession}</DialogTitle>
          <DialogDescription>{t.session.ideaLabel}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={t.session.ideaPlaceholder}
          rows={4}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleCreate} disabled={!idea.trim() || loading}>
            {loading ? t.common.loading : t.common.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
