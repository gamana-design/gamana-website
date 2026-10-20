import type { Product } from "@/data/catalog";
import { dropCampaigns } from "./drops";

export type LookbookHotspot = { productSlug: string; x: number; y: number };
export type StoryImage = {
  src: string;
  alt: string;
  caption: string;
  hotspots?: readonly LookbookHotspot[];
};
export type BtsAsset = {
  kind: "image" | "video";
  src: string;
  alt: string;
  caption: string;
  /** Only owner-confirmed, genuine making-of material may be published. */
  approved: boolean;
  poster?: string;
  /** Required for films with speech or meaningful audio. WebVTT captions. */
  captions?: string;
  transcript?: string;
};
export type StorySection = {
  id: string;
  theme: string;
  kind: "opening" | "note" | "photograph" | "shop" | "closing" | "bts";
  title: string;
  paragraphs?: readonly string[];
  image?: StoryImage;
  secondaryImage?: StoryImage;
  bts?: BtsAsset;
};
export type LookbookCollection = {
  slug: string;
  campaignId: string;
  title: string;
  number: string;
  published: boolean;
  subtitle: string;
  description: string;
  line: "URBAN" | "CORE";
  libraryImage: StoryImage;
  sections: readonly StorySection[];
  bts: readonly BtsAsset[];
};

const campaign = dropCampaigns.find((drop) => drop.id === "bay-breeze")!;
const river: StoryImage = {
  src: campaign.heroImage,
  alt: campaign.heroAlt,
  caption: "An imagined Godavari landscape / collection inspiration",
};

/** Agent-prepared editorial archive. No invented BTS, shoot locations or manufacturing claims. */
export const lookbookCollections: readonly LookbookCollection[] = [
  {
    slug: "bay-breeze",
    campaignId: "bay-breeze",
    title: "Bay Breeze",
    number: "01",
    published: true,
    subtitle: "A Godavari state of mind.",
    description: campaign.description,
    line: "URBAN",
    libraryImage: river,
    // Add the owner's real process photographs / films here after approval. Empty means no public BTS section.
    bts: [],
    sections: [
      {
        id: "the-opening",
        theme: "The feeling",
        kind: "opening",
        title: "Bay Breeze",
        paragraphs: [campaign.description],
        image: river,
      },
      {
        id: "the-river",
        theme: "The feeling",
        kind: "note",
        title: "Some places\nstay with you.",
        paragraphs: [
          campaign.story,
          "This is Bay Breeze. A river-side story, carried into the everyday.",
        ],
        image: river,
      },
      {
        id: "in-the-world",
        theme: "In the world",
        kind: "photograph",
        title: "Two colours.\nOne river-side story.",
        image: {
          src: "/images/brand/scene-doorway-duo.jpg",
          alt: "The Sunset Ember and Lavender Dusk Godavari tees styled together",
          caption: "Sunset Ember & Lavender Dusk / the collection, worn",
          hotspots: [
            { productSlug: "godavari-tee-lavender", x: 31, y: 37 },
            { productSlug: "godavari-tee-sunset", x: 66, y: 32 },
          ],
        },
      },
      {
        id: "your-own-pace",
        theme: "In the world",
        kind: "note",
        title: "A change\nof pace.",
        paragraphs: [
          "Sun-washed days. Familiar streets. The kind of afternoon you want to take a little slower.",
          "The Godavari Tee, in Sunset Ember and Lavender Dusk. Different colours, the same collection story.",
        ],
        image: {
          src: "/images/brand/model-sunset-front.jpg",
          alt: "Front of the Sunset Ember Godavari Tee, worn",
          caption: "Sunset Ember / front view",
        },
        secondaryImage: {
          src: "/images/brand/model-lavender-front.jpg",
          alt: "Front of the Lavender Dusk Godavari Tee, worn",
          caption: "Lavender Dusk / front view",
        },
      },
      {
        id: "on-the-back",
        theme: "A closer look",
        kind: "photograph",
        title: "A little piece\nof home.",
        image: {
          src: "/images/brand/godavari-lavender-back.jpg",
          alt: "The Godavari-inspired print on the back of the Lavender Dusk tee",
          caption: "Lavender Dusk / a closer look at the back print",
          hotspots: [{ productSlug: "godavari-tee-lavender", x: 50, y: 46 }],
        },
      },
      {
        id: "the-details",
        theme: "A closer look",
        kind: "note",
        title: "Home is\nin the details.",
        paragraphs: [
          "Colours borrowed from the river. A story carried in the print.",
          "Look closer: the colour, the linework, the scene across the back. Familiar details, carried somewhere new.",
        ],
        image: {
          src: "/images/brand/detail-violet-fabric.jpg",
          alt: "Close-up of the Violet Hour printed fabric",
          caption: "Violet Hour / print detail",
        },
        secondaryImage: {
          src: "/images/brand/detail-violet-collar.jpg",
          alt: "Close-up of the Violet Hour tee collar",
          caption: "Violet Hour / collar detail",
        },
      },
      {
        id: "the-pieces",
        theme: "The collection",
        kind: "shop",
        title: "Find your\nriver-side story.",
        paragraphs: [
          "The pieces from this story. Choose a colour and take a closer look.",
        ],
      },
      {
        id: "from-the-river",
        theme: "The collection",
        kind: "closing",
        title: "From the river,\nwith feeling.",
        paragraphs: [campaign.closingLine],
        image: {
          src: "/images/brand/scene-lake.jpg",
          alt: campaign.editorialAlt,
          caption: "The Godavari Tee / by the water",
          hotspots: [{ productSlug: "godavari-tee-sunset", x: 50, y: 48 }],
        },
      },
    ],
  },
];

