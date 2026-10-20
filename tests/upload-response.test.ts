import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_MEDIA_UPLOAD_ERROR,
  parseMediaUploadResponse,
} from "../src/lib/upload-response";

test("large image uploads stay below the serverless request-body limit", () => {
  assert.equal(MAX_MEDIA_UPLOAD_BYTES, 4 * 1024 * 1024);
  assert.match(MAX_MEDIA_UPLOAD_ERROR, /4 MB upload limit/);
});

test("plain-text proxy 413 responses show a useful size message, not a JSON parse error", async () => {
  await assert.rejects(
    parseMediaUploadResponse(
      new Response("Request Entity Too Large", { status: 413 }),
    ),
    /4 MB upload limit/,
  );
});

test("oversize text is recognized even if a proxy uses a different status", async () => {
  await assert.rejects(
    parseMediaUploadResponse(
      new Response("Request Entity Too Large", { status: 500 }),
    ),
    /4 MB upload limit/,
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

test("JSON upload errors are preserved and successful uploads return their URL", async () => {
  await assert.rejects(
    parseMediaUploadResponse(
      Response.json({ error: "Supabase is not configured." }, { status: 400 }),
    ),
    /Supabase is not configured/,
  );

  const result = await parseMediaUploadResponse(
    Response.json({ url: "https://example.supabase.co/storage/image.png" }),
  );
  assert.equal(result.url, "https://example.supabase.co/storage/image.png");
});

test("successful but malformed responses never become uncaught JSON syntax errors", async () => {
  await assert.rejects(
    parseMediaUploadResponse(new Response("OK", { status: 200 })),
    /unexpected response \(HTTP 200\)/,
  );
});
