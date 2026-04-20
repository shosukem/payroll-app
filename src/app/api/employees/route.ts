import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Employee } from "@/types";

export async function GET() {
  try {
    const db = await getDb();
    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.isActive, true));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json() as Omit<Employee, 'id'>;

    if (!body.employeeCode || !body.lastName || !body.firstName || !body.hireDate) {
      return NextResponse.json(
        { error: "Missing required fields: employeeCode, lastName, firstName, hireDate" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(employees)
      .values({
        employeeCode: body.employeeCode,
        lastName: body.lastName,
        firstName: body.firstName,
        lastNameKana: body.lastNameKana || null,
        firstNameKana: body.firstNameKana || null,
        email: body.email || null,
        department: body.department || null,
        position: body.position || null,
        hireDate: body.hireDate,
        birthDate: body.birthDate || null,
        baseSalary: body.baseSalary || 0,
        positionAllowance: body.positionAllowance || 0,
        commuteAllowance: body.commuteAllowance || 0,
        housingAllowance: body.housingAllowance || 0,
        dependents: body.dependents || 0,
        isActive: true,
        healthInsuranceGrade: body.healthInsuranceGrade || 1,
        pensionGrade: body.pensionGrade || 1,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
