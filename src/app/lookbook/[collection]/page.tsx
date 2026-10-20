import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionStory } from "@/components/lookbook/collection-story";
import {
  getCollectionProducts,
  getCollectionSummary,
  getPublishedCollection,
  getStorySections,
} from "@/lib/lookbook";
import { getStoreProducts } from "@/lib/homepage-store";
import "../lookbook.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ collection: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = getPublishedCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: `${collection.title} — Shop the Look`,
    description: `${collection.subtitle} ${collection.description} Explore the collection story and shoppable photographs.`,
    alternates: { canonical: `/lookbook/${collection.slug}` },
  };
}

export default async function CollectionStoryPage({ params }: Props) {
  const { collection: slug } = await params;
  const entry = getPublishedCollection(slug);
  if (!entry) notFound();
  const sections = getStorySections(entry);
  const products = getCollectionProducts(entry, await getStoreProducts());
  return (
    <CollectionStory
      collection={getCollectionSummary(entry)}
      sections={sections}
      products={products}
    />
  );
}
