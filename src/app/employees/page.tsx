'use client';

import { useEffect, useState } from 'react';
import EmployeeForm from '@/components/EmployeeForm';
import EmployeeFilesModal from '@/components/EmployeeFilesModal';

interface Employee {
  id: string;
  employeeCode: string;
  lastName: string;
  firstName: string;
  department: string;
  position: string;
  baseSalary: number;
  status: 'active' | 'inactive';
}

interface EmployeeFormData {
  employeeCode: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  birthDate: string;
  baseSalary: number;
  positionAllowance: number;
  commuteAllowance: number;
  housingAllowance: number;
  dependents: number;
  healthInsuranceGrade: string;
  pensionGrade: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filesEmployee, setFilesEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('従業員情報の取得に失敗しました');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      setIsFormSubmitting(true);
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('従業員の登録に失敗しました');
      }

      await fetchEmployees();
      setShowForm(false);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    `${emp.lastName}${emp.firstName}`.includes(searchTerm) ||
    emp.employeeCode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">従業員管理</h1>
          <p className="text-gray-600 mt-2">従業員情報の管理と検索</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          ➕ 従業員を追加
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="従業員名または従業員番号で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">従業員が見つかりません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-6 py-3 text-left">従業員番号</th>
                  <th className="px-6 py-3 text-left">氏名</th>
                  <th className="px-6 py-3 text-left">部門</th>
                  <th className="px-6 py-3 text-left">職位</th>
                  <th className="px-6 py-3 text-right">基本給</th>
                  <th className="px-6 py-3 text-center">状態</th>
                  <th className="px-6 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="table-row">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {employee.employeeCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {employee.lastName} {employee.firstName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                      ¥{employee.baseSalary.toLocaleString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {employee.status === 'active' ? (
                        <span className="badge-active">在職中</span>
                      ) : (
                        <span className="badge-inactive">退職</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center space-x-3">
                      <button
                        onClick={() => setShowForm(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => setFilesEmployee(employee)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        ファイル
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!isLoading && filteredEmployees.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
            <p className="text-sm text-gray-600">
              全{filteredEmployees.length}件を表示中
            </p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <EmployeeForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          isLoading={isFormSubmitting}
        />
      )}

      {/* Files Modal */}
      {filesEmployee && (
        <EmployeeFilesModal
          employeeId={Number(filesEmployee.id)}
          employeeName={`${filesEmployee.lastName} ${filesEmployee.firstName}`}
          onClose={() => setFilesEmployee(null)}
        />
      )}
    </div>
  );
}
