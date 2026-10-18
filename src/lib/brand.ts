/**
 * GAMANA — brand system.
 *
 * Single source of truth for colour, type and voice.
 *
 * The identity document left the visual-identity section unsigned, so the
 * values below are the shipped decisions — and they are now read directly off
 * the brand's own artwork in Drive: the Godavari tees (sunset ember, lavender
 * dusk, violet hour), the gradient wordmark (magenta, teal, violet, gold) and
 * the paper cream the posters are printed on. Swap them here and the whole
 * site follows.
 */

export const brand = {
  name: "GAMANA",
  nameTelugu: "గమన",
  owner: "Sri Sai Shivani Kaligotla",
  tagline: "What Grounds You. Moves You.",
  campaign: "Rooted in origin, made to move.",
  oneLiner:
    "GAMANA creates casual and performance apparel for movement, style, and everyday life.",
  description:
    "GAMANA creates culture-inspired streetwear and performance apparel rooted in identity, designed for everyday movement.",
  category: "Casual & Performance Apparel",
  founded: "2026",
  base: "Hyderabad, India",
  markets: ["India", "USA"],
  instagram: "https://www.instagram.com/gamana.wear?xtok=cGJuejlrM3drd212&utm_source=qr",
  instagramHandle: "@gamana.wear",
  lines: ["URBAN", "CORE"],
  drop: "Drop 01 — The Godavari Tee",
} as const;

/**
 * Colour — every value below was sampled from the live brand artwork.
 * `ember`, `sunset` and `lavender` come off the Godavari tees; `violet`,
 * `magenta` and `teal` come off the gradient wordmark; `bone` is the paper
 * the posters are printed on.
 */
export const colors = {
  /** Kalam Ink — the everyday of the street. Primary brand colour. */
  kalam: "#0B0B10",
  /** Godavari Ember — the river at dusk. The single loud note. */
  ember: "#F2691E",
  /** Sunset Gold — the hour the graphic was drawn in. */
  sunset: "#FDAD42",
  /** Neelam — sapphire. Reserved for the CORE line. */
  neelam: "#2F3AE0",
  /** Lavender Dusk — the second Godavari colourway. */
  lavender: "#D0A3C1",
  /** Violet Hour — the third Godavari colourway, and the wordmark's deep tone. */
  violet: "#541097",
  /** Magenta — the wordmark's loud stroke. */
  magenta: "#F6026A",
  /** Teal — the wordmark's cool stroke. */
  teal: "#02B3B3",
  /** Bone — paper, and the base of the page. */
  bone: "#F5EDDA",
  /** Graphite — body copy. */
  graphite: "#16161C",
  /** Muted — secondary copy, rules, meta. */
  muted: "#6A6A76",
  /** Line — hairline borders on light ground. */
  line: "#E0D5BB",
  /** Line (dark) — hairline borders on ink ground. */
  lineDark: "#26262F",
  success: "#1F8A5B",
  warning: "#C98A16",
  error: "#D93A2B",
} as const;

/** Type scale + faces. */
export const type = {
  display: { family: "Space Grotesk Variable", weight: "600–700", tracking: "-0.035em" },
  body: { family: "Inter Variable", weight: "400–500", size: "16–18px" },
  label: { family: "Inter Variable", weight: "500", size: "11–12px", tracking: "0.18em" },
  fallback: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
} as const;

/** Voice. Lines lifted verbatim from the identity document. */
export const voice = {
  toneWords: ["Confident", "Minimal", "Refined", "Expressive"],
  lines: [
    "Made of home. Made to roam.",
    "Your roots. Your route. Your rules.",
    "Built for movement. Styled for every day.",
    "Your pace. Your style. Your journey.",
    "Two lines. One mindset.",
    "Everyday essentials, designed to move with you.",
    "From gym to street, without changing who you are.",
    "Rooted in origin, made to move.",
  ],
  /** Words the brand owns — used by the marquee and SEO copy. */
  ownWords: [
    "Movement",
    "Discipline",
    "Everyday",
    "Effortless",
    "Elevated",
    "Versatile",
    "Expression",
    "Essential",
  ],
} as const;

export const boilerplate =
  "GAMANA is a contemporary apparel brand built around movement, discipline, and personal style. Bringing together URBAN and CORE, the brand blends everyday fashion with performance-inspired design. From relaxed daily wear to active essentials, GAMANA creates versatile pieces that move effortlessly across different parts of life. Two lines. One mindset. From gym to street.";

export const nav = [
  { label: "Shop", href: "/shop" },
  { label: "URBAN", href: "/shop?line=URBAN" },
  { label: "CORE", href: "/shop?line=CORE" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const socials = [
  { label: "Instagram", href: brand.instagram },
  { label: "Journal", href: "/journal" },
  { label: "Track order", href: "/track" },
] as const;

/** The three values, straight from the identity document. */
export const values = [
  {
    index: "01",
    title: "Cultural authenticity",
    meaning:
      "Our culture is part of our identity, not just a design trend.",
    behaviour:
      "Research and represent cultural inspirations thoughtfully, with a genuine connection to their meaning.",
    decision:
      "Creating a Godavari-inspired design that connects to your own roots rather than using generic cultural imagery.",
  },
  {
    index: "02",
    title: "Movement with purpose",
    meaning: "Everything we create should have a reason to exist.",
    behaviour:
      "Design apparel around how people live, move, train, and express themselves.",
    decision:
      "Building two distinct lines — URBAN for everyday streetwear and CORE for active performance.",
  },
  {
    index: "03",
    title: "Quality over shortcuts",
    meaning: "The product should live up to the story we tell about it.",
    behaviour:
      "Pay attention to fabric, fit, print quality, comfort, and finishing.",
    decision:
      "Prioritizing product quality and testing before making claims about durability or performance.",
  },
] as const;

export const lines = [
  {
    key: "URBAN" as const,
    name: "URBAN",
    kicker: "Everyday streetwear",
    blurb:
      "Relaxed silhouettes, culture-led graphics and heavyweight cotton for the everyday — the walk, the market, the long evening home.",
    accent: "ember" as const,
    href: "/shop?line=URBAN",
  },
  {
    key: "CORE" as const,
    name: "CORE",
    kicker: "Active performance",
    blurb:
      "Breathable, quick-dry, movement-first pieces built for the session — and styled well enough to keep on after.",
    accent: "neelam" as const,
    href: "/shop?line=CORE",
  },
] as const;
