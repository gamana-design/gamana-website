import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CollectionReader } from "@/components/lookbook/collection-reader";
import {
  getBookPages,
  getBookProducts,
  getBookSummary,
  getCollectionBook,
} from "@/lib/lookbook";
import { getStoreProducts } from "@/lib/homepage-store";
import "../lookbook.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ collection: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  const book = getCollectionBook(collection);
  if (!book) return { title: "Collection not found" };
  return {
    title: `${book.title} — The storybook`,
    description: `${book.subtitle} Explore the collection story, details and shoppable photographs.`,
    alternates: { canonical: `/lookbook/${book.slug}` },
  };
}

export default async function CollectionBookPage({ params }: Props) {
  const { collection } = await params;
  const book = getCollectionBook(collection);
  if (!book) notFound();
  const pages = getBookPages(book);
  const products = getBookProducts(book, await getStoreProducts());
  return (
    <>
      <CollectionReader
        book={getBookSummary(book)}
        pages={pages}
        products={products}
      />
      <noscript>
        <style>{".collection-reader { display: none; }"}</style>
        <div className="container-gamana story-no-script">
          <p>
            The interactive book needs JavaScript. Here is the story in reading
            order.
          </p>
          {pages.map((page) => (
            <section key={page.id}>
              <h2>{page.title}</h2>
              {page.paragraphs?.map((text) => (
                <p key={text}>{text}</p>
              ))}
              {page.image && (
                <figure>
                  <img
                    src={page.image.src}
                    loading="lazy"
                    alt={page.image.alt}
                  />
                  <figcaption>{page.image.caption}</figcaption>
                </figure>
              )}
              {page.secondaryImage && (
                <figure>
                  <img
                    src={page.secondaryImage.src}
                    loading="lazy"
                    alt={page.secondaryImage.alt}
                  />
                  <figcaption>{page.secondaryImage.caption}</figcaption>
                </figure>
              )}
              {page.bts && (
                <p>
                  <a href={page.bts.src}>{page.bts.caption}</a>
                </p>
              )}
            </section>
          ))}
          <Link href={`/shop?drop=${book.campaignId}`}>
            Shop the collection
          </Link>
        </div>
      </noscript>
    </>
  );
}
