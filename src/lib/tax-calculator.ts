/**
 * 日本の給与計算ロジック（2025年度基準）
 * 所得税、住民税、社会保険料（健康保険・厚生年金・雇用保険・介護保険）
 */

// ============================================================
// 健康保険料率（協会けんぽ 東京都 2025年度）
// ============================================================
const HEALTH_INSURANCE_RATE = 0.04985; // 被保険者負担分 9.97% / 2
const NURSING_INSURANCE_RATE = 0.008; // 介護保険料率 1.6% / 2（40歳以上65歳未満）

// 標準報酬月額テーブル（健康保険・厚生年金共通の主要等級）
const STANDARD_MONTHLY_REMUNERATION = [
  { grade: 1, amount: 58000 },
  { grade: 2, amount: 68000 },
  { grade: 3, amount: 78000 },
  { grade: 4, amount: 88000 },
  { grade: 5, amount: 98000 },
  { grade: 6, amount: 104000 },
  { grade: 7, amount: 110000 },
  { grade: 8, amount: 118000 },
  { grade: 9, amount: 126000 },
  { grade: 10, amount: 134000 },
  { grade: 11, amount: 142000 },
  { grade: 12, amount: 150000 },
  { grade: 13, amount: 160000 },
  { grade: 14, amount: 170000 },
  { grade: 15, amount: 180000 },
  { grade: 16, amount: 190000 },
  { grade: 17, amount: 200000 },
  { grade: 18, amount: 220000 },
  { grade: 19, amount: 240000 },
  { grade: 20, amount: 260000 },
  { grade: 21, amount: 280000 },
  { grade: 22, amount: 300000 },
  { grade: 23, amount: 320000 },
  { grade: 24, amount: 340000 },
  { grade: 25, amount: 360000 },
  { grade: 26, amount: 380000 },
  { grade: 27, amount: 410000 },
  { grade: 28, amount: 440000 },
  { grade: 29, amount: 470000 },
  { grade: 30, amount: 500000 },
  { grade: 31, amount: 530000 },
  { grade: 32, amount: 560000 },
  { grade: 33, amount: 590000 },
  { grade: 34, amount: 620000 },
  { grade: 35, amount: 650000 },
  { grade: 36, amount: 680000 },
  { grade: 37, amount: 710000 },
  { grade: 38, amount: 750000 },
  { grade: 39, amount: 790000 },
  { grade: 40, amount: 830000 },
  { grade: 41, amount: 880000 },
  { grade: 42, amount: 930000 },
  { grade: 43, amount: 980000 },
  { grade: 44, amount: 1030000 },
  { grade: 45, amount: 1090000 },
  { grade: 46, amount: 1150000 },
  { grade: 47, amount: 1210000 },
  { grade: 48, amount: 1270000 },
  { grade: 49, amount: 1330000 },
  { grade: 50, amount: 1390000 },
];

// ============================================================
// 厚生年金保険料率
// ============================================================
const PENSION_INSURANCE_RATE = 0.0915; // 被保険者負担分 18.3% / 2
const PENSION_MAX_GRADE = 32; // 厚生年金の上限等級（標準報酬月額 650,000円）

// ============================================================
// 雇用保険料率（2025年度 一般の事業）
// ============================================================
const EMPLOYMENT_INSURANCE_RATE = 0.006; // 被保険者負担分 0.6%

// ============================================================
// 所得税 月額表（甲欄）2025年度 - 簡易計算
// ============================================================
interface TaxBracket {
  min: number;
  max: number;
  base: number;
  rate: number;
  deduction: number;
}

// 給与所得控除後の所得に対する税率
const MONTHLY_TAX_TABLE: TaxBracket[] = [
  { min: 0, max: 88000, base: 0, rate: 0, deduction: 0 },
  { min: 88000, max: 89000, base: 130, rate: 0, deduction: 0 },
  { min: 89000, max: 162500, base: 130, rate: 0.05, deduction: 0 },
  { min: 162500, max: 275000, base: 3810, rate: 0.10, deduction: 0 },
  { min: 275000, max: 579167, base: 15080, rate: 0.20, deduction: 0 },
  { min: 579167, max: 750000, base: 75960, rate: 0.23, deduction: 0 },
  { min: 750000, max: 1500000, base: 115270, rate: 0.33, deduction: 0 },
  { min: 1500000, max: 3333334, base: 362770, rate: 0.40, deduction: 0 },
  { min: 3333334, max: Infinity, base: 1096100, rate: 0.45, deduction: 0 },
];

