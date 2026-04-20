import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { bonusRecords, employees } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { calculateBonusDeductions } from "@/lib/tax-calculator";
import type { BonusInput } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const bonusType = searchParams.get("bonusType");

    let query = db.select().from(bonusRecords);
    const conditions = [];

    if (year) {
      conditions.push(eq(bonusRecords.year, parseInt(year, 10)));
    }
    if (bonusType) {
      conditions.push(eq(bonusRecords.bonusType, bonusType));
    }

    if (conditions.length > 0) {
      // @ts-ignore - drizzle-orm types
      query = query.where(conditions.length === 1 ? conditions[0] : db.and(...conditions));
    }

    const result = await query.orderBy(desc(bonusRecords.year), desc(bonusRecords.bonusType));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch bonus records:", error);
    return NextResponse.json(
      { error: "Failed to fetch bonus records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json() as BonusInput;

    if (!body.employeeId || !body.year || !body.bonusType || !body.baseAmount) {
      return NextResponse.json(
        { error: "Missing required fields: employeeId, year, bonusType, baseAmount" },
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
    const performanceRate = body.performanceRate || 1;
    const totalAmount = Math.floor(body.baseAmount * performanceRate);

    const bonusDeductions = calculateBonusDeductions({
      totalAmount,
      healthInsuranceGrade: emp.healthInsuranceGrade,
      pensionGrade: emp.pensionGrade,
      birthDate: emp.birthDate,
    });

    const result = await db
      .insert(bonusRecords)
      .values({
        employeeId: body.employeeId,
        year: body.year,
        bonusType: body.bonusType,
        baseAmount: body.baseAmount,
        performanceRate: String(performanceRate),
        totalAmount,
        healthInsurance: bonusDeductions.healthInsurance,
        nursingInsurance: bonusDeductions.nursingInsurance,
        pensionInsurance: bonusDeductions.pensionInsurance,
        employmentInsurance: bonusDeductions.employmentInsurance,
        socialInsuranceTotal: bonusDeductions.socialInsuranceTotal,
        incomeTax: bonusDeductions.incomeTax,
        totalDeductions: bonusDeductions.totalDeductions,
        netPay: bonusDeductions.netPay,
        memo: body.memo || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create bonus record:", error);
    return NextResponse.json(
      { error: "Failed to create bonus record" },
      { status: 500 }
    );
  }
}
