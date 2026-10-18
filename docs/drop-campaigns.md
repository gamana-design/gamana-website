# GAMANA drop campaigns

## What has changed

The homepage is now a campaign for **Bay Breeze**, the Godavari-inspired
collection. It uses an airy, sun-washed river direction, with the existing real
product images and one new AI-created landscape used only as campaign artwork.
No product design or product photograph has been generated or replaced.

Other pages keep GAMANA's warm Bone, Kalam Ink, URBAN Ember, CORE blue, brand
fonts and recognisable shopping controls. The Bay Breeze colour treatment stays
on its own homepage.

Bay Breeze is shown as available now. There is no countdown or invented launch
date. The current campaign includes the three existing Godavari tees. Prices,
product names, stock, SKUs and payment settings are not renamed or changed by the
campaign. Online-only checkout remains in place.

## For your next drop

Send the agent:

1. The collection name and its story.
2. The exact launch date and time, written in India time unless agreed otherwise.
3. Which products belong to the drop.
4. The actual product photos and any campaign artwork or videos.
5. The feeling you want: references, colours, or a short description are welcome.

The agent prepares the campaign and its schedule, checks it with you, and
publishes it before launch. You do not need to use a website builder or write
code. Your admin stays product-only.

Once the prepared schedule is published, the homepage switches automatically at
the agreed time. Visitors who already have the website open will get the updated
campaign too; returning from a sleeping tab checks the schedule again.

**Important:** this changes the homepage campaign, not product availability,
stock, prices, printing, shipping, or payment mode. New products must be prepared
separately. This does not enable real payments or send launch emails. No future
drop or launch date has been scheduled yet.

## Preview versus the published shop

The development preview can show the existing sample catalogue without connecting
to your private services. It clearly says **Design preview · Sample catalogue ·
Payments unavailable**. It does not save orders or accept payments.

That sample-content setting is blocked in production. The published shop continues
to read the real catalogue and saved content. Do not mistake sample stock in the
preview for the actual availability of your products.

## Implementation notes for future agents

- Campaign registry and date validation: `src/lib/drops.ts`.
- Independent layouts: `src/components/drops/drop-home.tsx` (river editorial) and
  `src/components/drops/poster-drop.tsx` (poster campaign). Future collections can
  add their own layout without changing the stable shop or payment flow.
- Campaign colours are scoped to `.drop-campaign`, not global brand tokens.
- Server-rendered homepage and metadata select the currently active campaign.
  Root layout supplies the current campaign name to navigation.
- `DropClock` refreshes the server-rendered content at the next configured start
  or end time and checks again on focus/visibility changes. It is not a cron job
  or a payment/product-release gate.
- Dates must have an explicit timezone, for example an ISO timestamp with
  `+05:30`. Newer active campaigns win; disabled entries are ignored. An expired
  campaign falls back to the remaining active campaign. With no active campaign,
  the homepage links to the shop without showing a fake drop.
- Campaign product links use explicit real catalogue slugs. Missing products are
  not replaced with unrelated items.
- Local sample content requires `GAMANA_DESIGN_PREVIEW=1`, development mode, and
  no Supabase service-role key. Never add production product fallbacks.
- Automated coverage: `tests/drops.test.ts`, alongside existing checkout tests.
