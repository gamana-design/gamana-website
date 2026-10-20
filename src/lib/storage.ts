import "server-only";

import { randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  MEDIA_STORAGE_BUCKET,
  mediaUploadValidationError,
} from "@/lib/upload-response";

const extensionByContentType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export type MediaUploadRequest = {
  fileName: string;
  fileSize: number;
  contentType: string;
  folder: string;
  label?: string;
};

/** Create a one-file upload token; the image itself travels directly to Storage. */
export async function createMediaUploadTicket(input: MediaUploadRequest) {
  const { fileName, fileSize, contentType, folder, label } = input;
  const validationError = mediaUploadValidationError(input);
  if (validationError) throw new Error(validationError);

  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase is not configured.");

  const ext = extensionByContentType[contentType];
  const safeLabel = (label || fileName.replace(/\.[^.]+$/, ""))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
  const safe = safeLabel || "upload";
  const path = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}-${safe}.${ext}`;

  const { data, error } = await db.storage
    .from(MEDIA_STORAGE_BUCKET)
    .createSignedUploadUrl(path, { upsert: false });
  if (error) throw new Error(error.message);

  const { data: publicData } = db.storage
    .from(MEDIA_STORAGE_BUCKET)
    .getPublicUrl(path);
  return {
    path: data.path || path,
    token: data.token,
    url: publicData.publicUrl,
  };
}
