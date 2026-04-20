import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { payrollRecords, employees } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { MonthlyReport } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { error: "Missing required query parameters: year, month" },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum)) {
      return NextResponse.json(
        { error: "Invalid year or month format" },
        { status: 400 }
      );
    }

    const records = await db
      .select({
        id: payrollRecords.id,
        employeeId: payrollRecords.employeeId,
        year: payrollRecords.year,
        month: payrollRecords.month,
        paymentDate: payrollRecords.paymentDate,
        baseSalary: payrollRecords.baseSalary,
        overtimeHours: payrollRecords.overtimeHours,
        overtimePay: payrollRecords.overtimePay,
        lateNightHours: payrollRecords.lateNightHours,
        lateNightPay: payrollRecords.lateNightPay,
        holidayHours: payrollRecords.holidayHours,
        holidayPay: payrollRecords.holidayPay,
        positionAllowance: payrollRecords.positionAllowance,
        commuteAllowance: payrollRecords.commuteAllowance,
        housingAllowance: payrollRecords.housingAllowance,
        otherAllowance: payrollRecords.otherAllowance,
        totalEarnings: payrollRecords.totalEarnings,
        healthInsurance: payrollRecords.healthInsurance,
        nursingInsurance: payrollRecords.nursingInsurance,
        pensionInsurance: payrollRecords.pensionInsurance,
        employmentInsurance: payrollRecords.employmentInsurance,
        socialInsuranceTotal: payrollRecords.socialInsuranceTotal,
        incomeTax: payrollRecords.incomeTax,
        residentTax: payrollRecords.residentTax,
        otherDeduction: payrollRecords.otherDeduction,
        totalDeductions: payrollRecords.totalDeductions,
        netPay: payrollRecords.netPay,
        memo: payrollRecords.memo,
        employee: {
          id: employees.id,
          employeeCode: employees.employeeCode,
          lastName: employees.lastName,
          firstName: employees.firstName,
          lastNameKana: employees.lastNameKana,
          firstNameKana: employees.firstNameKana,
          email: employees.email,
          department: employees.department,
          position: employees.position,
          hireDate: employees.hireDate,
          birthDate: employees.birthDate,
          baseSalary: employees.baseSalary,
          positionAllowance: employees.positionAllowance,
          commuteAllowance: employees.commuteAllowance,
          housingAllowance: employees.housingAllowance,
          dependents: employees.dependents,
          isActive: employees.isActive,
          healthInsuranceGrade: employees.healthInsuranceGrade,
          pensionGrade: employees.pensionGrade,
        },
      })
      .from(payrollRecords)
      .innerJoin(employees, eq(payrollRecords.employeeId, employees.id))
      .where(
        and(
          eq(payrollRecords.year, yearNum),
          eq(payrollRecords.month, monthNum)
        )
      );

    const totalEarnings = records.reduce((sum, r) => sum + r.totalEarnings, 0);
    const totalDeductions = records.reduce((sum, r) => sum + r.totalDeductions, 0);
    const totalNetPay = records.reduce((sum, r) => sum + r.netPay, 0);
    const totalSocialInsurance = records.reduce(
      (sum, r) => sum + r.socialInsuranceTotal,
      0
    );
    const totalIncomeTax = records.reduce((sum, r) => sum + r.incomeTax, 0);
    const totalResidentTax = records.reduce((sum, r) => sum + r.residentTax, 0);

    const report: MonthlyReport = {
      year: yearNum,
      month: monthNum,
      totalEmployees: records.length,
      totalEarnings,
      totalDeductions,
      totalNetPay,
      totalSocialInsurance,
      totalIncomeTax,
      totalResidentTax,
      records: records.map((r) => ({
        id: r.id,
        employeeId: r.employeeId,
        year: r.year,
        month: r.month,
        paymentDate: r.paymentDate,
        baseSalary: r.baseSalary,
        overtimeHours: r.overtimeHours,
        overtimePay: r.overtimePay,
        lateNightHours: r.lateNightHours,
        lateNightPay: r.lateNightPay,
        holidayHours: r.holidayHours,
        holidayPay: r.holidayPay,
        positionAllowance: r.positionAllowance,
        commuteAllowance: r.commuteAllowance,
        housingAllowance: r.housingAllowance,
        otherAllowance: r.otherAllowance,
        totalEarnings: r.totalEarnings,
        healthInsurance: r.healthInsurance,
        nursingInsurance: r.nursingInsurance,
        pensionInsurance: r.pensionInsurance,
        employmentInsurance: r.employmentInsurance,
        socialInsuranceTotal: r.socialInsuranceTotal,
        incomeTax: r.incomeTax,
        residentTax: r.residentTax,
        otherDeduction: r.otherDeduction,
        totalDeductions: r.totalDeductions,
        netPay: r.netPay,
        memo: r.memo,
        employee: r.employee,
      })),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
