import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

export type SiteSection = {
  id: string;
  type: "hero" | "text" | "split" | "gallery" | "products" | "journal" | "newsletter" | "cta";
  visible: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  buttonLabel?: string;
  buttonHref?: string;
  items?: { image?: string; title?: string; body?: string; href?: string; label?: string }[];
  tone?: "bone" | "dark" | "ember";
  dataSource?: "featured" | "urban" | "all" | "latest";
};
export type SitePage = { slug: string; title: string; description: string; sections: SiteSection[]; active: boolean };
export type JournalPost = { slug: string; title: string; excerpt: string; category: string; read_time: string; published_at: string; image: string; body: { type: "p" | "h" | "quote"; text: string }[]; active: boolean; position: number };

const cachedPages = unstable_cache(async () => {
  const db = getSupabaseAdmin();
  if (!db) return [] as SitePage[];
  const { data, error } = await db.from("gamana_site_pages").select("*").eq("active", true);
  if (error) throw error;
  return (data ?? []) as SitePage[];
}, ["gamana-site-pages"], { revalidate: 60, tags: ["gamana-site-pages"] });
export async function getSitePages() { return cachedPages(); }
export async function getSitePage(slug: string) { return (await getSitePages()).find(page => page.slug === slug); }
export async function saveSitePage(page: SitePage) {
  const db = getSupabaseAdmin(); if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.from("gamana_site_pages").upsert({ ...page, updated_at: new Date().toISOString() });
  if (error) throw error; revalidateTag("gamana-site-pages"); return page;
}
export async function getJournalPosts() {
  const db = getSupabaseAdmin(); if (!db) return [] as JournalPost[];
  const { data, error } = await db.from("gamana_journal_posts").select("*").eq("active", true).order("position").order("published_at", { ascending: false });
  if (error) throw error; return (data ?? []) as JournalPost[];
}
export async function getJournalPost(slug: string) { return (await getJournalPosts()).find(post => post.slug === slug); }
export async function saveJournalPost(post: JournalPost) {
  const db = getSupabaseAdmin(); if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.from("gamana_journal_posts").upsert({ ...post, updated_at: new Date().toISOString() });
  if (error) throw error; revalidateTag("gamana-journal"); return post;
}
export async function deleteJournalPost(slug: string) {
  const db = getSupabaseAdmin(); if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.from("gamana_journal_posts").delete().eq("slug", slug);
  if (error) throw error; revalidateTag("gamana-journal");
}
const readSiteSettings = unstable_cache(async () => {
  const db = getSupabaseAdmin(); if (!db) return {};
  const { data, error } = await db.from("gamana_site_settings").select("content").eq("id", 1).maybeSingle();
  if (error) throw error; return data?.content ?? {};
}, ["gamana-site-settings"], { revalidate: 60, tags: ["gamana-site-settings"] });
export async function getSiteSettings() { return readSiteSettings(); }
export async function saveSiteSettings(content: Record<string, unknown>) {
  const db = getSupabaseAdmin(); if (!db) throw new Error("Supabase is not configured.");
  const { error } = await db.from("gamana_site_settings").upsert({ id: 1, content, updated_at: new Date().toISOString() });
  if (error) throw error; revalidateTag("gamana-site-settings"); return content;
}
