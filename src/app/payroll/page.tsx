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

interface PayrollResult {
  id: string;
  employeeId: string;
  employeeName: string;
  year: number;
  month: number;
  baseSalary: number;
  allowances: PayrollItem[];
  deductions: PayrollItem[];
  netPayment: number;
  createdAt: string;
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<PayrollResult[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [payrollResult, setPayrollResult] = useState<PayrollResult | null>(
    null
  );

  const [formData, setFormData] = useState({
    employeeId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    overtimeHours: 0,
    lateNightHours: 0,
    holidayHours: 0,
    otherAllowance: 0,
    otherDeduction: 0,
    residentTax: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayrollRecords();
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

  const fetchPayrollRecords = async () => {
    try {
      setIsLoadingRecords(true);
      const response = await fetch('/api/payroll');
      if (!response.ok) {
        throw new Error('給与計算履歴の取得に失敗しました');
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

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('給与計算に失敗しました');
      }

      const result = await response.json();
      setPayrollResult(result);
      setShowResults(true);
      await fetchPayrollRecords();
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
        <h1 className="text-3xl font-bold text-gray-900">給与計算</h1>
        <p className="text-gray-600 mt-2">従業員の給与を計算します</p>
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
              給与計算フォーム
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

              {/* Year and Month */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    月
                  </label>
                  <input
                    type="number"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="input-field"
                    min="1"
                    max="12"
                  />
                </div>
              </div>

              {/* Overtime Details */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">
                  超過勤務
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      残業時間（時間）
                    </label>
                    <input
                      type="number"
                      name="overtimeHours"
                      value={formData.overtimeHours}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      深夜勤務（時間）
                    </label>
                    <input
                      type="number"
                      name="lateNightHours"
                      value={formData.lateNightHours}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      休日勤務（時間）
                    </label>
                    <input
                      type="number"
                      name="holidayHours"
                      value={formData.holidayHours}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Allowances and Deductions */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">
                  その他
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      その他手当
                    </label>
                    <input
                      type="number"
                      name="otherAllowance"
                      value={formData.otherAllowance}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      その他控除
                    </label>
                    <input
                      type="number"
                      name="otherDeduction"
                      value={formData.otherDeduction}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      住民税
                    </label>
                    <input
                      type="number"
                      name="residentTax"
                      value={formData.residentTax}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoadingEmployees}
                className="btn-primary w-full mt-4"
              >
                {isSubmitting ? '計算中...' : '給与を計算'}
              </button>
            </form>
          </div>
        </div>

        {/* Results and History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Calculation Result */}
          {showResults && payrollResult && (
            <div className="space-y-6">
              <div className="card border-2 border-blue-200 bg-blue-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  給与計算結果
                </h2>
                <div className="mb-4 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">
                    {payrollResult.year}年{payrollResult.month}月
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {payrollResult.employeeName}
                  </p>
                </div>
                <PayrollDetail
                  baseSalary={payrollResult.baseSalary}
                  allowances={payrollResult.allowances}
                  deductions={payrollResult.deductions}
                  netPayment={payrollResult.netPayment}
                />
              </div>
            </div>
          )}

          {/* Payroll History */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              給与計算履歴
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
                      <th className="px-4 py-3 text-left">対象月</th>
                      <th className="px-4 py-3 text-left">従業員</th>
                      <th className="px-4 py-3 text-right">基本給</th>
                      <th className="px-4 py-3 text-right">支給合計</th>
                      <th className="px-4 py-3 text-right">控除合計</th>
                      <th className="px-4 py-3 text-right">手取り</th>
                      <th className="px-4 py-3 text-left">計算日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 10).map((record) => {
                      const totalAllowances = record.allowances.reduce(
                        (sum, item) => sum + item.amount,
                        0
                      );
                      const totalDeductions = record.deductions.reduce(
                        (sum, item) => sum + item.amount,
                        0
                      );
                      const grossPayment =
                        record.baseSalary + totalAllowances;

                      return (
                        <tr key={record.id} className="table-row">
                          <td className="px-4 py-3 text-sm font-medium">
                            {record.year}年{record.month}月
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record.employeeName}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            ¥{record.baseSalary.toLocaleString('ja-JP')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            ¥{grossPayment.toLocaleString('ja-JP')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                            ¥{totalDeductions.toLocaleString('ja-JP')}
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
                      );
                    })}
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
