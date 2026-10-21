# Razorpay checkout setup

## Generate Test Mode API keys

1. Sign in at https://dashboard.razorpay.com with an Owner/Admin account.
2. Switch the dashboard's mode selector from **Live Mode** to **Test Mode**.
3. Open **Account & Settings → API Keys** (under **Website and app settings**).
4. Select **Generate Key** (or **Generate Test Key**, depending on the dashboard).
5. Save the Key ID and Key Secret securely. The ID starts with `rzp_test_`.
   The secret is shown when generated; do not paste it in chat or commit it.

You do not need to regenerate or delete your Live Mode keys to use Test Mode.
Website approval is not required for generating Test Mode keys.
Official guide: https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/

## Database (before deploying the checkout)

Apply `src/lib/supabase-schema.sql` if the base `orders` and `order_items` tables
are missing, then apply `src/lib/razorpay-schema.sql` in the Supabase SQL editor.
The latter migration is additive and rerunnable. It preserves existing orders,
adds payment/shipping snapshots, and installs two service-role-only transaction
functions for atomic order creation and idempotent payment recording.

The application fails closed if database storage, schema or payment configuration
is unavailable. No successful prepaid order can be made through the old unpaid
`/api/orders` flow.

## Vercel environment variables

In the existing **gamana** project → Settings → Environment Variables, add:

```dotenv
RAZORPAY_MODE=test
RAZORPAY_TEST_KEY_ID=<your rzp_test_ Key ID>
RAZORPAY_TEST_KEY_SECRET=<the matching Test Mode Key Secret>
RAZORPAY_LIVE_KEY_ID=
RAZORPAY_LIVE_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=<a separate strong random secret you choose>
```

Test credentials and `RAZORPAY_MODE=test` can be configured for Production,
Preview and Development. Scope the live pair to **Production only**. Keep the
live variables empty until ready, and enter their values privately in Vercel.
The runtime selects only the complete pair for the chosen mode; it never falls
back from test credentials to live credentials or mixes the pairs.

Use the matching environment scope for the deployment being tested. Keep all
variables server-only (no `NEXT_PUBLIC_` prefix). Only the public Key ID is sent
to Razorpay Checkout by the server. Existing Supabase variables are still needed.
Redeploy after adding or changing environment variables.

Only the test pair is read in the default `test` mode; any incorrectly prefixed key is rejected. Do not set the mode to
`live` until the integration and fulfilment configuration have been tested.
Simulated online-payment test orders are stored for testing but **never
submitted to Qikink**, even if Qikink has live credentials.

## Razorpay webhook and capture settings

In the Razorpay **Test Mode** dashboard:

1. Set payment capture to **automatic capture** in Payment Capture settings.
   This integration confirms only captured payments, not merely authorised ones.
2. Go to **Account & Settings → Webhooks → Add New Webhook**.
3. Use the deployed endpoint:
   `https://gamana-wear.vercel.app/api/payments/webhook`
   (use the corresponding reachable domain for a separate preview environment).
4. Enter the same random value used for `RAZORPAY_WEBHOOK_SECRET`.
   This is not your API Key Secret.
5. Subscribe to **payment.captured** and **order.paid** and enable the webhook.

Use an endpoint without Vercel Deployment Protection for webhook delivery. Do not
disable protection broadly or expose environment variables just to test webhooks.
The provider's HMAC authenticates the webhook's original raw body.

## Checkout behaviour

- India-only delivery and INR payments.
- Existing prices are used unchanged; no new tax calculation or tax-inclusive
  claim is introduced. Confirm your tax policy before going live.
- Shipping is always free across India, with no minimum spend. Delivery is
  already included in existing product prices; do not increase them or add a
  checkout shipping surcharge. Browser and server use `src/lib/shipping.ts`
  (`SHIPPING_FEE = 0`); new orders store `shipping_paise = 0`. Historical order
  snapshots, including earlier shipping amounts, remain unchanged.
- Online payments only. Cash on delivery is not currently accepted. The order
  endpoint rejects COD requests even from an old checkout page; the former
  `CHECKOUT_COD_ENABLED` setting no longer enables it.
