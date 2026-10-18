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
    image: "/images/origin.jpg",
  },
  {
    slug: "two-lines-one-mindset",
    title: "Two lines, one mindset",
    excerpt:
      "Why we built URBAN and CORE as one brand instead of two. The answer is simpler than a product line — it is a person.",
    readTime: "4 min",
    date: "2026-08-28",
    category: "Brand",
    image: "/images/core-1.jpg",
  },
  {
    slug: "from-gym-to-street",
    title: "From gym to street, without changing who you are",
    excerpt:
      "The hardest thing to build is a piece that works in both worlds. A look at fabric, fit and the decisions behind the CORE line.",
    readTime: "6 min",
    date: "2026-08-05",
    category: "Product",
    image: "/images/urban-1.jpg",
  },
  {
    slug: "made-of-home",
    title: "Made of home. Made to roam.",
    excerpt:
      "A brand identity built on translation — from the visual language of home into something that travels.",
    readTime: "3 min",
    date: "2026-07-19",
    category: "Brand",
    image: "/images/atelier.jpg",
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
    image: "/images/urban-1.jpg",
    line: "URBAN",
    caption: "Bone heavyweight tee, relaxed trouser",
    place: "Bazaar alley, Hyderabad",
  },
  {
    id: "lb-02",
    image: "/images/urban-2.jpg",
    line: "URBAN",
    caption: "Garment-dyed cotton, raking light",
    place: "Studio, Hyderabad",
  },
  {
    id: "lb-03",
    image: "/images/core-1.jpg",
    line: "CORE",
    caption: "Rhythm tee, high-rise training short",
    place: "Track, golden hour",
  },
  {
    id: "lb-04",
    image: "/images/core-2.jpg",
    line: "CORE",
    caption: "Flatlock seam, matte technical knit",
    place: "Studio, Hyderabad",
  },
  {
    id: "lb-05",
    image: "/images/atelier.jpg",
    line: "URBAN",
    caption: "Folded, checked, folded again",
    place: "The workbench",
  },
  {
    id: "lb-06",
    image: "/images/origin.jpg",
    line: "URBAN",
    caption: "The river at dusk — the first reference",
    place: "Godavari",
  },
];
