"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Settings, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/sessions" className="flex items-center gap-2 font-semibold text-neutral-900">
            <span className="text-lg">⚡</span>
            <span>{t.common.appName}</span>
            <span className="text-xs text-neutral-400">{t.common.tagline}</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/sessions">
              <Button
                variant={pathname.startsWith("/sessions") ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                {t.common.sessions}
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant={pathname === "/settings" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
              >
                <Settings className="h-4 w-4" />
                {t.common.settings}
              </Button>
            </Link>
          </nav>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          className="gap-1.5"
        >
          <Globe className="h-4 w-4" />
          {locale === "zh" ? "EN" : "中文"}
        </Button>
      </div>
    </header>
  );
}
