'use client';

import { useState, FormEvent } from 'react';

interface EmployeePayrollSummary {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netPayment: number;
}

interface ReportData {
  year: number;
  month: number;
  totalEmployees: number;
  totalBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNetPayment: number;
  employeeSummaries: EmployeePayrollSummary[];
}

export default function ReportsPage() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.currentTarget;
    const inputValue = type === 'number' ? parseInt(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/reports?year=${formData.year}&month=${formData.month}`
      );

      if (!response.ok) {
        throw new Error('レポートの取得に失敗しました');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">レポート</h1>
        <p className="text-gray-600 mt-2">給与集計レポートを確認します</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Filter Form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          レポート条件
        </h2>
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="input-field w-32"
              min="2020"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className="input-field w-32"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}月
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'レポート作成中...' : 'レポートを表示'}
          </button>
        </form>
      </div>

      {/* Report Summary */}
      {reportData && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="stat-card-label">対象月</div>
              <div className="stat-card-value text-blue-600">
                {reportData.year}年{reportData.month}月
              </div>
              <p className="text-xs text-gray-500 mt-4">レポート期間</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">対象従業員数</div>
              <div className="stat-card-value text-green-600">
                {reportData.totalEmployees}
              </div>
              <p className="text-xs text-gray-500 mt-4">人</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">基本給合計</div>
              <div className="stat-card-value text-purple-600">
                ¥{reportData.totalBaseSalary.toLocaleString('ja-JP')}
              </div>
              <p className="text-xs text-gray-500 mt-4">支給ベース</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">支給合計</div>
              <div className="stat-card-value text-blue-600">
                ¥
                {(reportData.totalBaseSalary + reportData.totalAllowances).toLocaleString('ja-JP')}
              </div>
              <p className="text-xs text-gray-500 mt-4">基本給 + 手当</p>
            </div>
          </div>

          {/* Summary Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              月次集計サマリー
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gross Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">支給額集計</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">基本給合計</span>
                    <span className="font-medium text-gray-900">
                      ¥
                      {reportData.totalBaseSalary.toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">各種手当合計</span>
                    <span className="font-medium text-gray-900">
                      ¥
                      {reportData.totalAllowances.toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-3 bg-green-50 rounded-lg mt-2 font-semibold">
                    <span>支給合計</span>
                    <span className="text-green-600">
                      ¥
                      {(reportData.totalBaseSalary + reportData.totalAllowances).toLocaleString(
                        'ja-JP'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deduction Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">控除額集計</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">各種控除合計</span>
                    <span className="font-medium text-red-600">
                      -¥
                      {reportData.totalDeductions.toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-3 bg-blue-50 rounded-lg mt-4 font-semibold">
                    <span>手取り合計</span>
                    <span className="text-blue-600">
                      ¥
                      {reportData.totalNetPayment.toLocaleString('ja-JP')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Breakdown */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              従業員別給与内訳
            </h2>

            {reportData.employeeSummaries.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                該当するデータがありません
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-head">
                      <th className="px-6 py-3 text-left">従業員</th>
                      <th className="px-6 py-3 text-right">基本給</th>
                      <th className="px-6 py-3 text-right">各種手当</th>
                      <th className="px-6 py-3 text-right">支給合計</th>
                      <th className="px-6 py-3 text-right">各種控除</th>
                      <th className="px-6 py-3 text-right">手取り</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.employeeSummaries.map((summary) => (
                      <tr
                        key={summary.employeeId}
                        className="table-row"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {summary.employeeName}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700">
                          ¥
                          {summary.baseSalary.toLocaleString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-700">
                          ¥
                          {summary.totalAllowances.toLocaleString(
                            'ja-JP'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                          ¥
                          {(summary.baseSalary + summary.totalAllowances).toLocaleString(
                            'ja-JP'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                          ¥
                          {summary.totalDeductions.toLocaleString(
                            'ja-JP'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                          ¥
                          {summary.netPayment.toLocaleString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            {reportData.employeeSummaries.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 mt-4">
                <p className="text-sm text-gray-600">
                  全{reportData.employeeSummaries.length}名を表示中
                </p>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              エクスポートオプション
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                🖨️ 印刷
              </button>
              <button
                disabled
                className="btn-secondary opacity-50 cursor-not-allowed"
              >
                📊 CSVダウンロード（準備中）
              </button>
              <button
                disabled
                className="btn-secondary opacity-50 cursor-not-allowed"
              >
                📈 Excelダウンロード（準備中）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !isLoading && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            レポートを表示する
          </h3>
          <p className="text-gray-600">
            上記の条件を選択して「レポートを表示」をクリックしてください
          </p>
        </div>
      )}
    </div>
  );
}
