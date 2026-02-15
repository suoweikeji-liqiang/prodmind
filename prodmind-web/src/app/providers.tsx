"use client";

import { I18nProvider } from "@/i18n/context";
import { Header } from "@/components/layout/header";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Header />
      <main>{children}</main>
    </I18nProvider>
  );
}
