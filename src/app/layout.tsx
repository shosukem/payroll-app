import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '給与管理システム',
  description: '日本企業向けの給与管理システム',
};

const navigationItems = [
  { href: '/', label: 'ダッシュボード', icon: '📊' },
  { href: '/employees', label: '従業員管理', icon: '👥' },
  { href: '/payroll', label: '給与計算', icon: '💰' },
  { href: '/bonus', label: '賞与計算', icon: '🎁' },
  { href: '/reports', label: 'レポート', icon: '📋' },
];

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg overflow-y-auto">
            <div className="p-6 border-b border-blue-700">
              <h1 className="text-xl font-bold">給与管理システム</h1>
              <p className="text-sm text-blue-200 mt-1">給与計算管理</p>
            </div>

            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
              <div className="bg-blue-700 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-1">システム情報</p>
                <p className="text-blue-200 text-xs">バージョン 1.0.0</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-screen bg-gray-50 p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
