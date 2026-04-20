import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { employees, payrollRecords } from "@/lib/db/schema";
import { eq, and, count, sum } from "drizzle-orm";

export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 全従業員数
    const totalResult = await db
      .select({ count: count() })
      .from(employees);

    // アクティブ従業員数
    const activeResult = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.isActive, true));

    // 今月の給与集計
    const payrollResult = await db
      .select({
        count: count(),
        totalNetPay: sum(payrollRecords.netPay),
        totalEarnings: sum(payrollRecords.totalEarnings),
      })
      .from(payrollRecords)
      .where(
        and(
          eq(payrollRecords.year, year),
          eq(payrollRecords.month, month)
        )
      );

    return NextResponse.json({
      totalEmployees: totalResult[0]?.count ?? 0,
      activeEmployees: activeResult[0]?.count ?? 0,
      currentMonth: {
        year,
        month,
        payrollCount: payrollResult[0]?.count ?? 0,
        totalNetPay: Number(payrollResult[0]?.totalNetPay ?? 0),
        totalEarnings: Number(payrollResult[0]?.totalEarnings ?? 0),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({
      totalEmployees: 0,
      activeEmployees: 0,
      currentMonth: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        payrollCount: 0,
        totalNetPay: 0,
        totalEarnings: 0,
      },
    });
  }
}
