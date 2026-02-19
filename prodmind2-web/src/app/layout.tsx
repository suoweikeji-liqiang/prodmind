import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProdMind 2.0',
  description: '决策结构操作系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
