"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [model, setModel] = useState("");
  const [saved, setSaved] = useState(false);
  const [displayKey, setDisplayKey] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setDisplayKey(data.apiKey || "");
        setBaseURL(data.baseURL || "");
        setModel(data.model || "");
      });
  }, []);

  const handleSave = async () => {
    const body: Record<string, string> = {};
    if (apiKey) body.apiKey = apiKey;
    if (baseURL !== undefined) body.baseURL = baseURL;
    if (model) body.model = model;

    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setDisplayKey(data.apiKey);
      setApiKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">{t.settings.title}</h1>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">{t.settings.apiKey}</label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={displayKey || t.settings.apiKeyPlaceholder}
          />
          {displayKey && (
            <p className="text-xs text-neutral-400 mt-1">Current: {displayKey}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">{t.settings.baseURL}</label>
          <Input
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            placeholder={t.settings.baseURLPlaceholder}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">{t.settings.model}</label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={t.settings.modelPlaceholder}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>{t.common.save}</Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              {t.settings.saved}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
