import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { employeeFiles } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getEmployeeFilesContainer } from "@/lib/storage";

export const runtime = "nodejs";

async function findFile(employeeId: number, fileId: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(employeeFiles)
    .where(
      and(
        eq(employeeFiles.id, fileId),
        eq(employeeFiles.employeeId, employeeId)
      )
    );
  return rows[0] ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const employeeId = parseInt(params.id, 10);
    const fileId = parseInt(params.fileId, 10);
    if (isNaN(employeeId) || isNaN(fileId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const file = await findFile(employeeId, fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const container = await getEmployeeFilesContainer();
    const blockBlobClient = container.getBlockBlobClient(file.blobName);
    const buffer = await blockBlobClient.downloadToBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          file.fileName
        )}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Failed to download employee file:", error);
    return NextResponse.json(
      { error: "Failed to download employee file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const employeeId = parseInt(params.id, 10);
    const fileId = parseInt(params.fileId, 10);
    if (isNaN(employeeId) || isNaN(fileId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const file = await findFile(employeeId, fileId);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const container = await getEmployeeFilesContainer();
    await container.getBlockBlobClient(file.blobName).deleteIfExists();

    const db = await getDb();
    await db.delete(employeeFiles).where(eq(employeeFiles.id, fileId));

    return NextResponse.json({ message: "File deleted" });
  } catch (error) {
    console.error("Failed to delete employee file:", error);
    return NextResponse.json(
      { error: "Failed to delete employee file" },
      { status: 500 }
    );
  }
}
