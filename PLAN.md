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

- **Primary — Kalam Ink** `#0B0B10` (kalam = charcoal paper, the everyday of the street)
- **Accent — Godavari Ember** `#FF5A1F` (the river at dusk; the brand's single loud note)
- **Accent 2 — Neelam** `#2F3AE0` (sapphire; the CORE line)
- **Neutral — Bone** `#F4F1E9`
- **Neutral / text — Graphite** `#16161C`, muted `#6A6A76`
- **State** — success `#1F8A5B`, warning `#C98A16`, error `#D93A2B`
- **Type** — Display: `Space Grotesk` (600/700, tight tracking) · Body: `Inter` · Labels/UI: `Inter` 500 uppercase, `0.18em` tracking · Telugu wordmark: `Noto Sans Telugu`
- **Wordmark** — `GAMANA` set in Space Grotesk 700, tracked `-0.04em`, with `గమన` as a Telugu sub-line. Clear space = height of the "A". Never stretched, recoloured beyond mono/ember, or set on a busy image.

## 2. Information architecture

```
/            Hero · Two Lines · Featured drop · Manifesto · Values · Lookbook · Journal · Newsletter
/shop        Catalogue (URBAN | CORE filters, category, sort) — sourced from Qikink
/product/[slug]  Product detail, size/colour, add to bag, Qikink SKU + fulfilment note
/lookbook    Editorial lookbook (URBAN / CORE chapters)
/about       Story, mission, vision, values, founder, roadmap
/track       Order tracking via Qikink order-list API
/contact     Contact form → Supabase
/bag         Cart
/checkout    Shipping + payment preference → creates order in Supabase + Qikink
```

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
Tables: `newsletter_subscribers`, `contact_messages`, `orders`, `order_items`, `products_cache`. RLS enabled, service-role writes only from the server.

### Vercel
New project `gamana-website` linked to `gamana-design/gamana-website`, env vars injected, production deploy.

### Google Drive
Brand document + the shipped design-system spec are filed into a `GAMANA / Brand` folder so the brand team has one master location (rollout item in the document).

## 4. Build system
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase JS · lucide-react. Strict TypeScript, ESLint, production build verified before deploy.
