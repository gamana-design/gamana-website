# Set up payment notifications — beginner-friendly guide

You do not need to write code or use a terminal for these steps.

## What is a webhook?

A webhook is an automatic message from Razorpay to your website. It tells the
website that a payment was completed, even if the customer closes their browser.

For this setup, stay in **Test Mode**. We are not enabling real payments, printing,
or shipping. Leave your existing Shopify payment settings and live webhooks alone.

## Before you begin

You need access to your Razorpay and Vercel dashboards. Vercel is the service that
hosts your new GAMANA website.

You will also choose a new private password for these payment messages. Razorpay
calls this a **webhook secret**. Use a password manager to generate a unique random
password of at least 32 characters. Save it privately: you will paste the exact
same value into two dashboard fields below.

**Do not use your Razorpay API Key Secret, Shopify password, or any existing
password. Do not send this private value in chat.**

## Part 1 — save the private password on your website

1. Open [Vercel](https://vercel.com) and sign in.
2. Open your **gamana** project.
3. Click **Settings**, then **Environment Variables**. This is Vercel's name for
   the website's saved settings.
4. Find the existing setting named **RAZORPAY_WEBHOOK_SECRET**.
5. Open its menu and choose **Edit**. Update the existing setting rather than
   creating another setting with the same name.
6. Paste your new private password into its **Value** field.
7. Keep **Production** selected. You may keep any other already-selected
   environments as they are. Here, Production means your main website; it does
   **not** turn on real payments.
8. Click **Save**.
9. Leave **RAZORPAY_MODE** set to **test**. Do not change the live key settings.

**You are finished with this part when:** the existing setting is saved with a
non-empty value. Vercel may hide the value afterwards; that is normal.

Saving this setting does not update the running website until it is republished.
Do not worry about that yet; the agent can handle republishing after Part 2.

## Part 2 — create the payment notification in Razorpay

1. Open the [Razorpay Dashboard](https://dashboard.razorpay.com) and sign in.
2. Use the mode selector to choose **Test Mode**.
3. Open **Account & Settings** (sometimes labelled **Accounts & Settings**).
4. Under **Website and app settings**, click **Webhooks**.
5. Click **+ Add New Webhook**.
6. Fill in the form as follows:

| Field on the screen | What to enter |
| --- | --- |
| **Webhook URL** or **URL** | `https://gamana-wear.vercel.app/api/payments/webhook` |
| **Secret** | The exact same private password you saved in Vercel in Part 1. |
| **Alert Email** | An email address you check. Razorpay uses it to report problems with these messages. |
| **Active Events** | Select **payment.captured** and **order.paid**. Leave unrelated events unchecked. |

The event names mean "payment successfully collected" and "order paid". Copy the
URL exactly, including `https://` and `/api/payments/webhook`.

7. Click **Create Webhook** or the equivalent save button.
8. Check that the new webhook appears in the list and is **Enabled**. If necessary,
   open it and change its status to Enabled.

**You are finished with this part when:** the new webhook is listed in Test Mode,
the URL matches the one above, and both requested events are selected.

This URL is a destination for Razorpay's messages, not a page customers visit.
Opening it in your browser is not a useful way to test it.

## Part 3 — let the agent publish and check it

Reply in chat:

> I saved the webhook secret in Vercel and created the Test Mode webhook.

Do not include the secret. The agent can then republish the website so it reads
the saved setting and check whether checkout is ready for a test payment.

If Razorpay sends a notification before the updated website is published, it may
report a temporary delivery failure. Tell the agent if that happens rather than
changing Shopify settings or turning on live payments.

## Before making a test payment

- In Razorpay's Test Mode settings, find **Payment Capture** and choose automatic
  capture. This tells Razorpay to complete successful payments automatically. If
  you cannot find that setting, ask for help rather than changing live settings.
- After the website is republished, open [the GAMANA shop](https://gamana-wear.vercel.app/shop),
  add a product, and go to checkout.
- Confirm that checkout shows a **Test checkout** message before proceeding.
- Use Razorpay's test payment options. Do not use real payment details for testing.
- A successful test should show a test confirmation and an order number, with no
  real printing or shipping order created.

## If you get stuck

Tell the agent which step you reached, or share a screenshot of that screen.
**Hide all passwords, secrets, private keys, and customer information first.**
Dashboard labels can vary slightly; the agent should help you find the equivalent
button without expecting you to understand technical terms.

Official Razorpay instructions: https://razorpay.com/docs/webhooks/setup-edit-payments/
