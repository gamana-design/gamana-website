import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

// Real Postgres semantics, in memory. No production data, credentials or APIs.
test("checkout SQL atomically stores snapshots, deduplicates retries and records payment once", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    await db.exec(
      readFileSync("src/lib/supabase-schema.sql", "utf8").replace(
        'create extension if not exists "pgcrypto";',
        "",
      ),
    );
    await db.exec(readFileSync("src/lib/razorpay-schema.sql", "utf8"));
    // Migration is safe to apply again.
    await db.exec(readFileSync("src/lib/razorpay-schema.sql", "utf8"));
    const order = {
      checkout_key: "00000000-0000-4000-8000-000000000001",
      request_fingerprint: "fixture",
      order_number: "gmfixture",
      full_name: "Test Customer",
      email: "fixture@example.com",
      phone: "9876543210",
      address1: "123 Test Street",
      address2: "",
      city: "Hyderabad",
      province: "Telangana",
      zip: "500001",
      payment_gateway: "Prepaid",
      payment_mode: "test",
      amount_paise: 127800,
      subtotal_paise: 119900,
      shipping_paise: 7900,
    };
    const items = [
      {
        product_id: "fixture",
        product_slug: "fixture",
        product_name: "Fixture Tee",
        line: "URBAN",
        sku: "FIXTURE-S",
        size: "S",
        color: "Bone",
        quantity: 1,
        unit_price: 1199,
      },
    ];
    async function create(o = order, lines = items) {
      const result = await db.query<{ id: string }>(
        "select public.gamana_create_checkout($1::jsonb,$2::jsonb) as id",
        [JSON.stringify(o), JSON.stringify(lines)],
      );
      return result.rows[0].id;
    }
    const id = await create();
    assert.equal(await create(), id);
    const counts = await db.query<{ count: number }>(
      "select count(*)::integer as count from public.order_items",
    );
    assert.equal(counts.rows[0].count, 1);
    await assert.rejects(create({ ...order, request_fingerprint: "changed" }));

    const testOnlyOrder = {
      ...order,
      checkout_key: "00000000-0000-4000-8000-000000000003",
      order_number: "gmtestonly",
    };
    const testOnlyId = await create(testOnlyOrder, [{ ...items[0], sku: "" }]);
    const storedTestSku = await db.query<{ sku: string }>(
      "select sku from public.order_items where order_id=$1",
      [testOnlyId],
    );
    assert.equal(storedTestSku.rows[0].sku, "");

    // A failure inserting an item rolls back the parent order too.
    const invalid = {
      ...order,
      checkout_key: "00000000-0000-4000-8000-000000000002",
      order_number: "gminvalid",
    };
    await assert.rejects(
      create(invalid, [{ ...items[0], sku: null as unknown as string }]),
    );
    assert.equal(
      (
        await db.query(
          "select id from public.orders where order_number='gminvalid'",
        )
      ).rows.length,
      0,
    );
    await db.query(
      "update public.orders set razorpay_order_id='order_fixture' where id=$1",
      [id],
    );
    await assert.rejects(
      db.query(
        "select public.gamana_mark_payment_paid($1,'pay_fixture',1,'INR')",
        [id],
      ),
    );
    await assert.rejects(
      db.query(
        "select public.gamana_mark_payment_paid($1,'pay_fixture',127800,'USD')",
        [id],
      ),
    );
    await db.query(
      "select public.gamana_mark_payment_paid($1,'pay_fixture',127800,'INR')",
      [id],
    );
    await db.query("update public.orders set status='shipped' where id=$1", [
      id,
    ]);
    await db.query(
      "select public.gamana_mark_payment_paid($1,'pay_fixture',127800,'INR')",
      [id],
    );
    const final = await db.query<{ status: string; payment_status: string }>(
      "select status,payment_status from public.orders where id=$1",
      [id],
    );
    assert.deepEqual(final.rows[0], {
      status: "shipped",
      payment_status: "paid",
    });
    await assert.rejects(
      db.query(
        "select public.gamana_mark_payment_paid($1,'pay_other',127800,'INR')",
        [id],
      ),
    );
    const privileges = await db.query<{ allowed: boolean }>(
      "select has_function_privilege('anon','public.gamana_mark_payment_paid(uuid,text,integer,text)','execute') as allowed",
    );
    assert.equal(privileges.rows[0].allowed, false);
    const claims = await db.query(
      "update public.orders set fulfilment_status='submitting' where id=$1 and fulfilment_status='pending' returning id",
      [id],
    );
    const duplicate = await db.query(
      "update public.orders set fulfilment_status='submitting' where id=$1 and fulfilment_status='pending' returning id",
      [id],
    );
    assert.equal(claims.rows.length, 1);
    assert.equal(duplicate.rows.length, 0);
  } finally {
    await db.close();
  }
});
