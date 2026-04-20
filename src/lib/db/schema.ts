import {
  int,
  varchar,
  decimal,
  datetime,
  text,
  bit,
  uniqueIndex,
} from "drizzle-orm/mssql-core";
import { mssqlTable } from "drizzle-orm/mssql-core";

export const employees = mssqlTable("employees", {
  id: int("id").primaryKey().identity(),
  employeeCode: varchar("employee_code", { length: 20 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastNameKana: varchar("last_name_kana", { length: 50 }),
  firstNameKana: varchar("first_name_kana", { length: 50 }),
  email: varchar("email", { length: 100 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  hireDate: varchar("hire_date", { length: 10 }).notNull(), // YYYY-MM-DD
  birthDate: varchar("birth_date", { length: 10 }),
  baseSalary: int("base_salary").notNull().default(0),
  positionAllowance: int("position_allowance").default(0),
  commuteAllowance: int("commute_allowance").default(0),
  housingAllowance: int("housing_allowance").default(0),
  dependents: int("dependents").default(0),
  isActive: bit("is_active").default(true),
  healthInsuranceGrade: int("health_insurance_grade").default(1),
  pensionGrade: int("pension_grade").default(1),
  createdAt: datetime("created_at").defaultCurrentTimestamp(),
  updatedAt: datetime("updated_at").defaultCurrentTimestamp(),
}, (table) => [
  uniqueIndex("uq_employee_code").on(table.employeeCode),
]);

export const payrollRecords = mssqlTable("payroll_records", {
  id: int("id").primaryKey().identity(),
  employeeId: int("employee_id").notNull().references(() => employees.id),
  year: int("year").notNull(),
  month: int("month").notNull(),
  paymentDate: varchar("payment_date", { length: 10 }),

  // 支給
  baseSalary: int("base_salary").notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  overtimePay: int("overtime_pay").default(0),
  lateNightHours: decimal("late_night_hours", { precision: 5, scale: 2 }).default("0"),
  lateNightPay: int("late_night_pay").default(0),
  holidayHours: decimal("holiday_hours", { precision: 5, scale: 2 }).default("0"),
  holidayPay: int("holiday_pay").default(0),
  positionAllowance: int("position_allowance").default(0),
  commuteAllowance: int("commute_allowance").default(0),
  housingAllowance: int("housing_allowance").default(0),
  otherAllowance: int("other_allowance").default(0),
  totalEarnings: int("total_earnings").notNull(),

  // 控除
  healthInsurance: int("health_insurance").default(0),
  nursingInsurance: int("nursing_insurance").default(0),
  pensionInsurance: int("pension_insurance").default(0),
  employmentInsurance: int("employment_insurance").default(0),
  socialInsuranceTotal: int("social_insurance_total").default(0),
  incomeTax: int("income_tax").default(0),
  residentTax: int("resident_tax").default(0),
  otherDeduction: int("other_deduction").default(0),
  totalDeductions: int("total_deductions").notNull(),

  netPay: int("net_pay").notNull(),
  memo: text("memo"),
  createdAt: datetime("created_at").defaultCurrentTimestamp(),
});

export const bonusRecords = mssqlTable("bonus_records", {
  id: int("id").primaryKey().identity(),
  employeeId: int("employee_id").notNull().references(() => employees.id),
  year: int("year").notNull(),
  bonusType: varchar("bonus_type", { length: 20 }).notNull(),
  paymentDate: varchar("payment_date", { length: 10 }),
  baseAmount: int("base_amount").notNull(),
  performanceRate: decimal("performance_rate", { precision: 4, scale: 2 }).default("1.00"),
  totalAmount: int("total_amount").notNull(),

  healthInsurance: int("health_insurance").default(0),
  nursingInsurance: int("nursing_insurance").default(0),
  pensionInsurance: int("pension_insurance").default(0),
  employmentInsurance: int("employment_insurance").default(0),
  socialInsuranceTotal: int("social_insurance_total").default(0),
  incomeTax: int("income_tax").default(0),
  totalDeductions: int("total_deductions").notNull(),
  netPay: int("net_pay").notNull(),
  memo: text("memo"),
  createdAt: datetime("created_at").defaultCurrentTimestamp(),
});
