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

- Current store policy: online payments only. Do not re-enable cash on delivery (COD) without the owner explicitly requesting it.

- Always distinguish test payments from real payments and explain whether an action can charge money or place a real printing/shipping order.
- Do not change payment mode to live, revoke existing live credentials, change Shopify payment settings, or alter existing live webhooks without explicit permission.
- Never ask the owner to paste API secrets, webhook secrets, passwords, or other private values into chat. Direct them to the appropriate private dashboard fields.
- Do not repeat secrets in responses or put them in project files. If a secret is shared in chat, recommend replacing it privately, without reproducing it.
- Explain that changing the Razorpay dashboard's displayed mode is different from changing this website's payment mode.
- A Vercel environment labelled **Production** means the main website deployment. It does not by itself mean Razorpay is accepting real payments; this project's payment mode is configured separately.

## Owner-facing setup guide

For the current payment notification setup, use the plain-language instructions in [Razorpay webhook guide](docs/razorpay-webhook-guide.md).

These preferences apply to future work on this project as well as the current request. They do not authorise additional changes or replace higher-priority safety requirements.

## Storefront design decisions

- Homepage is a drop-specific campaign takeover. Current collection: **Bay Breeze**, inspired by the Godavari, available now, airy and sun-washed. Use real product images; supporting generated scenery must not invent or alter garments.
- Other public pages follow `docs/GAMANA-Brand-Spec.md`: Bone/Kalam Ink, Ember for URBAN, Neelam for CORE, and the existing brand typography. Campaign-only colours stay scoped to the homepage.
- Future drops are agent-prepared and scheduled for an owner-confirmed launch time (India time by default). Do not invent dates, countdowns, scarcity, or mailing promises. No future launch is scheduled yet.
- Admin remains product-only; do not restore a website builder or add a Drops screen. See `docs/drop-campaigns.md`.

## Brand-name display rule (owner update)

- Represent the brand as **గMANA** everywhere in website text: Telugu **గ** followed by uppercase Latin **MANA**. The asterisks in the owner's message were formatting, not part of the name.
- The Telugu initial uses primary Kalam Ink (`#0B0B10`). Keep it readable on dark sections using a Bone backing, not a different glyph colour.
- Use the shared `BrandName`/`BrandText` components for visible branding, including small labels, editorial copy, footer, navigation and admin. Use the canonical plain string for metadata, accessibility labels and the Razorpay checkout name. Razorpay does not support per-letter name styling.
- Do not rename URLs, social handles, email addresses, asset paths, environment variables, database identifiers or existing order references. Preserve original garment photography and archival artwork rather than silently editing lettering printed in an image.
