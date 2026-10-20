# గMANA — Brand & Design System Spec v1.3

*Companion to the GAMANA Brand Identity Document v1.0.*
*Site: https://gamana-wear.vercel.app · Repo: github.com/gamana-design/gamana-website*

---

## Owner correction — 20 October 2026

**The Telugu గ is the hero glyph, not an ordinary initial.** Every new brand
lockup must visibly highlight it rather than shrink it to match the Latin text.
The website uses the outlined Telugu master inside a larger Bone badge, with
Kalam Ink glyph/stroke and a small offset shadow. It scales together with MANA
without wrapping; use `BrandName` / `BrandText` throughout storefront and admin.
The glyph is font-independent and accessible under the exact name గMANA.

Reusable outlined masters for future branding material:
- `/images/brand/gamana-lockup.svg` — light surface.
- `/images/brand/gamana-lockup-dark.svg` — dark surface.
- `/images/brand/gamana-social.png` — 1200 × 630 social-sharing card, also used
  by the website's Open Graph and Twitter metadata.
- `/images/brand/ga-glyph.svg` — standalone symbol (existing browser and
  home-screen icons remain glyph-only).

SVGs have outlined letters, no external fonts or images; source letterforms
are self-hosted Space Grotesk and Noto Sans Telugu (SIL Open Font License).
These are new branding masters, not replacements for artwork printed on
products. Existing garment imagery is untouched. The general colour-palette
rethink remains on hold: use existing Kalam Ink `#0B0B10` and Bone `#F5EDDA`.

**Selling point: “Free shipping across India. Always.”** Delivery is already
included in every product price, with no minimum spend or extra shipping
charge. Show this in announcements, campaign copy, product details, the bag,
checkout and footer. Do not raise prices or rewrite historical orders.

## 1. The brand in one line

**గMANA** — *What Grounds You. Moves You.*

Casual streetwear and performance apparel, rooted in culture, made for movement.
Founded 2026 in Hyderabad, India. Markets: India & USA. Lines: **URBAN** × **CORE**.

