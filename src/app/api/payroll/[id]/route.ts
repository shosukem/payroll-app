import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { payrollRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid payroll record ID" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(payrollRecords)
      .where(eq(payrollRecords.id, id));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Payroll record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to fetch payroll record:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll record" },
      { status: 500 }
    );
  }
}