/**
 * 標準報酬月額を取得
 */
export function getStandardRemuneration(grade: number): number {
  const entry = STANDARD_MONTHLY_REMUNERATION.find((e) => e.grade === grade);
  return entry?.amount ?? STANDARD_MONTHLY_REMUNERATION[0].amount;
}

/**
 * 報酬月額から等級を自動判定
 */
export function getGradeFromSalary(monthlySalary: number): number {
  for (let i = 0; i < STANDARD_MONTHLY_REMUNERATION.length - 1; i++) {
    const current = STANDARD_MONTHLY_REMUNERATION[i];
    const next = STANDARD_MONTHLY_REMUNERATION[i + 1];
    const boundary = (current.amount + next.amount) / 2;
    if (monthlySalary < boundary) {
      return current.grade;
    }
  }
  return STANDARD_MONTHLY_REMUNERATION[STANDARD_MONTHLY_REMUNERATION.length - 1].grade;
}

/**
 * 健康保険料を計算
 */
export function calcHealthInsurance(grade: number): number {
  const standard = getStandardRemuneration(grade);
  return Math.floor(standard * HEALTH_INSURANCE_RATE);
}

/**
 * 介護保険料を計算（40歳以上65歳未満）
 */
export function calcNursingInsurance(grade: number, age: number): number {
  if (age >= 40 && age < 65) {
    const standard = getStandardRemuneration(grade);
    return Math.floor(standard * NURSING_INSURANCE_RATE);
  }
  return 0;
}

/**
 * 厚生年金保険料を計算
 */
export function calcPensionInsurance(pensionGrade: number): number {
  const effectiveGrade = Math.min(pensionGrade, PENSION_MAX_GRADE);
  const standard = getStandardRemuneration(effectiveGrade);
  return Math.floor(standard * PENSION_INSURANCE_RATE);
}

/**
 * 雇用保険料を計算
 */
export function calcEmploymentInsurance(totalEarnings: number): number {
  return Math.floor(totalEarnings * EMPLOYMENT_INSURANCE_RATE);
}

/**
 * 社会保険料合計を計算
 */
export function calcSocialInsurance(params: {
  healthGrade: number;
  pensionGrade: number;
  age: number;
  totalEarnings: number;
}): {
  healthInsurance: number;
  nursingInsurance: number;
  pensionInsurance: number;
  employmentInsurance: number;
  total: number;
} {
  const healthInsurance = calcHealthInsurance(params.healthGrade);
  const nursingInsurance = calcNursingInsurance(params.healthGrade, params.age);
  const pensionInsurance = calcPensionInsurance(params.pensionGrade);
  const employmentInsurance = calcEmploymentInsurance(params.totalEarnings);

  return {
    healthInsurance,
    nursingInsurance,
    pensionInsurance,
    employmentInsurance,
    total: healthInsurance + nursingInsurance + pensionInsurance + employmentInsurance,
  };
}

/**
 * 所得税（源泉徴収税額）を計算 - 甲欄
 */
export function calcIncomeTax(
  taxableIncome: number,
  dependents: number
): number {
  // 扶養控除: 1人あたり月額31,667円を差し引く
  const dependentDeduction = dependents * 31667;
  const adjusted = Math.max(0, taxableIncome - dependentDeduction);

  for (const bracket of MONTHLY_TAX_TABLE) {
    if (adjusted >= bracket.min && adjusted < bracket.max) {
      if (bracket.rate === 0) return bracket.base;
      return Math.floor(bracket.base + (adjusted - bracket.min) * bracket.rate);
    }
  }
  return 0;
}

/**
 * 残業代を計算
 */
export function calcOvertimePay(baseSalary: number, hours: number): number {
  // 月の所定労働時間を160時間として時給を算出、残業は1.25倍
  const hourlyRate = baseSalary / 160;
  return Math.floor(hourlyRate * hours * 1.25);
}

/**
 * 深夜残業代を計算
 */
export function calcLateNightPay(baseSalary: number, hours: number): number {
  const hourlyRate = baseSalary / 160;
  return Math.floor(hourlyRate * hours * 1.5);
}

/**
 * 休日出勤手当を計算
 */
