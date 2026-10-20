import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { uploadMedia } from "@/lib/storage";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_MEDIA_UPLOAD_ERROR,
} from "@/lib/upload-response";

export const dynamic = "force-dynamic";

const MAX_MULTIPART_OVERHEAD_BYTES = 128 * 1024;
const allowedFolders = ["products", "designs", "mockups"];

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const contentLength = Number(req.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_MEDIA_UPLOAD_BYTES + MAX_MULTIPART_OVERHEAD_BYTES
  ) {
    return NextResponse.json(
      { error: MAX_MEDIA_UPLOAD_ERROR },
      { status: 413 },
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "products");

    if (!(file instanceof File) || !allowedFolders.includes(folder)) {
      return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }
    if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: MAX_MEDIA_UPLOAD_ERROR },
        { status: 413 },
      );
    }

    const result = await uploadMedia(file, folder, {
      label: String(form.get("label") || ""),
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = message === MAX_MEDIA_UPLOAD_ERROR ? 413 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
