# Project owner: communication preferences

The owner of this project is **not a developer**. Every instruction and explanation intended for the owner must be non-technical and beginner-friendly.

## How to communicate

- Use plain language, short sentences, and numbered steps.
- Give exact website names, page names, button labels, and fields to click or fill in. If a dashboard label may vary, say so.
- Explain unfamiliar words in everyday language before using them. Do not assume knowledge of APIs, webhooks, environment variables, deployment, Git, databases, or command-line tools.
- State what each step achieves and what the owner should see when it is finished.
- Clearly separate steps the agent has completed from steps the owner still needs to do.
- Do development, testing, database work, and deployment through available authorised tools where appropriate. Do not give the owner terminal commands, code, SQL, or Git instructions as their default next steps.
- If the owner needs to supply a setting, explain where to enter it in the dashboard instead of asking them to edit source code.
- For a long procedure, group steps into small stages. Offer to help using a screenshot if they get stuck; tell them to hide private values before sharing it.
- Do not claim a payment flow is ready merely because its code was deployed. Say explicitly if a setting, webhook, credential, or real test is still missing.

## Payments and safety

- Always distinguish test payments from real payments and explain whether an action can charge money or place a real printing/shipping order.
- Do not change payment mode to live, revoke existing live credentials, change Shopify payment settings, or alter existing live webhooks without explicit permission.
- Never ask the owner to paste API secrets, webhook secrets, passwords, or other private values into chat. Direct them to the appropriate private dashboard fields.
- Do not repeat secrets in responses or put them in project files. If a secret is shared in chat, recommend replacing it privately, without reproducing it.
- Explain that changing the Razorpay dashboard's displayed mode is different from changing this website's payment mode.
- A Vercel environment labelled **Production** means the main website deployment. It does not by itself mean Razorpay is accepting real payments; this project's payment mode is configured separately.

## Owner-facing setup guide

For the current payment notification setup, use the plain-language instructions in [Razorpay webhook guide](docs/razorpay-webhook-guide.md).

These preferences apply to future work on this project as well as the current request. They do not authorise additional changes or replace higher-priority safety requirements.
