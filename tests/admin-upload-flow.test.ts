import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

test("admin upload sends a small ticket request, then transfers the original file directly to Storage", () => {
  const route = read("src/app/api/admin/upload/route.ts");
  const field = read("src/components/admin/upload-field.tsx");
  const storage = read("src/lib/storage.ts");
  const browser = read("src/lib/supabase-browser.ts");

  assert.match(route, /requireAdmin\(\)/);
  assert.match(route, /createMediaUploadTicket/);
  assert.match(storage, /createSignedUploadUrl/);
  assert.match(storage, /from\("server-only"\)|import "server-only"/);
  assert.match(field, /uploadToSignedUrl/);
  assert.doesNotMatch(field, /new FormData\(|body\.set\("file"/);
  assert.match(browser, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(browser, /SUPABASE_SERVICE_ROLE_KEY/);
});