export function getPublishedCollections() {
  return lookbookCollections.filter((collection) => collection.published);
}
export function getPublishedCollection(slug: string) {
  return getPublishedCollections().find(
    (collection) => collection.slug === slug,
  );
}

export function getStorySections(
  collection: LookbookCollection,
): StorySection[] {
  const approved = collection.bts.filter(
    (asset) =>
      asset.approved &&
      asset.src.trim() &&
      asset.alt.trim() &&
      asset.caption.trim(),
  );
  if (!approved.length) return [...collection.sections];
  const btsSections: StorySection[] = [
    {
      id: "behind-the-scenes",
      theme: "Behind the scenes",
      kind: "note",
      title: "Before the\nfinished piece.",
      paragraphs: [
        "A look at the making of this collection, through original process photographs and films.",
      ],
    },
    ...approved.map(
      (asset, i): StorySection => ({
        id: `making-${i + 1}`,
        theme: "Behind the scenes",
        kind: "bts",
        title: asset.caption,
        bts: asset,
      }),
    ),
  ];
  const insertAt = collection.sections.findIndex(
    (section) => section.kind === "shop",
  );
  return [
    ...collection.sections.slice(
      0,
      insertAt < 0 ? collection.sections.length : insertAt,
    ),
    ...btsSections,
    ...collection.sections.slice(
      insertAt < 0 ? collection.sections.length : insertAt,
    ),
  ];
}

export function getCollectionProducts(
  collection: LookbookCollection,
  catalogue: Product[],
) {
  const selected =
    dropCampaigns.find((drop) => drop.id === collection.campaignId)
      ?.productSlugs ?? [];
  return selected.flatMap((slug) => {
    const product = catalogue.find((item) => item.slug === slug);
    return product ? [product] : [];
  });
}

/** Explicit public metadata: never send unpublished BTS material or drafts to the browser. */
export type CollectionSummary = Pick<
  LookbookCollection,
  | "slug"
  | "campaignId"
  | "title"
  | "number"
  | "subtitle"
  | "description"
  | "line"
>;
export function getCollectionSummary(
  collection: LookbookCollection,
): CollectionSummary {
  return {
    slug: collection.slug,
    campaignId: collection.campaignId,
    title: collection.title,
    number: collection.number,
    subtitle: collection.subtitle,
    description: collection.description,
    line: collection.line,
  };
}
