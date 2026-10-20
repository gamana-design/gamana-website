import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { createMediaUploadTicket } from "@/lib/storage";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_MEDIA_UPLOAD_ERROR,
} from "@/lib/upload-response";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Upload details could not be read. Please try again." },
      { status: 400 },
    );
  }
  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Invalid upload details." },
      { status: 400 },
    );
  }

  const fileSize = Number(body.fileSize);
  if (Number.isFinite(fileSize) && fileSize > MAX_MEDIA_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: MAX_MEDIA_UPLOAD_ERROR },
      { status: 413 },
    );
  }
  if (
    typeof body.fileName !== "string" ||
    typeof body.contentType !== "string" ||
    typeof body.folder !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid upload details." },
      { status: 400 },
    );
  }

  try {
    const ticket = await createMediaUploadTicket({
      fileName: body.fileName,
      fileSize,
      contentType: body.contentType,
      folder: body.folder,
      label: typeof body.label === "string" ? body.label : "",
    });
    return NextResponse.json(ticket);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = message.includes("25 MB upload limit") ? 413 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
