import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { BrandName } from "@/components/brand-name";
import { getBookPages, getCollectionBooks } from "@/lib/lookbook";
import "./lookbook.css";

export const metadata: Metadata = {
  title: "The Lookbook — Collection stories",
  description:
    "Open a collection. Explore the inspiration, the details and the pieces in the world. The గMANA lookbook, one story at a time.",
  alternates: { canonical: "/lookbook" },
};

export default function LookbookPage() {
  const books = getCollectionBooks();
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
            Choose a collection. Open its world.
          </p>
        </div>
        <span className="library-count label">
          The collection library{" "}
          <span>
            {String(books.length).padStart(2, "0")} volume
            {books.length === 1 ? "" : "s"}
          </span>
        </span>
      </header>
      <section
        className="container-gamana library-shelf"
        aria-label="Collection storybooks"
      >
        {books.map((book) => {
          const pages = getBookPages(book);
          const chapters = pages.filter(
            (page, i) => i === 0 || page.chapter !== pages[i - 1].chapter,
          );
          return (
            <article className="library-volume" key={book.slug}>
              <div className="library-book-stage">
                <Link
                  className="library-book-cover"
                  href={`/lookbook/${book.slug}`}
                  aria-label={`Open ${book.title} storybook`}
                >
                  <img
                    src={book.cover.src}
                    alt={book.cover.alt}
                    fetchPriority="high"
                  />
                  <span className="library-book-spine" aria-hidden="true" />
                  <div className="library-cover-heading">
                    <span className="label">
                      Collection {book.number} / {book.line}
                    </span>
                    <h2>
                      {book.coverTitle[0]}
                      <br />
                      <span>{book.coverTitle[1]}</span>
                    </h2>
                    <p>{book.subtitle}</p>
                  </div>
                  <div className="library-cover-bottom">
                    <BrandName />
                    <span>
                      Open the book{" "}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
                <div className="library-book-shadow" aria-hidden="true" />
              </div>
              <div className="library-volume-notes">
                <p className="label library-volume-index">
                  Volume {book.number} / {pages.length} pages
                </p>
                <h2>
                  <Link href={`/lookbook/${book.slug}`}>
                    {book.title} <ArrowUpRight size={27} aria-hidden="true" />
                  </Link>
                </h2>
                <p className="library-volume-description">{book.description}</p>
                <p className="label library-contents-label">
                  Inside this volume
                </p>
                <ol className="library-contents">
                  {chapters.map((page, i) => (
                    <li key={page.id}>
                      <Link href={`/lookbook/${book.slug}#${page.id}`}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {page.chapter}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link
                  href={`/lookbook/${book.slug}`}
                  className="library-open-button"
                >
                  <BookOpen size={16} aria-hidden="true" />
                  Open the storybook
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <p className="library-reading-note">
                  Made to browse slowly. Selected photographs let you shop the
                  pieces in the story.
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
