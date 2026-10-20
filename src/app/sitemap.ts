import { getCollectionBooks } from "@/lib/lookbook";
import type { MetadataRoute } from "next";

import { getStoreProducts } from "@/lib/homepage-store";
import { getJournalPosts } from "@/lib/site-content";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, journal] = await Promise.all([getStoreProducts(), getJournalPosts()]);
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/lookbook", priority: 0.6 },
    { path: "/journal", priority: 0.6 },
    { path: "/contact", priority: 0.5 },
    { path: "/track", priority: 0.4 },
  ].map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));

  const productRoutes = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const journalRoutes = journal.map((post) => ({
    url: absoluteUrl(`/journal/${post.slug}`),
    lastModified: new Date(post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const collectionRoutes = getCollectionBooks().map(book => ({ url: absoluteUrl(`/lookbook/${book.slug}`), changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...staticRoutes, ...collectionRoutes, ...productRoutes, ...journalRoutes];
}
