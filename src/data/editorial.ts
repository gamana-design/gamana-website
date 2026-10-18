export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  category: string;
  image: string;
}

export const journal: JournalPost[] = [
  {
    slug: "godavari-notes",
    title: "Notes from the Godavari",
    excerpt:
      "We went to the river before we drew a single line. Here is what a stretch of sand at dusk taught us about the first GAMANA graphic.",
    readTime: "5 min",
    date: "2026-09-14",
    category: "Process",
    image: "/images/brand/scene-lake.jpg",
  },
  {
    slug: "two-lines-one-mindset",
    title: "Two lines, one mindset",
    excerpt:
      "Why we built URBAN and CORE as one brand instead of two. The answer is simpler than a product line — it is a person.",
    readTime: "4 min",
    date: "2026-08-28",
    category: "Brand",
    image: "/images/brand/campaign-duo.jpg",
  },
  {
    slug: "from-gym-to-street",
    title: "From gym to street, without changing who you are",
    excerpt:
      "The hardest thing to build is a piece that works in both worlds. A look at fabric, fit and the decisions behind the CORE line.",
    readTime: "6 min",
    date: "2026-08-05",
    category: "Product",
    image: "/images/core-1.jpg",
  },
  {
    slug: "made-of-home",
    title: "Made of home. Made to roam.",
    excerpt:
      "A brand identity built on translation — from the visual language of home into something that travels.",
    readTime: "3 min",
    date: "2026-07-19",
    category: "Brand",
    image: "/images/brand/logo-gradient.jpg",
  },
];

export interface LookbookFrame {
  id: string;
  image: string;
  line: "URBAN" | "CORE";
  caption: string;
  place: string;
}

export const lookbook: LookbookFrame[] = [
  {
    id: "lb-01",
    image: "/images/brand/scene-doorway-duo.jpg",
    line: "URBAN",
    caption: "Godavari Tee, Sunset Ember and Lavender Dusk",
    place: "Old city, Hyderabad",
  },
  {
    id: "lb-02",
    image: "/images/brand/model-sunset-front.jpg",
    line: "URBAN",
    caption: "Godavari Tee, front graphic",
    place: "Studio, Hyderabad",
  },
  {
    id: "lb-03",
    image: "/images/brand/model-sunset-back.jpg",
    line: "URBAN",
    caption: "Godavari Tee, back graphic",
    place: "Studio, Hyderabad",
  },
  {
    id: "lb-04",
    image: "/images/brand/model-lavender-front.jpg",
    line: "URBAN",
    caption: "Godavari Tee, Lavender Dusk",
    place: "Studio, Hyderabad",
  },
  {
    id: "lb-05",
    image: "/images/brand/model-violet.jpg",
    line: "URBAN",
    caption: "Godavari Tee, Violet Hour",
    place: "Studio, Hyderabad",
  },
  {
    id: "lb-06",
    image: "/images/brand/scene-lake.jpg",
    line: "URBAN",
    caption: "The Godavari Tee at the water",
    place: "Godavari",
  },
  {
    id: "lb-07",
    image: "/images/brand/street-sunset.jpg",
    line: "URBAN",
    caption: "Sunset Ember, in motion",
    place: "Hyderabad streets",
  },
  {
    id: "lb-08",
    image: "/images/brand/scene-doorway-lavender.jpg",
    line: "URBAN",
    caption: "Lavender Dusk, doorway",
    place: "Old city, Hyderabad",
  },
  {
    id: "lb-09",
    image: "/images/core-1.jpg",
    line: "CORE",
    caption: "Rhythm Performance Tee, training short",
    place: "Track, golden hour",
  },
  {
    id: "lb-10",
    image: "/images/core-2.jpg",
    line: "CORE",
    caption: "Flatlock seam, matte technical knit",
    place: "Studio, Hyderabad",
  },
];

/**
 * Brand art — the printed pieces, gradient wordmark and campaign frames that
 * carry the identity on the About and Lookbook pages.
 */
export interface BrandArt {
  id: string;
  image: string;
  title: string;
  note: string;
}

export const brandArt: BrandArt[] = [
  {
    id: "art-01",
    image: "/images/brand/art-ga.jpg",
    title: "GAM",
    note: "Brush study in magenta, teal, violet and gold.",
  },
  {
    id: "art-02",
    image: "/images/brand/art-ma.jpg",
    title: "MA",
    note: "The wordmark, drawn one letter at a time.",
  },
  {
    id: "art-03",
    image: "/images/brand/art-na.jpg",
    title: "NA",
    note: "Same hand, same brush, same afternoon.",
  },
  {
    id: "art-04",
    image: "/images/brand/poster-everyday-icon.jpg",
    title: "Your new everyday icon",
    note: "Drop 01 campaign — the Godavari Tee.",
  },
  {
    id: "art-05",
    image: "/images/brand/logo-gradient.jpg",
    title: "GAMANA",
    note: "Casual & performance apparel.",
  },
  {
    id: "art-06",
    image: "/images/brand/poster-wordmark-script.jpg",
    title: "Two lines, one mindset",
    note: "Sunset Ember and Lavender Dusk, side by side.",
  },
];
