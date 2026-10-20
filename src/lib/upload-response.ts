export const MAX_MEDIA_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_MEDIA_UPLOAD_ERROR =
  "This file is over the 4 MB upload limit. Please resize or compress it and try again.";

export type MediaUploadResult = {
  url: string;
  path?: string;
  size?: number;
  contentType?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse upload responses without exposing proxy HTML/text as a JSON syntax error. */
export async function parseMediaUploadResponse(
  response: Pick<Response, "ok" | "status" | "text">,
): Promise<MediaUploadResult> {
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
        : "Upload failed. Please try again.";
    if (
      /maximum upload size|file.*too large|request entity too large/i.test(
        message,
      )
    ) {
      throw new Error(MAX_MEDIA_UPLOAD_ERROR);
    }
    throw new Error(message);
  }

  if (!isRecord(payload) || typeof payload.url !== "string" || !payload.url) {
    throw new Error(
      "The upload completed without returning a file link. Please try again.",
    );
  }

  return payload as MediaUploadResult;
}
