import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { payrollRecords, employees } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { calculatePayroll } from "@/lib/tax-calculator";
import type { PayrollInput } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    let query = db
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
      })
      .from(payrollRecords);

    const conditions = [];
    if (year) {
      conditions.push(eq(payrollRecords.year, parseInt(year, 10)));
    }
    if (month) {
      conditions.push(eq(payrollRecords.month, parseInt(month, 10)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(payrollRecords.year), desc(payrollRecords.month));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch payroll records:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json() as PayrollInput;

    if (!body.employeeId || !body.year || !body.month) {
      return NextResponse.json(
        { error: "Missing required fields: employeeId, year, month" },
        { status: 400 }
      );
    }

    const employee = await db
      .select()
      .from(employees)
      .where(eq(employees.id, body.employeeId));

    if (employee.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const emp = employee[0];

    const payrollData = calculatePayroll({
      baseSalary: emp.baseSalary,
      positionAllowance: emp.positionAllowance,
      commuteAllowance: emp.commuteAllowance,
      housingAllowance: emp.housingAllowance,
      overtimeHours: body.overtimeHours || 0,
      lateNightHours: body.lateNightHours || 0,
      holidayHours: body.holidayHours || 0,
      otherAllowance: body.otherAllowance || 0,
      otherDeduction: body.otherDeduction || 0,
      residentTax: body.residentTax || 0,
      dependents: emp.dependents,
      healthInsuranceGrade: emp.healthInsuranceGrade,
      pensionGrade: emp.pensionGrade,
      birthDate: emp.birthDate,
    });

    const result = await db
      .insert(payrollRecords)
      .values({
        employeeId: body.employeeId,
        year: body.year,
        month: body.month,
        baseSalary: emp.baseSalary,
        overtimeHours: String(body.overtimeHours || 0),
        overtimePay: payrollData.overtimePay,
        lateNightHours: String(body.lateNightHours || 0),
        lateNightPay: payrollData.lateNightPay,
        holidayHours: String(body.holidayHours || 0),
        holidayPay: payrollData.holidayPay,
        positionAllowance: emp.positionAllowance,
        commuteAllowance: emp.commuteAllowance,
        housingAllowance: emp.housingAllowance,
        otherAllowance: body.otherAllowance || 0,
        totalEarnings: payrollData.totalEarnings,
        healthInsurance: payrollData.healthInsurance,
        nursingInsurance: payrollData.nursingInsurance,
        pensionInsurance: payrollData.pensionInsurance,
        employmentInsurance: payrollData.employmentInsurance,
        socialInsuranceTotal: payrollData.socialInsuranceTotal,
        incomeTax: payrollData.incomeTax,
        residentTax: payrollData.residentTax,
        otherDeduction: body.otherDeduction || 0,
        totalDeductions: payrollData.totalDeductions,
        netPay: payrollData.netPay,
        memo: body.memo || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create payroll record:", error);
    return NextResponse.json(
      { error: "Failed to create payroll record" },
      { status: 500 }
    );
  }
}
