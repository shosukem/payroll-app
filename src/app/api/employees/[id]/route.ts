import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Employee } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to fetch employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await request.json() as Partial<Omit<Employee, 'id'>>;

    const result = await db
      .update(employees)
      .set({
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastNameKana !== undefined && { lastNameKana: body.lastNameKana }),
        ...(body.firstNameKana !== undefined && { firstNameKana: body.firstNameKana }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.department !== undefined && { department: body.department }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.hireDate && { hireDate: body.hireDate }),
        ...(body.birthDate !== undefined && { birthDate: body.birthDate }),
        ...(body.baseSalary !== undefined && { baseSalary: body.baseSalary }),
        ...(body.positionAllowance !== undefined && { positionAllowance: body.positionAllowance }),
        ...(body.commuteAllowance !== undefined && { commuteAllowance: body.commuteAllowance }),
        ...(body.housingAllowance !== undefined && { housingAllowance: body.housingAllowance }),
        ...(body.dependents !== undefined && { dependents: body.dependents }),
        ...(body.healthInsuranceGrade !== undefined && { healthInsuranceGrade: body.healthInsuranceGrade }),
        ...(body.pensionGrade !== undefined && { pensionGrade: body.pensionGrade }),
      })
      .where(eq(employees.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to update employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const result = await db
      .update(employees)
      .set({ isActive: false })
      .where(eq(employees.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
