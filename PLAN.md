# GAMANA — Brand Site Plan

Derived from `Brand-Document v1.0` (Owner: Sri Sai Shivani Kaligotla).

## 1. Brand truth (from the document)

| Item | Value |
| --- | --- |
| Name | GAMANA · గమన (Telugu: *movement / journey*) |
| Category | Casual Streetwear & Performance Apparel |
| Tagline | **What Grounds You. Moves You.** |
| Founded / Base | 2026 · Hyderabad, India |
| Markets | India, USA |
| Instagram | [@gamana.wear](https://instagram.com/gamana.wear) |
| Lines | **URBAN** (everyday streetwear) × **CORE** (active performance) |
| Tone | Confident · Minimal · Refined · Expressive |
| Voice | "We are rooted, but never stuck in the past." / "We are confident, but never try too hard." |
| Never | Loud, salesy, technical-sounding, generic, aggressively motivational, discount-driven |
| Words we own | movement, discipline, everyday, effortless, elevated, versatile, expression, essential |

### Copy source-of-truth (kept verbatim from the document)
- One-liner: "GAMANA creates casual and performance apparel for movement, style, and everyday life."
- Boilerplate: "GAMANA is a contemporary apparel brand built around movement, discipline, and personal style… Two lines. One mindset. From gym to street."
- Positioning: "GAMANA is where culture meets everyday style and performance."
- Voice lines: "Made of home. Made to roam." · "Your roots. Your route. Your rules." · "Built for movement. Styled for every day." · "From gym to street, without changing who you are."

### Sections deliberately left blank in the document → decisions made here
The document's *Visual Identity* (colour / type / logo) was unsigned, so this build defines and **ships** it as `src/lib/brand.ts` (single source of truth, easy to re-swap).

**The palette was then read back off the brand's own artwork** — the Godavari tees, the gradient wordmark, the printed posters in Drive — and the tokens below are the *sampled* values, not invented ones.

- **Primary — Kalam Ink** `#0B0B10` (kalam = charcoal paper, the everyday of the street; the wordmark's black)
- **Accent — Godavari Ember** `#F2691E` (the river at dusk; sampled off the Sunset Ember tee)
- **Accent — Sunset Gold** `#FDAD42` (the hour the graphic was drawn in)
- **Accent 2 — Neelam** `#2F3AE0` (sapphire; the CORE line)
- **Palette — Lavender Dusk** `#D0A3C1` · **Violet** `#541097` · **Magenta** `#F6026A` · **Teal** `#02B3B3` (sampled off the lavender colourway and the gradient wordmark)
- **Neutral — Bone** `#F5EDDA` (the paper the posters are printed on)
- **Neutral / text — Graphite** `#16161C`, muted `#6A6A76`
- **State** — success `#1F8A5B`, warning `#C98A16`, error `#D93A2B`
- **Type** — Display: `Space Grotesk` (600/700, tight tracking) · Body: `Inter` · Labels/UI: `Inter` 500 uppercase, `0.18em` tracking · Telugu wordmark: `Noto Sans Telugu`
- **Wordmark** — the real mark is **brush-lettered**, not typeset: a Didone skeleton filled with magenta, teal, violet, orange and gold brush strokes over warm paper cream, with a running figure above it. It ships as a transparent PNG (`public/images/brand/logo-wordmark.png`) and is never re-drawn in UI. The live header/footer wordmark is Space Grotesk 700 at `-0.055em` with `గమన` as a Telugu sub-line — a typatic stand-in, not a replacement.

## 2. Information architecture

```
/            Hero · Two Lines · Featured drop · Brand art · Manifesto · Values · Origin · Lookbook · Journal · Newsletter
/shop        Catalogue (URBAN | CORE filters, category, sort) — sourced from Qikink
/product/[slug]  Product detail, gallery, size/colour, add to bag, Qikink SKU + fulfilment note
/lookbook    Editorial lookbook (URBAN / CORE chapters) + the printed identity
/about       Story, mission, vision, brand identity, values, founder, roadmap
/track       Order tracking via Qikink order-list API
/contact     Contact form → Supabase
/bag         Cart
/checkout    Shipping + payment preference → creates order in Supabase + Qikink
```

### Drop 01 — The Godavari Tee
One graphic, three colourways. Front carries the river at dusk; back carries the ghat
silhouette. The catalogue (`src/data/catalog.ts`) is the real collection — every URBAN
product is shot on the actual garment, every CORE product on the track.

| Product | Line | SKU | Print | Price |
| --- | --- | --- | --- | --- |
| Godavari Tee — Sunset Ember | URBAN | `GDTee-Or-*` | DTG (1) | ₹1,499 |
| Godavari Tee — Lavender Dusk | URBAN | `GDTee-Lv-*` | DTG (1) | ₹1,499 |
| Godavari Tee — Violet Hour | URBAN | `GDTee-Vi-*` | DTG (1) | ₹1,499 |
| Everyday Oversized Tee — Bone | URBAN | `UETee-Bn-*` | DTG (1) | ₹1,199 |
| Rhythm Performance Tee | CORE | `CPTee-On-*` | Performance (23) | ₹1,399 |
| Move Training Short | CORE | `CPSht-Gr-*` | Performance (23) | ₹1,199 |
| Everyday Performance Hoodie | CORE | `CPHd-On-*` | Performance (23) | ₹2,399 |

For live orders, use the Store SKU saved on each size-and-colour variation. Qikink confirmed that `search_from_my_products=1` uses Store SKU and `=0` uses Product SKU. Never use a product-level map or copy between fields.

## 3. Integrations

### Qikink (Live) — print-on-demand fulfilment
Base `https://api.qikink.com`, credentials from env (`QIKINK_CLIENT_ID`, `QIKINK_CLIENT_SECRET`).
| Endpoint | Use |
| --- | --- |
| `POST /api/token` | form-urlencoded → `Accesstoken` (1 h) |
| `POST /api/order/create` | push the paid order for printing & shipping |
| `GET /api/order/list?order_reference_no=` | order tracking for `/track` |

Rules honoured from the 08-25 reference: `order_number` ≤ 15 chars `[a-z0-9_]`, `quantity`/`price`/`total_order_value` as strings, `search_from_my_products: 1` for dashboard products, `print_type_id` only when `search_from_my_products: 0`, `design_link`/`mockup_link` (not `design_url`/`mockup_url`), `address1` ≤ 90 chars, `gateway` exactly `COD`|`Prepaid`, rate limit 60 req/min.

Catalogue: the published Qikink API is order-scoped, so the storefront reads a **curated catalogue** (`src/data/catalog.ts`) that maps every product to its real Qikink SKU + print type. `GET /api/products` attempts a live Qikink catalogue pull and transparently falls back to the curated set, so the shop never renders empty.

### Supabase (`davgdipioxtgaasoehpb`)
Tables: `newsletter_subscribers`, `contact_messages`, `orders`, `order_items`, `product_feedback`. RLS enabled, service-role writes only from the server.

### Vercel
Project `gamana` linked to `gamana-design/gamana-website` (repoId `1424037015`), env vars injected, production deploy.
**Live at `https://gamana-wear.vercel.app`.** The project is renamed to `gamana` and the production domain is
`gamana-wear.vercel.app` — a project domain, which is what sits outside Vercel Authentication's protection
scope. The team-scoped `*-gamana1.vercel.app` aliases are gated behind a Vercel login, so they are not the
public URL. `GET /api/status` reports whether Qikink and Supabase are answering from the server runtime.

### Google Drive
`GAMANA / Brand` is the master location for the brand team:

| File | Note |
| --- | --- |
| `GAMANA Brand Identity Document v1.0.pdf` | the source document |
| `GAMANA Brand & Design System Spec v1.0.md` | the shipped spec (`docs/GAMANA-Brand-Spec.md` in the repo) |
| `GAMANA Wordmark (transparent PNG).png` | extracted from the master art, for print and web |
| `GAMANA Runner Glyph (transparent PNG).png` | the reduced mark |

The live artwork itself stays in its original folders — `Gamana urban` (product mockups and
colourways), `Brand posters and videos` (posters, campaign frames, brand photos) and
`T shirt files / Godavari` (the `.psd` source artwork). The site ships a web-optimised copy
of every image it uses under `public/images/brand/`.

## 4. Build system
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase JS · lucide-react. Strict TypeScript, ESLint, production build verified before deploy. Fonts are self-hosted via `@fontsource` so the build never depends on a font CDN.
