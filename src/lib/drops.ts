import type { Product } from "@/data/catalog";

/** Campaigns are editorial, not payment or inventory controls. Dates require a timezone. */
export type DropCampaign = {
  id: string;
  name: string;
  number: string;
  enabled: boolean;
  startsAt: string | null;
  endsAt?: string;
  layout: "river-editorial" | "poster";
  palette: { paper: string; ink: string; accent: string; mist: string };
  eyebrow: string;
  headline: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  editorialImage: string;
  editorialAlt: string;
  storyTitle: string;
  story: string;
  closingLine: string;
  productSlugs: readonly string[];
};

export const dropCampaigns: readonly DropCampaign[] = [
  {
    id: "bay-breeze",
    name: "Bay Breeze",
    number: "01",
    enabled: true,
    // Baseline campaign: available now, without inventing a historical launch date.
    startsAt: null,
    layout: "river-editorial",
    palette: { paper: "#F4F1E7", ink: "#183D40", accent: "#183D40", mist: "#DCE9E5" },
    eyebrow: "A Godavari state of mind",
    headline: "Take the slow way.",
    description: "Sun-washed days. River-side stories. A little piece of home, wherever you go.",
    heroImage: "/images/drops/bay-breeze-river.jpg",
    heroAlt: "An imagined sun-washed river landscape inspired by the Godavari",
    editorialImage: "/images/brand/scene-lake.jpg",
    editorialAlt: "Godavari-inspired Sunset Ember tee worn beside the river",
    storyTitle: "Some places stay with you.",
    story: "The warmth on the water. The quiet between the banks. The feeling of a day with nowhere else to be. Bay Breeze carries the spirit of the Godavari into the everyday — familiar at heart, made to go wherever you do.",
    closingLine: "A little closer to home.",
    productSlugs: ["godavari-tee-sunset", "godavari-tee-lavender", "godavari-tee-violet"],
  },
];

function timestamp(value: string): number {
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) throw new Error("Drop dates must include a timezone.");
  const result = Date.parse(value);
  if (!Number.isFinite(result)) throw new Error("Invalid drop date.");
  return result;
}

export function validateCampaigns(campaigns: readonly DropCampaign[]) {
  const ids = new Set<string>();
  const starts = new Set<number>();
  for (const campaign of campaigns) {
    if (ids.has(campaign.id)) throw new Error("Duplicate drop id.");
    ids.add(campaign.id);
    const start = campaign.startsAt === null ? -Infinity : timestamp(campaign.startsAt);
    const end = campaign.endsAt ? timestamp(campaign.endsAt) : Infinity;
    if (end <= start) throw new Error("Drop must end after it starts.");
    if (campaign.enabled && starts.has(start)) throw new Error("Enabled drops must have distinct launch times.");
    if (campaign.enabled) starts.add(start);
    if (!campaign.productSlugs.length) throw new Error("A drop needs explicitly selected products.");
    for (const color of Object.values(campaign.palette)) {
      if (!/^#[\da-f]{6}$/i.test(color)) throw new Error("Drop colours must be six-digit hex values.");
    }
  }
}

export function getDropSchedule(campaigns: readonly DropCampaign[] = dropCampaigns, now = Date.now()) {
  validateCampaigns(campaigns);
  const enabled = campaigns.filter((c) => c.enabled);
  const active = enabled
    .filter((c) => (c.startsAt === null || timestamp(c.startsAt) <= now) && (!c.endsAt || timestamp(c.endsAt) > now))
    .sort((a, b) => (b.startsAt === null ? -Infinity : timestamp(b.startsAt)) - (a.startsAt === null ? -Infinity : timestamp(a.startsAt)))[0] ?? null;
  const nextChange = enabled.flatMap((c) => [c.startsAt, c.endsAt].filter((d): d is string => Boolean(d)).map(timestamp))
    .filter((time) => time > now).sort((a, b) => a - b)[0] ?? null;
  return { active, nextChange };
}

export function getDropProducts(campaign: DropCampaign, products: Product[]) {
  // Use the real catalogue only. Never substitute unrelated or inactive products.
  return campaign.productSlugs.flatMap((slug) => {
    const product = products.find((p) => p.slug === slug);
    return product ? [product] : [];
  });
}
