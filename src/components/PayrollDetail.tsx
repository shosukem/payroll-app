'use client';

interface PayrollItem {
  label: string;
  amount: number;
}

interface PayrollDetailProps {
  baseSalary: number;
  allowances: PayrollItem[];
  deductions: PayrollItem[];
  netPayment: number;
}

export default function PayrollDetail({
  baseSalary,
  allowances,
  deductions,
  netPayment,
}: PayrollDetailProps) {
  const totalAllowances = allowances.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const grossPayment = baseSalary + totalAllowances;

  return (
    <div className="space-y-6">
      {/* Gross Payment */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-medium">基本給</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              ¥{baseSalary.toLocaleString('ja-JP')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">支給合計</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ¥{grossPayment.toLocaleString('ja-JP')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">控除合計</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              ¥{totalDeductions.toLocaleString('ja-JP')}
            </p>
          </div>
        </div>
      </div>

      {/* Payroll Details Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allowances */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">支給項目</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">基本給</span>
              <span className="font-medium text-gray-900">
                ¥{baseSalary.toLocaleString('ja-JP')}
              </span>
            </div>
            {allowances.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <span className="text-gray-700">{item.label}</span>
                <span className="font-medium text-gray-900">
                  ¥{item.amount.toLocaleString('ja-JP')}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3 px-3 bg-blue-50 rounded-lg mt-4 font-semibold">
              <span className="text-gray-900">支給合計</span>
              <span className="text-blue-600">
                ¥{grossPayment.toLocaleString('ja-JP')}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">控除項目</h3>
          <div className="space-y-3">
            {deductions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">控除項目なし</p>
            ) : (
              <>
                {deductions.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium text-red-600">
                      ¥{item.amount.toLocaleString('ja-JP')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 px-3 bg-red-50 rounded-lg mt-4 font-semibold">
                  <span className="text-gray-900">控除合計</span>
                  <span className="text-red-600">
                    ¥{totalDeductions.toLocaleString('ja-JP')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Net Payment */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium mb-2">支給額（手取り）</p>
          <p className="text-4xl font-bold text-green-600">
            ¥{netPayment.toLocaleString('ja-JP')}
          </p>
        </div>
      </div>
    </div>
  );
}
