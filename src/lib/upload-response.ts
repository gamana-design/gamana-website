export const MAX_MEDIA_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_MEDIA_UPLOAD_ERROR =
  "This file exceeds the 25 MB upload limit. Please choose a smaller file and try again.";
export const MEDIA_STORAGE_BUCKET = "gamana-media";

export const MEDIA_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;
export const MEDIA_UPLOAD_FOLDERS = ["products", "designs", "mockups"] as const;

export type MediaUploadTicket = {
  url: string;
  path: string;
  token: string;
};

export type MediaUploadMetadata = {
  fileName: string;
  fileSize: number;
  contentType: string;
  folder: string;
};

export function mediaUploadValidationError({
  fileName,
  fileSize,
  contentType,
  folder,
}: MediaUploadMetadata): string | null {
  if (!new Set<string>(MEDIA_UPLOAD_FOLDERS).has(folder)) {
    return "Invalid upload folder.";
  }
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) {
    return "Choose a non-empty file to upload.";
  }
  if (fileSize > MAX_MEDIA_UPLOAD_BYTES) return MAX_MEDIA_UPLOAD_ERROR;
  if (!fileName.trim() || fileName.length > 255) {
    return "The file name is invalid.";
  }
  const allowedTypes: readonly string[] =
    folder === "designs"
      ? [...MEDIA_IMAGE_CONTENT_TYPES, "application/pdf"]
      : MEDIA_IMAGE_CONTENT_TYPES;
  if (!allowedTypes.includes(contentType)) {
    return folder === "designs"
      ? "Unsupported file type. Use a JPG, PNG, WebP, AVIF, GIF, or PDF file."
      : "Unsupported file type. Use a JPG, PNG, WebP, AVIF, or GIF image.";
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse ticket responses without exposing proxy text as a JSON syntax error. */
export async function parseMediaUploadResponse(
  response: Pick<Response, "ok" | "status" | "text">,
): Promise<MediaUploadTicket> {
  let body = "";
  try {
    body = await response.text();
  } catch {
    throw new Error("Could not read the upload response. Please try again.");
  }

  if (
    response.status === 413 ||
    /request entity too large|payload too large|maximum upload size/i.test(body)
  ) {
    throw new Error(MAX_MEDIA_UPLOAD_ERROR);
  }

  let payload: unknown;
  try {
    payload = body ? JSON.parse(body) : null;
  } catch {
    throw new Error(
      `The upload service returned an unexpected response (HTTP ${response.status}). Please try again.`,
    );
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : "Could not prepare the upload. Please try again.";
    if (
      /maximum upload size|file.*too large|file exceeds the .*upload limit|request entity too large/i.test(
        message,
      )
    ) {
      throw new Error(MAX_MEDIA_UPLOAD_ERROR);
    }
    throw new Error(message);
  }

  if (
    !isRecord(payload) ||
    typeof payload.url !== "string" ||
    !payload.url ||
    typeof payload.path !== "string" ||
    !payload.path ||
    typeof payload.token !== "string" ||
    !payload.token
  ) {
    throw new Error(
      "The upload service did not return a secure upload link. Please try again.",
    );
  }

  return payload as MediaUploadTicket;
}

export function mediaStorageErrorMessage(message: string | undefined) {
  if (
    message &&
    /413|too large|maximum.*size|size limit|exceeds? the maximum/i.test(message)
  ) {
    return MAX_MEDIA_UPLOAD_ERROR;
  }
  return message || "The image upload failed. Please try again.";
}
