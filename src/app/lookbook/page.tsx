import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BrandName } from "@/components/brand-name";
import { getPublishedCollections, getStorySections } from "@/lib/lookbook";
import "./lookbook.css";

export const metadata: Metadata = {
  title: "The Lookbook — Collection stories",
  description:
    "Explore collection stories, inspiration, details and shoppable looks from గMANA.",
  alternates: { canonical: "/lookbook" },
};

export default function LookbookPage() {
  const collections = getPublishedCollections();
  return (
    <div className="lookbook-library">
      <header className="container-gamana library-intro">
        <p className="label">
          <BrandName /> / The lookbook
        </p>
        <div>
          <h1>
            Some stories
            <br />
            are worn.
          </h1>
          <p>
            A place for the feeling behind the pieces.
            <br />
            Explore each collection in its own world.
          </p>
        </div>
        <span className="library-count label">
          Collections
          <span>{String(collections.length).padStart(2, "0")}</span>
        </span>
      </header>

      <section
        className="container-gamana library-shelf"
        aria-label="Lookbook collections"
      >
        {collections.map((collection) => {
          const sections = getStorySections(collection);
          const themes = sections.filter(
            (section, index) =>
              index ===
              sections.findIndex((item) => item.theme === section.theme),
          );
          return (
            <article className="library-collection" key={collection.slug}>
              <figure className="library-collection-visual">
                <Link
                  href={`/lookbook/${collection.slug}`}
                  className="library-collection-image"
                  aria-label={`Explore the ${collection.title} collection story`}
                >
                  <img
                    src={collection.libraryImage.src}
                    alt={collection.libraryImage.alt}
                    fetchPriority="high"
                  />
                  <span className="library-image-index label">
                    Collection {collection.number} / {collection.line}
                  </span>
                  <span className="library-image-title">
                    {collection.title}
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </span>
                </Link>
                <figcaption>{collection.libraryImage.caption}</figcaption>
              </figure>

              <div className="library-collection-copy">
                <p className="label library-collection-index">
                  Collection {collection.number} / {collection.line}
                </p>
                <h2>
                  <Link href={`/lookbook/${collection.slug}`}>
                    {collection.title}{" "}
                    <ArrowUpRight size={26} aria-hidden="true" />
                  </Link>
                </h2>
                <p className="library-collection-description">
                  {collection.description}
                </p>
                <p className="label library-themes-label">Explore the story</p>
                <ol className="library-themes">
                  {themes.map((section, index) => (
                    <li key={section.id}>
                      <Link href={`/lookbook/${collection.slug}#${section.id}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {section.theme}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link
                  href={`/lookbook/${collection.slug}`}
                  className="library-explore-button"
                >
                  Explore the collection
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <p className="library-reading-note">
                  Selected photographs open product details, sizes and quick
                  add.
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="container-gamana library-signoff">
        <span className="label">Culture. Movement. Everyday.</span>
        <p>
          Not just what we make.
          <br />
          <span>What moves us.</span>
        </p>
        <BrandName />
      </div>
    </div>
  );
}
