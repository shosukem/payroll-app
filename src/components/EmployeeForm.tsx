'use client';

import { useState, FormEvent, useEffect } from 'react';

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

interface EmployeeFormProps {
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  initialData?: EmployeeFormData;
  isLoading?: boolean;
}

export default function EmployeeForm({
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData || {
      employeeCode: '',
      lastName: '',
      firstName: '',
      lastNameKana: '',
      firstNameKana: '',
      email: '',
      department: '',
      position: '',
      hireDate: '',
      birthDate: '',
      baseSalary: 0,
      positionAllowance: 0,
      commuteAllowance: 0,
      housingAllowance: 0,
      dependents: 0,
      healthInsuranceGrade: '1',
      pensionGrade: '1',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = '従業員番号は必須です';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = '姓は必須です';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = '名は必須です';
    }
    if (!formData.lastNameKana.trim()) {
      newErrors.lastNameKana = '姓（カナ）は必須です';
    }
    if (!formData.firstNameKana.trim()) {
      newErrors.firstNameKana = '名（カナ）は必須です';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = '有効なメールアドレスが必要です';
    }
    if (!formData.department.trim()) {
      newErrors.department = '部門は必須です';
    }
    if (!formData.position.trim()) {
      newErrors.position = '職位は必須です';
    }
    if (!formData.hireDate) {
      newErrors.hireDate = '入社日は必須です';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = '生年月日は必須です';
    }
    if (formData.baseSalary <= 0) {
      newErrors.baseSalary = '基本給は0より大きい値で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : '登録に失敗しました'
      );
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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? '従業員情報を編集' : '新しい従業員を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              基本情報
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  従業員番号 *
                </label>
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.employeeCode ? 'border-red-500' : ''
                  }`}
                  placeholder="EMP001"
                />
                {errors.employeeCode && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.employeeCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="example@company.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓 *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.lastName ? 'border-red-500' : ''
                  }`}
                  placeholder="山田"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名 *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.firstName ? 'border-red-500' : ''
                  }`}
                  placeholder="太郎"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓（カナ）*
                </label>
                <input
                  type="text"
                  name="lastNameKana"
                  value={formData.lastNameKana}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.lastNameKana ? 'border-red-500' : ''
                  }`}
                  placeholder="ヤマダ"
                />
                {errors.lastNameKana && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.lastNameKana}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名（カナ）*
                </label>
                <input
                  type="text"
                  name="firstNameKana"
                  value={formData.firstNameKana}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.firstNameKana ? 'border-red-500' : ''
                  }`}
                  placeholder="タロウ"
                />
                {errors.firstNameKana && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.firstNameKana}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 採用情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              採用情報
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  部門 *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.department ? 'border-red-500' : ''
                  }`}
                  placeholder="営業部"
                />
                {errors.department && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  職位 *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.position ? 'border-red-500' : ''
                  }`}
                  placeholder="営業課長"
                />
                {errors.position && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.position}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入社日 *
                </label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.hireDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.hireDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.hireDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生年月日 *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.birthDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.birthDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.birthDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  扶養人数
                </label>
                <input
                  type="number"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 給与情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              給与情報
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  基本給 *
                </label>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.baseSalary ? 'border-red-500' : ''
                  }`}
                  min="0"
                  step="1000"
                />
                {errors.baseSalary && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.baseSalary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  職務手当
                </label>
                <input
                  type="number"
                  name="positionAllowance"
                  value={formData.positionAllowance}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  通勤手当
                </label>
                <input
                  type="number"
                  name="commuteAllowance"
                  value={formData.commuteAllowance}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住宅手当
                </label>
                <input
                  type="number"
                  name="housingAllowance"
                  value={formData.housingAllowance}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* 保険情報セクション */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              保険情報
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  健康保険等級
                </label>
                <select
                  name="healthInsuranceGrade"
                  value={formData.healthInsuranceGrade}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="1">等級1</option>
                  <option value="2">等級2</option>
                  <option value="3">等級3</option>
                  <option value="4">等級4</option>
                  <option value="5">等級5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  厚生年金等級
                </label>
                <select
                  name="pensionGrade"
                  value={formData.pensionGrade}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="1">等級1</option>
                  <option value="2">等級2</option>
                  <option value="3">等級3</option>
                  <option value="4">等級4</option>
                  <option value="5">等級5</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
