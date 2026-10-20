import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_MEDIA_UPLOAD_ERROR,
  MEDIA_STORAGE_BUCKET,
  mediaStorageErrorMessage,
  mediaUploadValidationError,
  parseMediaUploadResponse,
} from "../src/lib/upload-response";

test("uploads preserve original quality up to the 25 MB file-size cap", () => {
  assert.equal(MAX_MEDIA_UPLOAD_BYTES, 25 * 1024 * 1024);
  assert.match(MAX_MEDIA_UPLOAD_ERROR, /25 MB upload limit/);
  assert.equal(MEDIA_STORAGE_BUCKET, "gamana-media");
});

test("upload validation permits supported original image formats and PDFs only for design files", () => {
  const validImage = {
    fileName: "high-resolution.png",
    fileSize: 20 * 1024 * 1024,
    contentType: "image/png",
    folder: "products",
  };
  assert.equal(mediaUploadValidationError(validImage), null);
  assert.equal(
    mediaUploadValidationError({ ...validImage, contentType: "image/svg+xml" }),
    "Unsupported file type. Use a JPG, PNG, WebP, AVIF, or GIF image.",
  );
  assert.equal(
    mediaUploadValidationError({
      ...validImage,
      fileName: "print.pdf",
      contentType: "application/pdf",
      folder: "designs",
    }),
    null,
  );
  assert.equal(
    mediaUploadValidationError({ ...validImage, folder: "unexpected" }),
    "Invalid upload folder.",
  );
  assert.match(
    mediaUploadValidationError({
      ...validImage,
      fileSize: MAX_MEDIA_UPLOAD_BYTES + 1,
    }) ?? "",
    /25 MB upload limit/,
  );
});

test("plain-text proxy 413 responses show a useful size message, not a JSON parse error", async () => {
  await assert.rejects(
    parseMediaUploadResponse(
      new Response("Request Entity Too Large", { status: 413 }),
    ),
    /25 MB upload limit/,
  );
});

test("oversize text is recognized even if a proxy uses a different status", async () => {
  await assert.rejects(
    parseMediaUploadResponse(
      new Response("Request Entity Too Large", { status: 500 }),
    ),
    /25 MB upload limit/,
  );
});

test("other non-JSON failures get a readable fallback", async () => {
  await assert.rejects(
    parseMediaUploadResponse(
      new Response("Upstream unavailable", { status: 502 }),
    ),
    /unexpected response \(HTTP 502\)/,
  );
});

test("JSON ticket errors are preserved", async () => {
  await assert.rejects(
    parseMediaUploadResponse(
      Response.json({ error: "Supabase is not configured." }, { status: 400 }),
    ),
    /Supabase is not configured/,
  );
});

test("successful ticket responses return the original file's upload destination", async () => {
  const ticket = {
    url: "https://example.supabase.co/storage/v1/object/public/gamana-media/products/original.png",
    path: "products/original.png",
    token: "short-lived-upload-token",
  };
  const result = await parseMediaUploadResponse(Response.json(ticket));
  assert.deepEqual(result, ticket);
});

test("successful but malformed responses never become uncaught JSON syntax errors", async () => {
  await assert.rejects(
    parseMediaUploadResponse(new Response("OK", { status: 200 })),
    /unexpected response \(HTTP 200\)/,
  );
  await assert.rejects(
    parseMediaUploadResponse(
      Response.json({ url: "https://example.test/file.png" }),
    ),
    /secure upload link/,
  );
});

test("Storage size failures receive the same clear limit message", () => {
  assert.match(
    mediaStorageErrorMessage("The object exceeded the maximum size"),
    /25 MB upload limit/,
  );
  assert.equal(mediaStorageErrorMessage("Network error"), "Network error");
  assert.match(mediaStorageErrorMessage(undefined), /upload failed/i);
});