| | |
|---|---|
| Owner | Sri Sai Shivani Kaligotla |
| Tagline | What Grounds You. Moves You. |
| Campaign line | Rooted in origin, made to move. |
| Descriptor | Casual & Performance Apparel |
| Wordmark | `గMANA` — Telugu `గ` + uppercase Latin `MANA` |
| Instagram | [@gamana.wear](https://www.instagram.com/gamana.wear) |

---

## 2. Colour

**Owner hold:** a general colour rethink is on hold. Keep the current palette
unchanged until the owner resumes it. The new glyph uses existing Kalam Ink
and Bone only; it does not introduce a new colour scheme.

Every value below was **sampled directly from the live brand artwork** in Drive
(the Godavari tees, the gradient wordmark, the printed posters) — not chosen from
a mood board. Hex values are the shipped tokens in `src/lib/brand.ts`.

| Token | Hex | Where it comes from | Use |
|---|---|---|---|
| Kalam Ink | `#0B0B10` | The wordmark, black | Primary ground, body copy |
| Godavari Ember | `#F2691E` | The sunset on the Godavari Tee | The one loud note. URBAN accent |
| Sunset Gold | `#FDAD42` | The hour the graphic was drawn in | Highlights, hover, sale |
| Lavender Dusk | `#D0A3C1` | The lavender colourway | Soft secondary |
| Lavender Deep | `#936486` | Shadow side of the lavender print | Depth |
| Violet | `#541097` | Gradient wordmark, deep tone | Editorial accents |
| Magenta | `#F6026A` | Gradient wordmark, loud stroke | Editorial accents |
| Teal | `#02B3B3` | Gradient wordmark, cool stroke | Editorial accents |
| Neelam | `#2F3AE0` | Core line | CORE accent only |
| Bone | `#F5EDDA` | The paper the posters are printed on | Page background |

**Rules**
- Bone is the page. Kalam Ink is the counterweight. Never more than one loud
  accent per view.
- URBAN = Ember. CORE = Neelam. The line is stated in the colour, not just the label.
- Gradient brush artwork (magenta / teal / violet / gold) is reserved for the
  identity moments — wordmark, posters, brand art. It never becomes UI chrome.

---

## 3. Type

| Role | Face | Spec |
|---|---|---|
| Display | Space Grotesk Variable 600–700 | Tracking `-0.03em` to `-0.055em`, line-height 0.88–0.98 |
| Body | Inter Variable 400–500 | 0.93–1.02rem, leading 1.6–1.7 |
| Label | Inter Variable 500 | 0.69–0.75rem, uppercase, tracking `0.18em` |
| Wordmark | Space Grotesk 700 | Uppercase, tracking `-0.055em` |
| Telugu | Noto Sans Telugu 500 | Tracking `0.35em` |

Fonts are self-hosted via `@fontsource` — no build-time network dependency.

---

## 4. The wordmark — owner-approved update

The primary website wordmark is **గMANA**: the Telugu letter **గ** immediately
followed by uppercase Latin **MANA**. Do not append a second Telugu sub-line or
include literal asterisks.

- The Telugu initial uses **Kalam Ink `#0B0B10`**, the primary brand colour.
- On dark surfaces, a Bone backing preserves the initial's contrast while the
  Latin letters can follow the light text treatment.
- Telugu uses the outlined Noto Sans Telugu 600 glyph master in a larger
  Bone badge with an offset shadow; never shrink it to match Latin cap height.
  The wordmark's Latin letters use Space Grotesk. In prose they can inherit
  the paragraph font. The full name must remain unbroken.
- The shared `BrandName` and `BrandText` components keep spelling and treatment
  consistent across navigation, footers, campaigns, editorial pages and admin.
- Page titles, accessible names, structured data and Razorpay's plain-text
  checkout name use the same spelling. Hosted payment interfaces do not allow
  per-letter styling of that name.
- URLs, email addresses, social handles, filenames, stored references and internal
  identifiers keep their existing spelling.

### Standalone symbol — owner-approved replacement

Use Telugu **గ** as the standalone brand glyph in place of the runner symbol
for website identity, browser tabs and saved home-screen icons. The **గMANA**
wordmark stays unchanged.

- Master: `public/images/brand/ga-glyph.svg`; outlined from self-hosted Noto Sans
  Telugu 600 (SIL Open Font License), so it renders without a font download.
- Shared component: `BrandGlyph` in `src/components/brand-name.tsx`.
- Browser icon: `src/app/icon.png`; home-screen icon: `src/app/apple-icon.png`.
- Use existing Kalam Ink for the glyph, with existing Bone behind it on dark
  surfaces. Keep the shape and proportions intact; do not redraw it as a runner.
- `runner-glyph.png` is retained only as an archival source, not an active logo.

Existing brush artwork, original product photography and the old runner are
archival assets. Do not alter lettering within photographs or invent changed
prints. Replace such artwork only with owner-approved new source assets. This
website naming rule supersedes the older all-Latin text lockup.

---

## 5. Drop 01 — The Godavari Tee

One graphic, three colourways. Front carries the river at dusk (band, horizon,
birds, small runner glyph at the chest); back carries the ghat silhouette.

| Product | Line | SKU (Qikink) | Print | Price |
|---|---|---|---|---|
| Godavari Tee — Sunset Ember | URBAN | `GDTee-Or-*` | DTG (1) | ₹1,499 |
| Godavari Tee — Lavender Dusk | URBAN | `GDTee-Lv-*` | DTG (1) | ₹1,499 |
| Godavari Tee — Violet Hour | URBAN | `GDTee-Vi-*` | DTG (1) | ₹1,499 |
| Everyday Oversized Tee — Bone | URBAN | `UETee-Bn-*` | DTG (1) | ₹1,199 |
| Rhythm Performance Tee | CORE | `CPTee-On-*` | Performance (23) | ₹1,399 |
| Move Training Short | CORE | `CPSht-Gr-*` | Performance (23) | ₹1,199 |
| Everyday Performance Hoodie | CORE | `CPHd-On-*` | Performance (23) | ₹2,399 |

Sizes run S–XXL on URBAN, S–XL on CORE. Live account SKUs override the table
via the `QIKINK_SKU_MAP` environment variable — no code change required.

---

## 6. Voice

**Confident · Minimal · Refined · Expressive**

Sound like:
> What grounds you. Moves you. · Built for movement. Styled for every day. ·
> Your pace. Your style. Your journey. · Two lines. One mindset. ·
> Everyday essentials, designed to move with you. ·
> From gym to street, without changing who you are.

Never: loud, salesy, over-technical, generic, aggressively motivational,
discount-driven, sports-brand-only, exaggerated promises, forced slang, emoji
excess, competitor comparisons.

**Words we own:** Movement, Discipline, Everyday, Effortless, Elevated,
Versatile, Expression, Essential, URBAN, CORE, "From gym to street",
"Two lines. One mindset."

**Retired wording:** gym clothes → everyday performance wear · just activewear →
casual × performance apparel · cheap → accessible · trendy → contemporary ·
maximum performance → designed for movement · crush your goals → move at your
own pace · fashion meets function → style and movement, seamlessly combined.

**Boilerplate (40–60 words)**
> GAMANA is a contemporary apparel brand built around movement, discipline, and
> personal style. Bringing together URBAN and CORE, the brand blends everyday
> fashion with performance-inspired design. From relaxed daily wear to active
> essentials, GAMANA creates versatile pieces that move effortlessly across
> different parts of life. Two lines. One mindset. From gym to street.

---

## 7. Three values

1. **Cultural authenticity** — our culture is part of our identity, not a design
   trend. Research the source; do not borrow from it.
2. **Movement with purpose** — everything we create should have a reason to
   exist. URBAN for the everyday, CORE for the session.
3. **Quality over shortcuts** — fabric, fit, print quality, comfort, finishing.
   Test before claiming durability.

---

## 8. Site system

| | |
|---|---|
| Framework | Next.js 15.5 (App Router), TypeScript, Tailwind v4 |
| Motion | Framer Motion reveals; `prefers-reduced-motion` honoured |
| Cart | `localStorage` key `gamana.bag.v1` |
| Fulfilment | Qikink live API — order create + order list |
| Data | Supabase — orders, order_items, newsletter_subscribers, contact_messages, product_feedback |
| Token source | `src/lib/brand.ts` → `src/app/globals.css` `@theme` |
| Live URL | https://gamana-wear.vercel.app |
| Health check | `GET /api/status` — reports Qikink + Supabase reachability |

**Site routes:** `/` · `/shop` · `/product/[slug]` · `/lookbook` · `/about` ·
`/journal` · `/journal/[slug]` · `/contact` · `/track` · `/checkout`

---

## 9. Asset rules

- Product imagery: the real artwork. Never a mockup of a mockup.
- URBAN pieces are photographed in the street or the studio; CORE pieces on the
  track. Never mixed on one card.
- Backgrounds stay Bone or Kalam Ink. No grey studio sweeps.
- The identity moments (gradient brush) appear on the home page brand-art band,
  the lookbook identity chapter, the About page and the footer. Nowhere else.

---

*Maintained with the GAMANA website codebase. v1.1 — October 2026.*