export function calcHolidayPay(baseSalary: number, hours: number): number {
  const hourlyRate = baseSalary / 160;
  return Math.floor(hourlyRate * hours * 1.35);
}

/**
 * 年齢を計算
 */
export function calcAge(birthDate: string, referenceDate?: Date): number {
  const birth = new Date(birthDate);
  const ref = referenceDate ?? new Date();
  let age = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * 給与計算メイン処理
 */
export function calculatePayroll(params: {
  baseSalary: number;
  positionAllowance: number;
  commuteAllowance: number;
  housingAllowance: number;
  overtimeHours: number;
  lateNightHours: number;
  holidayHours: number;
  otherAllowance: number;
  otherDeduction: number;
  residentTax: number;
  dependents: number;
  healthInsuranceGrade: number;
  pensionGrade: number;
  birthDate: string | null;
}) {
  const age = params.birthDate ? calcAge(params.birthDate) : 30;

  // 支給額
  const overtimePay = calcOvertimePay(params.baseSalary, params.overtimeHours);
  const lateNightPay = calcLateNightPay(params.baseSalary, params.lateNightHours);
  const holidayPay = calcHolidayPay(params.baseSalary, params.holidayHours);

  const totalEarnings =
    params.baseSalary +
    overtimePay +
    lateNightPay +
    holidayPay +
    params.positionAllowance +
    params.commuteAllowance +
    params.housingAllowance +
    params.otherAllowance;

  // 社会保険料
  const socialInsurance = calcSocialInsurance({
    healthGrade: params.healthInsuranceGrade,
    pensionGrade: params.pensionGrade,
    age,
    totalEarnings,
  });

  // 課税対象額 = 総支給額 - 社会保険料合計 - 通勤手当（非課税）
  const taxableIncome = totalEarnings - socialInsurance.total - params.commuteAllowance;
  const incomeTax = calcIncomeTax(taxableIncome, params.dependents);

  const totalDeductions =
    socialInsurance.total +
    incomeTax +
    params.residentTax +
    params.otherDeduction;

  const netPay = totalEarnings - totalDeductions;

  return {
    overtimePay,
    lateNightPay,
    holidayPay,
    totalEarnings,
    ...socialInsurance,
    socialInsuranceTotal: socialInsurance.total,
    incomeTax,
    residentTax: params.residentTax,
    totalDeductions,
    netPay,
  };
}

/**
 * 賞与の社会保険料・所得税を計算
 */
export function calculateBonusDeductions(params: {
  totalAmount: number;
  healthInsuranceGrade: number;
  pensionGrade: number;
  birthDate: string | null;
}): {
  healthInsurance: number;
  nursingInsurance: number;
  pensionInsurance: number;
  employmentInsurance: number;
  socialInsuranceTotal: number;
  incomeTax: number;
  totalDeductions: number;
  netPay: number;
} {
  const age = params.birthDate ? calcAge(params.birthDate) : 30;

  // 賞与の社会保険料は標準賞与額（1000円未満切り捨て）に料率を掛ける
  const standardBonus = Math.floor(params.totalAmount / 1000) * 1000;

  const healthInsurance = Math.floor(standardBonus * HEALTH_INSURANCE_RATE);
  const nursingInsurance =
    age >= 40 && age < 65
      ? Math.floor(standardBonus * NURSING_INSURANCE_RATE)
      : 0;
  const pensionInsurance = Math.floor(standardBonus * PENSION_INSURANCE_RATE);
  const employmentInsurance = Math.floor(
    params.totalAmount * EMPLOYMENT_INSURANCE_RATE
  );

  const socialInsuranceTotal =
    healthInsurance + nursingInsurance + pensionInsurance + employmentInsurance;

  // 賞与の所得税：前月の課税対象額に基づく税率（簡易的に一律で計算）
  const taxableBonus = params.totalAmount - socialInsuranceTotal;
  const incomeTax = Math.floor(taxableBonus * 0.10227); // 簡易税率

  const totalDeductions = socialInsuranceTotal + incomeTax;
  const netPay = params.totalAmount - totalDeductions;

  return {
    healthInsurance,
    nursingInsurance,
    pensionInsurance,
    employmentInsurance,
    socialInsuranceTotal,
    incomeTax,
    totalDeductions,
    netPay,
  };
}

export { STANDARD_MONTHLY_REMUNERATION };
