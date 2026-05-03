import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { employees, employeeFiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  buildEmployeeBlobName,
  getEmployeeFilesContainer,
} from "@/lib/storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = parseInt(params.id, 10);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .select()
      .from(employeeFiles)
      .where(eq(employeeFiles.employeeId, employeeId))
      .orderBy(desc(employeeFiles.uploadedAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list employee files:", error);
    return NextResponse.json(
      { error: "Failed to list employee files" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = parseInt(params.id, 10);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const db = await getDb();
    const employee = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.id, employeeId));
    if (employee.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const category = (formData.get("category") as string | null) || null;
    const memo = (formData.get("memo") as string | null) || null;
    const uploadedBy = (formData.get("uploadedBy") as string | null) || null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing 'file' field" },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_FILE_SIZE} bytes)` },
        { status: 413 }
      );
    }

    const container = await getEmployeeFilesContainer();
    const blobName = buildEmployeeBlobName(employeeId, file.name);
    const blockBlobClient = container.getBlockBlobClient(blobName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type || "application/octet-stream",
        blobContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(
          file.name
        )}`,
      },
    });

    const inserted = await db
      .insert(employeeFiles)
      .values({
        employeeId,
        fileName: file.name,
        blobName,
        contentType: file.type || null,
        fileSize: file.size,
        category,
        memo,
        uploadedBy,
      })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("Failed to upload employee file:", error);
    return NextResponse.json(
      { error: "Failed to upload employee file" },
      { status: 500 }
    );
  }
}
