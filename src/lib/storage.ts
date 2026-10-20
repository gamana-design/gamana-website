import "server-only";

import { randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_MEDIA_UPLOAD_ERROR,
} from "@/lib/upload-response";

export async function uploadMedia(
  file: File,
  folder: string,
  { allowedTypes, label }: { allowedTypes?: string[]; label?: string } = {},
) {
  if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
    throw new Error(MAX_MEDIA_UPLOAD_ERROR);
  }

  const types = allowedTypes ?? [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
    ...(folder === "designs" ? ["application/pdf"] : []),
  ];
  if (!types.includes(file.type)) throw new Error("Unsupported file type.");

  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase is not configured.");

  const ext = (file.name.split(".").pop() || "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const safe =
    (label || file.name.replace(/\.[^.]+$/, ""))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "upload";
  const path = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}-${safe}.${ext}`;
  const { error } = await db.storage
    .from("gamana-media")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });
  if (error) throw error;

  const { data } = db.storage.from("gamana-media").getPublicUrl(path);
  return { url: data.publicUrl, path, size: file.size, contentType: file.type };
}
