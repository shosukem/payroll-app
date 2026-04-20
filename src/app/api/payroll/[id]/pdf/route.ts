import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { payrollRecords, employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const record = await db
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.id, id))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json(
        { error: "給与記録が見つかりません" },
        { status: 404 }
      );
    }

    const payroll = record[0];
    const emp = await db
      .select()
      .from(employees)
      .where(eq(employees.id, payroll.employeeId))
      .limit(1);

    if (emp.length === 0) {
      return NextResponse.json(
        { error: "従業員情報が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      payroll: payroll,
      employee: emp[0],
    });
  } catch (error) {
    console.error("PDF data fetch error:", error);
    return NextResponse.json(
      { error: "データ取得に失敗しました" },
      { status: 500 }
    );
  }
}
