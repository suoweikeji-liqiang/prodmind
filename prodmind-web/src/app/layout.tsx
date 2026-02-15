import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";

export const metadata: Metadata = {
  title: "思炼 — 认知对抗机器",
  description: "AI-driven structured debate for product idea validation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
