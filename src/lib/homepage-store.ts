import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getProducts } from "@/lib/catalog-store";

export type HomepageSettings = {
  heroEyebrow: string;
  heroLineOne: string;
  heroLead: string;
  heroAccent: string;
  heroTail: string;
  heroDescription: string;
  heroImage: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  collectionEyebrow: string;
  collectionTitle: string;
  collectionDescription: string;
  coreComingSoon: boolean;
  coreComingSoonText: string;
  featuredEyebrow: string;
  featuredTitle: string;
  announcementItems: string[];
};

export const defaultHomepageSettings: HomepageSettings = {
  heroEyebrow: "Drop 01 · Est. 2024",
  heroLineOne: "What grounds",
  heroLead: "you.",
  heroAccent: "Moves",
  heroTail: "you.",
  heroDescription: "GAMANA is a clothing brand rooted in where you come from and built for where you are going.",
  heroImage: "/images/brand/street-sunset.jpg",
  primaryCta: "Shop the drop",
  primaryHref: "/shop",
  secondaryCta: "Our story",
  secondaryHref: "/about",
  collectionEyebrow: "The collection",
  collectionTitle: "Two lines. One mindset.",
  collectionDescription: "URBAN is what you wear when the day is yours. CORE is what you wear when you are working at it.",
  coreComingSoon: true,
  coreComingSoonText: "CORE is in development. Performance pieces are coming soon.",
  featuredEyebrow: "The current drop",
  featuredTitle: "The first pieces",
  announcementItems: ["Free shipping across India over ₹1,499", "Two lines. One mindset.", "Printed on demand — dispatched in 3 days", "From gym to street, without changing who you are"],
};

const readCached = unstable_cache(async () => {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("gamana_homepage_settings").select("content").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data?.content as Partial<HomepageSettings> | null;
}, ["gamana-homepage-settings"], { revalidate: 60, tags: ["gamana-homepage"] });

export async function getHomepageSettings(): Promise<HomepageSettings> {
  return { ...defaultHomepageSettings, ...(await readCached() ?? {}) };
}

export async function saveHomepageSettings(settings: Partial<HomepageSettings>) {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase is not configured.");
  const current = await getHomepageSettings();
  const content = { ...current, ...settings };
  const { error } = await db.from("gamana_homepage_settings").upsert({ id: 1, content, updated_at: new Date().toISOString() });
  if (error) throw error;
  revalidateTag("gamana-homepage");
  revalidateTag("gamana-products");
  return content;
}

export async function getStoreProducts() {
  const [products, homepage] = await Promise.all([getProducts(), getHomepageSettings()]);
  return homepage.coreComingSoon ? products.filter((product) => product.line !== "CORE") : products;
}
