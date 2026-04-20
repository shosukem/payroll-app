'use client';

import { useEffect, useState, FormEvent } from 'react';
import PayrollDetail from '@/components/PayrollDetail';

interface Employee {
  id: string;
  employeeCode: string;
  lastName: string;
  firstName: string;
}

interface PayrollItem {
  label: string;
  amount: number;
}

interface BonusResult {
  id: string;
  employeeId: string;
  employeeName: string;
  year: number;
  bonusType: 'summer' | 'winter' | 'special';
  baseSalary: number;
  baseAmount: number;
  performanceRate: number;
  allowances: PayrollItem[];
  deductions: PayrollItem[];
  netPayment: number;
  createdAt: string;
}

const BONUS_TYPE_LABELS: Record<string, string> = {
  summer: '夏季',
  winter: '冬季',
  special: '特別',
};

export default function BonusPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<BonusResult[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [bonusResult, setBonusResult] = useState<BonusResult | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    year: new Date().getFullYear(),
    bonusType: 'summer' as 'summer' | 'winter' | 'special',
    baseAmount: 0,
    performanceRate: 100,
  });

  useEffect(() => {
    fetchEmployees();
    fetchBonusRecords();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('従業員情報の取得に失敗しました');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const fetchBonusRecords = async () => {
    try {
      setIsLoadingRecords(true);
      const response = await fetch('/api/bonus');
      if (!response.ok) {
        throw new Error('賞与計算履歴の取得に失敗しました');
      }
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.employeeId) {
      setError('従業員を選択してください');
      return;
    }

    if (formData.baseAmount <= 0) {
      setError('賞与額は0より大きい値で入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('賞与計算に失敗しました');
      }

      const result = await response.json();
      setBonusResult(result);
      setShowResults(true);
      await fetchBonusRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.currentTarget;
    const inputValue =
      type === 'number' ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">賞与計算</h1>
        <p className="text-gray-600 mt-2">従業員の賞与を計算します</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              賞与計算フォーム
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  従業員 *
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={isLoadingEmployees}
                >
                  <option value="">選択してください</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeCode} - {emp.lastName}{emp.firstName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年 *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input-field"
                  min="2020"
                />
              </div>

              {/* Bonus Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  賞与種別 *
                </label>
                <select
                  name="bonusType"
                  value={formData.bonusType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="summer">夏季賞与</option>
                  <option value="winter">冬季賞与</option>
                  <option value="special">特別賞与</option>
                </select>
              </div>

              {/* Base Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  賞与額（基準） *
                </label>
                <input
                  type="number"
                  name="baseAmount"
                  value={formData.baseAmount}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  基本給の月数分（例：2.0 = 2ヶ月分）
                </p>
              </div>

              {/* Performance Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  成績率（%）
                </label>
                <input
                  type="number"
                  name="performanceRate"
                  value={formData.performanceRate}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  max="200"
                  step="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  100% = 基準、80% = 80%支給
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoadingEmployees}
                className="btn-primary w-full mt-6"
              >
                {isSubmitting ? '計算中...' : '賞与を計算'}
              </button>
            </form>
          </div>
        </div>

        {/* Results and History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Calculation Result */}
          {showResults && bonusResult && (
            <div className="space-y-6">
              <div className="card border-2 border-amber-200 bg-amber-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  賞与計算結果
                </h2>
                <div className="mb-4 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">
                    {bonusResult.year}年 -{' '}
                    {BONUS_TYPE_LABELS[bonusResult.bonusType]}賞与
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {bonusResult.employeeName}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">基準額</p>
                      <p className="font-semibold text-gray-900">
                        ¥{bonusResult.baseAmount.toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">成績率</p>
                      <p className="font-semibold text-gray-900">
                        {bonusResult.performanceRate}%
                      </p>
                    </div>
                  </div>
                </div>
                <PayrollDetail
                  baseSalary={bonusResult.baseSalary}
                  allowances={bonusResult.allowances}
                  deductions={bonusResult.deductions}
                  netPayment={bonusResult.netPayment}
                />
              </div>
            </div>
          )}

          {/* Bonus History */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              賞与計算履歴
            </h2>

            {isLoadingRecords ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 mt-4">読み込み中...</p>
              </div>
            ) : records.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                計算履歴がありません
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-head">
                      <th className="px-4 py-3 text-left">年度</th>
                      <th className="px-4 py-3 text-left">賞与種別</th>
                      <th className="px-4 py-3 text-left">従業員</th>
                      <th className="px-4 py-3 text-right">基準額</th>
                      <th className="px-4 py-3 text-right">成績率</th>
                      <th className="px-4 py-3 text-right">手取り</th>
                      <th className="px-4 py-3 text-left">計算日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 10).map((record) => (
                      <tr key={record.id} className="table-row">
                        <td className="px-4 py-3 text-sm font-medium">
                          {record.year}年
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {BONUS_TYPE_LABELS[record.bonusType]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {record.employeeName}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          ¥
                          {record.baseAmount.toLocaleString('ja-JP')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {record.performanceRate}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                          ¥{record.netPayment.toLocaleString('ja-JP')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(record.createdAt).toLocaleDateString(
                            'ja-JP'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {records.length > 10 && (
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 mt-4">
                <p className="text-sm text-gray-600">
                  全{records.length}件中、最新10件を表示
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
