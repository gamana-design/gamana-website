import React, { type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowUpRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { BrandName, BrandText } from "@/components/brand-name";
import type { CollectionSummary, StorySection } from "@/lib/lookbook";
import { getAvailableHotspots } from "@/lib/lookbook-interactions";
import { SHIPPING_HEADLINE } from "@/lib/shipping";
import { formatINR } from "@/lib/utils";
import { ShoppableImage } from "./shoppable-image";

export function CollectionStory({
  collection,
  sections,
  products,
}: {
  collection: CollectionSummary;
  sections: StorySection[];
  products: Product[];
}) {
  const opening = sections.find((section) => section.kind === "opening");
  const feature =
    sections.find(
      (section) => section.image?.hotspots && section.image.hotspots.length > 0,
    ) ?? sections.find((section) => section.image);
  const narrative = sections.filter(
    (section) =>
      section !== opening &&
      section !== feature &&
      section.kind !== "shop" &&
      section.kind !== "closing" &&
      section.kind !== "bts",
  );
  const behindTheScenes = sections.filter((section) => section.kind === "bts");
  const collectionSection = sections.find((section) => section.kind === "shop");
  const closing = sections.find((section) => section.kind === "closing");
  const rowCount = Math.max(1, Math.ceil(narrative.length / 2));
  const featureHasProducts = Boolean(
    feature?.image && getAvailableHotspots(feature.image, products).length,
  );

  return (
    <main className="collection-story">
      <header className="container-gamana story-masthead" id={opening?.id}>
        <Link href="/lookbook" className="story-back-link">
          <ArrowLeft size={15} aria-hidden="true" /> The lookbook
        </Link>
        <div className="story-masthead-grid">
          <div className="story-masthead-title">
            <p className="label">
              Collection {collection.number} / {collection.line}
            </p>
            <h1>{collection.title}</h1>
            <p className="story-subtitle">{collection.subtitle}</p>
          </div>
          <div className="story-masthead-intro">
            <p>
              <BrandText>
                {opening?.paragraphs?.[0] ?? collection.description}
              </BrandText>
            </p>
            <Link href="#shop-the-look" className="story-shop-anchor">
              <ShoppingBag size={15} aria-hidden="true" />
              Shop the Look
              <ArrowDown size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="story-scroll-note">
          <span className="label">The story, in the world</span>
          <span aria-hidden="true" />
          <span className="label">Scroll to explore</span>
        </div>
      </header>

      <section
        className="container-gamana story-flow"
        aria-label={`${collection.title} story and shoppable look`}
        style={{ "--story-row-count": rowCount } as CSSProperties}
      >
        <aside className="story-feature" id="shop-the-look">
          <div className="story-feature-sticky">
            <p className="label story-feature-label">
              <span>Shop the Look</span>
              <span>Collection {collection.number}</span>
            </p>
            <h2 id={feature?.id ?? undefined}>Shop the Look</h2>
            {feature?.title && (
              <p className="story-feature-title">
                <BrandText>{feature.title.replace(/\n/g, " ")}</BrandText>
              </p>
            )}
            {feature?.image && (
              <ShoppableImage
                image={feature.image}
                products={products}
                eager
                className="story-photo-feature"
              />
            )}
            {featureHasProducts && (
              <>
                <p className="story-feature-help">
                  Tap a marker to see the piece, choose a size and add it to
                  your bag.
                </p>
                <noscript>
                  <p className="story-no-script">
                    Shopping markers need JavaScript. Product links are listed
                    below.
                  </p>
                </noscript>
              </>
            )}
          </div>
        </aside>

        {narrative.map((section, index) => (
          <StoryBeat
            key={section.id}
            section={section}
            products={products}
            side={index % 2 === 0 ? "left" : "right"}
            row={Math.floor(index / 2) + 1}
          />
        ))}
      </section>

      {behindTheScenes.length > 0 && (
        <section
          className="container-gamana story-process"
          aria-label="Behind the scenes"
        >
          <div className="story-process-intro">
            <p className="label">Behind the scenes / original material</p>
            <h2>Before the finished piece.</h2>
          </div>
          <div className="story-process-grid">
            {behindTheScenes.map((section) => (
              <BtsMoment key={section.id} section={section} />
            ))}
          </div>
        </section>
      )}

      {collectionSection && (
        <section
          className="container-gamana story-products"
          id={collectionSection.id}
          aria-labelledby="story-products-title"
        >
          <div className="story-products-heading">
            <div>
              <p className="label">The collection / {collection.line}</p>
              <h2 id="story-products-title">
                <BrandText>
                  {collectionSection.title.replace(/\n/g, " ")}
                </BrandText>
              </h2>
              {collectionSection.paragraphs?.[0] && (
                <p>{collectionSection.paragraphs[0]}</p>
              )}
            </div>
            <p className="story-products-shipping">
              {SHIPPING_HEADLINE}
              <br />
              Already included in the price.
            </p>
          </div>
          {products.length > 0 ? (
            <div className="story-product-grid">
              {products.map((product) => {
                const available = product.variants.some(
                  (variant) => variant.stock !== "out",
                );
                return (
                  <Link
                    href={`/product/${product.slug}`}
                    key={product.id}
                    className="story-product-card"
                  >
                    <div className="story-product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                      <span className="story-product-arrow" aria-hidden="true">
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                    <div className="story-product-meta">
                      <span className="label">{product.line}</span>
                      <h3>
                        <BrandText>{product.name}</BrandText>
                      </h3>
                      <p>{formatINR(product.price)}</p>
                      <span className="story-product-availability">
                        {available ? "Choose your size" : "Sold out"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="story-products-empty">
              These pieces aren’t available in the shop right now. The story is
              still here to enjoy.
            </p>
          )}
        </section>
      )}

      {closing && (
        <section className="container-gamana story-closing" id={closing.id}>
          <div className="story-closing-copy">
            <p className="label">The collection / {collection.title}</p>
            <h2>
              <BrandText>{closing.title.replace(/\n/g, " ")}</BrandText>
            </h2>
            {closing.paragraphs?.map((text) => (
              <p key={text}>
                <BrandText>{text}</BrandText>
              </p>
            ))}
            <Link
              className="story-closing-link"
              href={`/shop?drop=${collection.campaignId}`}
            >
              Explore the collection{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {closing.image && (
            <ShoppableImage
              image={closing.image}
              products={products}
              className="story-photo-closing"
            />
          )}
        </section>
      )}

      <footer className="container-gamana story-footer">
        <Link href="/lookbook">
          <ArrowLeft size={14} aria-hidden="true" /> Back to the lookbook
        </Link>
        <span>
          <BrandName />
        </span>
      </footer>
    </main>
  );
}

function StoryBeat({
  section,
  products,
  side,
  row,
}: {
  section: StorySection;
  products: Product[];
  side: "left" | "right";
  row: number;
}) {
  return (
    <article
      className={`story-beat story-beat-${side}`}
      id={section.id}
      style={{ "--story-row": row } as CSSProperties}
    >
      <p className="label story-beat-theme">{section.theme}</p>
      <h2>
        <BrandText>{section.title}</BrandText>
      </h2>
      {section.paragraphs?.map((text) => (
        <p className="story-beat-copy" key={text}>
          <BrandText>{text}</BrandText>
        </p>
      ))}
      {(section.image || section.secondaryImage) && (
        <div
          className={
            section.secondaryImage
              ? "story-beat-images story-beat-images-pair"
              : "story-beat-images"
          }
        >
          {section.image && (
            <ShoppableImage
              image={section.image}
              products={section.image.hotspots?.length ? products : []}
            />
          )}
          {section.secondaryImage && (
            <ShoppableImage image={section.secondaryImage} products={[]} />
          )}
        </div>
      )}
    </article>
  );
}

function BtsMoment({ section }: { section: StorySection }) {
  if (!section.bts) return null;
  const asset = section.bts;
  if (asset.kind === "image")
    return (
      <ShoppableImage
        image={{ src: asset.src, alt: asset.alt, caption: asset.caption }}
        products={[]}
      />
    );
  return (
    <figure className="story-bts-video">
      <video
        controls
        preload="metadata"
        playsInline
        poster={asset.poster}
        aria-label={asset.alt}
      >
        <source src={asset.src} />
        {asset.captions && (
          <track
            kind="captions"
            src={asset.captions}
            srcLang="en"
            label="English"
            default
          />
        )}
        Your browser does not support video.{" "}
        <a href={asset.src}>Open the film</a>.
      </video>
      <figcaption>{asset.caption}</figcaption>
      {asset.transcript && (
        <details>
          <summary>Read the film transcript</summary>
          <p>{asset.transcript}</p>
        </details>
      )}
    </figure>
  );
}
