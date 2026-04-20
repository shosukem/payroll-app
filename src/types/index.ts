export interface Employee {
  id: number;
  employeeCode: string;
  lastName: string;
  firstName: string;
  lastNameKana?: string | null;
  firstNameKana?: string | null;
  email?: string | null;
  department?: string | null;
  position?: string | null;
  hireDate: string;
  birthDate?: string | null;
  baseSalary: number;
  positionAllowance: number;
  commuteAllowance: number;
  housingAllowance: number;
  dependents: number;
  isActive: boolean;
  healthInsuranceGrade: number;
  pensionGrade: number;
}

export interface PayrollInput {
  employeeId: number;
  year: number;
  month: number;
  overtimeHours: number;
  lateNightHours: number;
  holidayHours: number;
  otherAllowance: number;
  otherDeduction: number;
  residentTax: number;
  memo?: string;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  year: number;
  month: number;
  paymentDate?: string | null;
  baseSalary: number;
  overtimeHours: string;
  overtimePay: number;
  lateNightHours: string;
  lateNightPay: number;
  holidayHours: string;
  holidayPay: number;
  positionAllowance: number;
  commuteAllowance: number;
  housingAllowance: number;
  otherAllowance: number;
  totalEarnings: number;
  healthInsurance: number;
  nursingInsurance: number;
  pensionInsurance: number;
  employmentInsurance: number;
  socialInsuranceTotal: number;
  incomeTax: number;
  residentTax: number;
  otherDeduction: number;
  totalDeductions: number;
  netPay: number;
  memo?: string | null;
  employee?: Employee;
}

export interface BonusInput {
  employeeId: number;
  year: number;
  bonusType: "summer" | "winter" | "special";
  baseAmount: number;
  performanceRate: number;
  memo?: string;
}

export interface BonusRecord {
  id: number;
  employeeId: number;
  year: number;
  bonusType: string;
  paymentDate?: string | null;
  baseAmount: number;
  performanceRate: string;
  totalAmount: number;
  healthInsurance: number;
  nursingInsurance: number;
  pensionInsurance: number;
  employmentInsurance: number;
  socialInsuranceTotal: number;
  incomeTax: number;
  totalDeductions: number;
  netPay: number;
  memo?: string | null;
  employee?: Employee;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalEmployees: number;
  totalEarnings: number;
  totalDeductions: number;
  totalNetPay: number;
  totalSocialInsurance: number;
  totalIncomeTax: number;
  totalResidentTax: number;
  records: (PayrollRecord & { employee: Employee })[];
}
