'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  thisMonthPayroll: number;
  thisMonthPayrollCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('統計情報の取得に失敗しました');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">給与管理システムへようこそ</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="stat-card">
          <div className="stat-card-label">従業員総数</div>
          {isLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <div className="stat-card-value">
              {stats?.totalEmployees || 0}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4">常勤社員</p>
        </div>

        {/* Active Employees */}
        <div className="stat-card">
          <div className="stat-card-label">在職従業員</div>
          {isLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <div className="stat-card-value text-green-600">
              {stats?.activeEmployees || 0}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4">現在の在職者</p>
        </div>

        {/* This Month Payroll */}
        <div className="stat-card">
          <div className="stat-card-label">今月給与支給合計</div>
          {isLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <div className="stat-card-value text-blue-600">
              ¥{(stats?.thisMonthPayroll || 0).toLocaleString('ja-JP')}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4">集計中の支給額</p>
        </div>

        {/* Payroll Count */}
        <div className="stat-card">
          <div className="stat-card-label">給与計算件数</div>
          {isLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <div className="stat-card-value text-purple-600">
              {stats?.thisMonthPayrollCount || 0}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4">今月集計済み</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/employees"
            className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow border border-blue-200"
          >
            <div>
              <h3 className="font-semibold text-blue-900">従業員を追加</h3>
              <p className="text-sm text-blue-700">新しい従業員を登録</p>
            </div>
            <span className="text-2xl">➕</span>
          </Link>

          <Link
            href="/payroll"
            className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow border border-green-200"
          >
            <div>
              <h3 className="font-semibold text-green-900">給与を計算</h3>
              <p className="text-sm text-green-700">給与計算を実行</p>
            </div>
            <span className="text-2xl">🧮</span>
          </Link>

          <Link
            href="/bonus"
            className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg hover:shadow-md transition-shadow border border-amber-200"
          >
            <div>
              <h3 className="font-semibold text-amber-900">賞与を計算</h3>
              <p className="text-sm text-amber-700">賞与計算を実行</p>
            </div>
            <span className="text-2xl">🏆</span>
          </Link>

          <Link
            href="/employees"
            className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-shadow border border-purple-200"
          >
            <div>
              <h3 className="font-semibold text-purple-900">従業員を管理</h3>
              <p className="text-sm text-purple-700">従業員情報を確認</p>
            </div>
            <span className="text-2xl">👥</span>
          </Link>

          <Link
            href="/reports"
            className="flex items-center justify-between p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg hover:shadow-md transition-shadow border border-red-200"
          >
            <div>
              <h3 className="font-semibold text-red-900">レポートを確認</h3>
              <p className="text-sm text-red-700">月次レポートを表示</p>
            </div>
            <span className="text-2xl">📊</span>
          </Link>

          <Link
            href="/payroll"
            className="flex items-center justify-between p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:shadow-md transition-shadow border border-indigo-200"
          >
            <div>
              <h3 className="font-semibold text-indigo-900">給与履歴</h3>
              <p className="text-sm text-indigo-700">過去の給与を参照</p>
            </div>
            <span className="text-2xl">📜</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700">
              システムを準備中です。API接続をお待ちください。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
