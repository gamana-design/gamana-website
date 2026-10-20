"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Product } from "@/data/catalog";
import { BrandName, BrandText } from "@/components/brand-name";
import type { BookSummary, StoryPage } from "@/lib/lookbook";
import { getSpreadStart } from "@/lib/lookbook-interactions";
import { formatINR } from "@/lib/utils";
import { SHIPPING_HEADLINE } from "@/lib/shipping";
import { ShoppableImage } from "./shoppable-image";

export function CollectionReader({
  book,
  pages,
  products,
}: {
  book: BookSummary;
  pages: StoryPage[];
  products: Product[];
}) {
  const [index, setIndex] = useState(0);
  const [wide, setWide] = useState(false);
  const [direction, setDirection] = useState("forward");
  const title = useRef<HTMLHeadingElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const start = getSpreadStart(index, wide, pages.length);
  const step = wide ? 2 : 1;
  const end = Math.min(start + step, pages.length);
  const chapters = pages.filter(
    (page, i) => i === 0 || page.chapter !== pages[i - 1].chapter,
  );

  useEffect(() => {
    const media = matchMedia("(min-width: 1024px)");
    const resize = () => setWide(media.matches);
    resize();
    media.addEventListener("change", resize);
    const fromUrl = () => {
      const match = pages.findIndex(
        (page) => `#${page.id}` === window.location.hash,
      );
      setIndex(match < 0 ? 0 : match);
    };
    fromUrl();
    window.addEventListener("popstate", fromUrl);
    window.addEventListener("hashchange", fromUrl);
    return () => {
      media.removeEventListener("change", resize);
      window.removeEventListener("popstate", fromUrl);
      window.removeEventListener("hashchange", fromUrl);
    };
  }, [pages]);

  function go(next: number) {
    const bounded = Math.max(0, Math.min(pages.length - 1, next));
    setDirection(bounded >= start ? "forward" : "backward");
    setIndex(bounded);
    history.pushState(null, "", `#${pages[bounded].id}`);
    title.current?.focus({ preventScroll: true });
    requestAnimationFrame(() =>
      stageRef.current?.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      }),
    );
  }
  function interactive(target: EventTarget | null) {
    return (
      target instanceof Element &&
      Boolean(
        target.closest("button,a,select,input,video,summary,[role='dialog']"),
      )
    );
  }
  function swipeStart(event: PointerEvent<HTMLElement>) {
    if (!interactive(event.target) && event.isPrimary)
      gesture.current = { x: event.clientX, y: event.clientY };
  }
  function swipeEnd(event: PointerEvent<HTMLElement>) {
    const origin = gesture.current;
    gesture.current = null;
    if (!origin || interactive(event.target)) return;
    const dx = event.clientX - origin.x,
      dy = event.clientY - origin.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && end < pages.length) go(start + step);
      if (dx > 0 && start > 0) go(start - step);
    }
  }

  return (
    <div className="collection-reader">
      <div className="container-gamana">
        <header className="reader-heading">
          <Link href="/lookbook" className="reader-back">
            <ArrowLeft size={15} aria-hidden="true" /> The collection library
          </Link>
          <div>
            <p className="label">
              Volume {book.number} / {book.subtitle}
            </p>
            <h1>{book.title}</h1>
          </div>
          <span className="reader-edition label">
            <BrandName /> / {book.line}
          </span>
        </header>
        <nav className="reader-chapters" aria-label="Book chapters">
          {chapters.map((page, i) => (
            <button
              key={page.id}
              type="button"
              onClick={() => go(pages.indexOf(page))}
              aria-current={
                pages[index].chapter === page.chapter ? "step" : undefined
              }
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {page.chapter}
            </button>
          ))}
        </nav>
        <section
          ref={stageRef}
          tabIndex={0}
          aria-describedby="book-reading-help"
          className="reader-stage"
          aria-label={`${book.title} storybook`}
          onPointerDown={swipeStart}
          onPointerUp={swipeEnd}
          onPointerCancel={() => {
            gesture.current = null;
          }}
          onKeyDown={(event) => {
            if (interactive(event.target)) return;
            if (event.key === "ArrowRight" && end < pages.length) {
              event.preventDefault();
              go(start + step);
            }
            if (event.key === "ArrowLeft" && start > 0) {
              event.preventDefault();
              go(start - step);
            }
          }}
        >
          <h2 className="sr-only" ref={title} tabIndex={-1}>
            Reading {book.title}: {pages[start].chapter}
          </h2>
          <div
            className={`book-spread book-turn-${direction}`}
            key={`${start}-${step}`}
          >
            {pages.slice(start, end).map((page, i) => (
              <article
                className={`book-sheet book-sheet-${page.kind}`}
                key={page.id}
                aria-label={`Page ${start + i + 1}: ${page.title.replace(/\n/g, " ")}`}
              >
                <div className="book-running-head">
                  <span>
                    Volume {book.number} / {book.title}
                  </span>
                  <span>{page.chapter}</span>
                </div>
                <PageContent page={page} book={book} products={products} />
                <div className="book-folio">
                  <span>
                    <BrandName />
                  </span>
                  <span>{String(start + i + 1).padStart(2, "0")}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <footer className="reader-controls">
          <button
            type="button"
            onClick={() => go(start - step)}
            disabled={start === 0}
            aria-label="Previous pages"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            <span>Previous</span>
          </button>
          <div className="reader-position">
            <p aria-live="polite" aria-atomic="true">
              {pages[start].chapter}{" "}
              <span>
                {" "}
                / {String(start + 1).padStart(2, "0")}
                {end > start + 1
                  ? `–${String(end).padStart(2, "0")}`
                  : ""} of {pages.length}
              </span>
            </p>
            <div
              className="reader-progress"
              role="progressbar"
              aria-label="Book progress"
              aria-valuemin={0}
              aria-valuemax={pages.length}
              aria-valuenow={end}
            >
              <span style={{ width: `${(end / pages.length) * 100}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => go(start + step)}
            disabled={end === pages.length}
            aria-label="Next pages"
          >
            <span>Next</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </footer>
        <p id="book-reading-help" className="reader-instructions">
          <BookOpen size={13} aria-hidden="true" />
          <span>
            Take your time. Turn with the arrows, your keyboard, or a swipe.
          </span>
        </p>
        <div className="reader-endlinks">
          <Link href="/lookbook">
            <ArrowLeft size={14} aria-hidden="true" /> Back to the library
          </Link>
          <Link href={`/shop?drop=${book.campaignId}`}>
            Explore the collection <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PageContent({
  page,
  book,
  products,
}: {
  page: StoryPage;
  book: BookSummary;
  products: Product[];
}) {
  if (page.kind === "cover")
    return (
      <div className="book-cover-page">
        <img src={page.image!.src} alt={page.image!.alt} fetchPriority="high" />
        <div className="book-cover-type">
          <p className="label">
            A collection by <BrandName />
          </p>
          <h2>
            {book.coverTitle[0]}
            <br />
            <span>{book.coverTitle[1]}</span>
          </h2>
          <p>{book.subtitle}</p>
        </div>
        <div className="book-cover-bottom">
          <p>{page.paragraphs?.[0]}</p>
          <span className="label">
            The story begins <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    );
  if (page.kind === "photograph" || page.kind === "closing")
    return (
      <div className="book-photo-page">
        <div className="book-page-kicker label">
          {page.kind === "closing" ? "Until next time" : "The collection, worn"}
        </div>
        <h2>
          <BrandText>{page.title}</BrandText>
        </h2>
        {page.image && (
          <ShoppableImage image={page.image} products={products} eager />
        )}
        {page.paragraphs?.map((text) => (
          <p className="book-page-copy" key={text}>
            {text}
          </p>
        ))}
        {page.kind === "closing" && (
          <Link href="/lookbook" className="book-text-link">
            Close the book <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    );
  if (page.kind === "shop")
    return (
      <div className="book-shop-page">
        <p className="label book-page-kicker">The collection / {book.line}</p>
        <h2>{page.title}</h2>
        <p className="book-page-copy">{page.paragraphs?.[0]}</p>
        {products.length ? (
          <div className="book-pieces">
            {products.map((product) => (
              <Link
                href={`/product/${product.slug}`}
                key={product.id}
                className="book-piece"
              >
                <img src={product.image} alt={product.name} loading="lazy" />
                <div>
                  <h3>
                    <BrandText>{product.name}</BrandText>
                  </h3>
                  <p>{formatINR(product.price)}</p>
                  <span>
                    {product.variants.some((v) => v.stock !== "out")
                      ? "Choose your size"
                      : "Sold out"}{" "}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="book-unavailable">
            These pieces aren’t available in the shop right now. The story is
            still here to enjoy.
          </p>
        )}
        <p className="book-shipping">
          {SHIPPING_HEADLINE}
          <br />
          <span>Already included in the price.</span>
        </p>
      </div>
    );
  if (page.kind === "bts" && page.bts)
    return (
      <div className="book-bts-page">
        <p className="label book-page-kicker">
          Behind the scenes / original material
        </p>
        <h2>{page.title}</h2>
        {page.bts.kind === "video" ? (
          <figure>
            <video
              controls
              preload="metadata"
              playsInline
              poster={page.bts.poster}
              aria-label={page.bts.alt}
            >
              <source src={page.bts.src} />
              {page.bts.captions && (
                <track
                  kind="captions"
                  src={page.bts.captions}
                  srcLang="en"
                  label="English"
                  default
                />
              )}
              Your browser does not support video.{" "}
              <a href={page.bts.src}>Open the film</a>.
            </video>
            <figcaption>{page.bts.caption}</figcaption>
          </figure>
        ) : (
          <ShoppableImage
            image={{
              src: page.bts.src,
              alt: page.bts.alt,
              caption: page.bts.caption,
            }}
            products={[]}
          />
        )}
        {page.bts.transcript && (
          <details>
            <summary>Read the film transcript</summary>
            <p>{page.bts.transcript}</p>
          </details>
        )}
      </div>
    );
  return (
    <div className="book-note-page">
      <p className="label book-page-kicker">
        Collection notes / {page.chapter}
      </p>
      <h2>{page.title}</h2>
      <div className="book-note-copy">
        {page.paragraphs?.map((text) => (
          <p key={text}>
            <BrandText>{text}</BrandText>
          </p>
        ))}
      </div>
      {page.image && (
        <div
          className={
            page.secondaryImage
              ? "book-note-images book-note-images-pair"
              : "book-note-images"
          }
        >
          <ShoppableImage image={page.image} products={[]} />
          {page.secondaryImage && (
            <ShoppableImage image={page.secondaryImage} products={[]} />
          )}
        </div>
      )}
    </div>
  );
}
