import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  hashAdminPassword,
  isStrongAdminPassword,
  verifyAdminPasswordHash,
} from "../src/lib/admin-password-crypto";

const read = (path: string) => readFileSync(path, "utf8");

test("admin passwords are saved as salted PBKDF2 hashes", async () => {
  const password = "A long, private sentence 2026!";
  const firstHash = await hashAdminPassword(password);
  const secondHash = await hashAdminPassword(password);

  assert.match(firstHash, /^pbkdf2\$600000\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
  assert.notEqual(firstHash, password);
  assert.notEqual(firstHash, secondHash, "each password hash should use a new salt");
  assert.equal(await verifyAdminPasswordHash(password, firstHash), true);
  assert.equal(await verifyAdminPasswordHash("a different password", firstHash), false);
  assert.equal(await verifyAdminPasswordHash(password, "not-a-password-hash"), false);
  assert.equal(isStrongAdminPassword("12345678901"), false);
  assert.equal(isStrongAdminPassword("123456789012"), true);
  assert.equal(isStrongAdminPassword("x".repeat(129)), false);
});

test("password storage is private and only the server role can use it", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    await db.exec(read("src/lib/admin-password-schema.sql"));
    const result = await db.query<{
      row_security_enabled: boolean;
      anon_can_read: boolean;
      anon_can_write: boolean;
      signed_in_can_read: boolean;
      signed_in_can_write: boolean;
      server_can_read: boolean;
      server_can_write: boolean;
      stored_records: number;
    }>(`
      select
        c.relrowsecurity as row_security_enabled,
        has_table_privilege('anon', 'public.gamana_admin_passwords', 'select') as anon_can_read,
        has_table_privilege('anon', 'public.gamana_admin_passwords', 'insert,update,delete') as anon_can_write,
        has_table_privilege('authenticated', 'public.gamana_admin_passwords', 'select') as signed_in_can_read,
        has_table_privilege('authenticated', 'public.gamana_admin_passwords', 'insert,update,delete') as signed_in_can_write,
        has_table_privilege('service_role', 'public.gamana_admin_passwords', 'select') as server_can_read,
        has_table_privilege('service_role', 'public.gamana_admin_passwords', 'insert,update') as server_can_write,
        (select count(*)::int from public.gamana_admin_passwords) as stored_records
      from pg_class c
      where c.oid = 'public.gamana_admin_passwords'::regclass
    `);
    const row = result.rows[0];
    assert.equal(row.row_security_enabled, true);
    assert.equal(row.anon_can_read, false);
    assert.equal(row.anon_can_write, false);
    assert.equal(row.signed_in_can_read, false);
    assert.equal(row.signed_in_can_write, false);
    assert.equal(row.server_can_read, true);
    assert.equal(row.server_can_write, true);
    assert.equal(row.stored_records, 0);

    await db.exec("set role anon");
    await assert.rejects(
      db.query("select password_hash from public.gamana_admin_passwords"),
    );
  } finally {
    await db.close();
  }
});

test("password change needs the current password, a same-site request and an admin session", () => {
  const route = read("src/app/api/admin/password/route.ts");
  assert.match(route, /process\.env\.VERCEL_ENV !== "production"/);
  assert.match(route, /if \(!isSameOrigin\(req\)\)/);
  assert.match(route, /await requireAdmin\(\)/);
  assert.match(route, /checkAdminPassword\(currentPassword\)/);
  assert.match(route, /hashAdminPassword\(newPassword\)/);
  assert.match(route, /password_hash: passwordHash/);
  assert.match(route, /maxAge: 0/);
  assert.doesNotMatch(route, /console\.(?:log|error)\([^\n]*(?:password|Password)/);

  const form = read("src/components/admin/change-password-form.tsx");
  for (const label of [
    "Current password",
    "New password",
    "Type the new password again",
    "Save new password",
  ])
    assert.ok(form.includes(label), `Missing ${label}`);
  assert.match(form, /12 or more characters/);
});

test("the password database record is used to invalidate older signed-in sessions", () => {
  const auth = read("src/lib/admin-auth.ts");
  assert.match(auth, /issuedAt <= changedAt/);
  assert.match(auth, /getAdminPasswordRecord\(\)/);
});