- Cart prices, product availability, exact variants and quantity limits are
  revalidated server-side. Unavailable lines are rejected, not silently dropped.
- Products missing or repeating any Store SKU are marked **Test only**. They may be
  included while checkout is in test mode, but live checkout rejects the whole
  product before saving an order or creating a Razorpay order. Test payments
  still never create a Qikink fulfilment order.
- A pending local order and item snapshots are committed together before
  payment. A per-checkout UUID deduplicates retries with identical details.
- Razorpay's success callback is not trusted by itself. The server verifies the
  signature and fetches the payment from Razorpay, checking payment ID, order,
  currency, amount, refund amount and captured status before marking it paid.
- A signed webhook can finish a payment if the browser closes after paying.
  Duplicate callback/webhook delivery cannot overwrite a later order state or
  resubmit the same fulfilment claim.
- Cancelled/failed payments preserve the bag. If verification is interrupted,
  the browser saves the payment response for a verification-only retry; it does
  not prompt for another payment. The order number remains available for tracking.
- Confirmation emails are **not** implemented or promised by this integration.
- Refund processing is not implemented. Manage refunds in Razorpay; reconcile
  affected orders before fulfilment if issuing a refund.

## Fulfilment safety and operational checks

In live mode, a paid prepaid order can be submitted to Qikink. Existing COD
records remain compatible with historical tracking/fulfilment, but new COD orders
are not accepted. SKUs must actually exist in the linked Qikink **My Products** account;
starter SKU examples are not proof that those products/designs are configured.
Confirm this before accepting real orders.

The server atomically claims each order before sending it to Qikink. If Qikink
times out or the result cannot be saved, fulfilment is left in `review` (or may
remain `submitting` after a function crash). It is intentionally **not blindly
retried**, because the provider may already have accepted it. Check Qikink using
the stored `order_number`/`qikink_reference` before any manual retry.

Monitor Supabase `orders` for:

```sql
select order_number,payment_status,fulfilment_status,status,created_at
from public.orders
where payment_status in ('paid','cod')
  and fulfilment_status in ('pending','submitting','review')
order by created_at;
```

`pending` may mean missing Qikink configuration. After correcting configuration,
replaying the signed captured-payment webhook can safely claim an unsubmitted
paid order. `review` or stale `submitting` requires manual provider reconciliation;
there is no order-management screen in the product-only admin. A background
reconciliation worker and operator alerts are not included in this implementation.

Gateway order setup can remain `payment-creating` if a function terminates before
linking the Razorpay order. Never reset a possibly paid order blindly. Inspect
Razorpay's receipt matching the GAMANA order number before repairing it.

## Test checklist

No real payment or Qikink order is needed to run `npm test`. The tests use mock
product/payment fixtures and an in-memory Postgres engine for transactional SQL.

With Test Mode configured, test end-to-end in Razorpay's hosted checkout:

- Successful payment, failed attempt, retry inside checkout and modal dismissal.
- Duplicate clicks and browser refresh without duplicate local orders.
- Close the browser after payment; confirm the webhook marks the order paid.
- Replay a captured webhook; verify no duplicate order/items/fulfilment.
- Tampered signature/amount/order, stale prices and out-of-stock items.
- Small, ordinary and multi-item carts all have zero additional shipping and
  a total equal to the product subtotal. COD requests are rejected before order creation.
- Confirm test orders have `payment_mode='test'`, `fulfilment_status='test'`, and
  no Qikink order ID. No real dispatch should be created.

A real Razorpay test transaction cannot be completed until Test Mode credentials,
capture settings, webhook and the database migration are configured.

## Go live deliberately

After passing tests, configure a **Live Mode** webhook with its own secret,
fill `RAZORPAY_LIVE_KEY_ID` and `RAZORPAY_LIVE_KEY_SECRET`, set `RAZORPAY_MODE=live` for Production only, confirm
Qikink and tax/shipping policies, and redeploy. Filling the live pair does not activate live payments by itself. Do not switch modes with unsettled
in-flight checkouts. Clear old test sessions before starting a live checkout.
