"use client";

// Movie-site style "featured" slider for the shelf (think Apple TV+ /
// Netflix heroes): each new release fills the top of the page with a
// blurred-cover backdrop, its paperback cover, rating and a short pitch.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicBookSummary } from "./ShelfCatalog";
import { Stars, bookYear, displayPrice, firstParagraph, naira } from "./shelfUtils";
import styles from "./featured.module.css";

const SLIDE_MS = 7000;
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export default function ShelfFeatured({ books }: { books: PublicBookSummary[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // No auto-advance for people who've asked their device to reduce motion.
  const reduceMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(MOTION_QUERY).matches, () => false);
  const region = useRef<HTMLElement>(null);
  const count = books.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || reduceMotion || count < 2) return;
    const timer = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, paused, reduceMotion, count, go]);

  if (!count) return null;

  return (
    <section
      ref={region}
      className={styles.featured}
      aria-roledescription="carousel"
      aria-label="Featured new releases"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!region.current?.contains(e.relatedTarget as Node)) setPaused(false); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      {books.map((book, i) => {
        const active = i === index;
        // Only the current slide and its neighbours load images, so the page
        // doesn't download every featured cover up front.
        const near = active || i === (index + 1) % count || i === (index - 1 + count) % count;
        const shown = displayPrice(book);
        const year = bookYear(book);
        const meta = [year, book.pages ? `${book.pages} pages` : "", book.trim_size].filter(Boolean);
        return (
          <article
            key={book.id}
            className={`${styles.slide} ${active ? styles.active : ""}`}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${book.title}`}
            aria-hidden={!active}
            inert={!active}
          >
            <div className={styles.backdrop} aria-hidden="true">
              {/* Heavily blurred, so a small, low-quality image is plenty. */}
              {book.cover && near && <Image src={book.cover} alt="" fill sizes="25vw" className={styles.backdropImage} priority={i === 0} />}
            </div>
            <div className={styles.inner}>
              <div className={styles.copy}>
                <p className={styles.eyebrow}><span />{i === 0 ? "NEW RELEASE" : "FEATURED"}{book.category ? ` · ${book.category}` : ""}</p>
                <h2 className={styles.title}>{book.title}</h2>
                {book.subtitle && <p className={styles.subtitle}>{book.subtitle}</p>}
                <p className={styles.author}>by {book.author_name}</p>
                <div className={styles.meta}>
                  {book.review_count ? (
                    <span className={styles.rating}>
                      <Stars value={book.average_rating ?? 0} size={15} />
                      <strong>{Number(book.average_rating ?? 0).toFixed(1)}</strong>
                      <span>({book.review_count} {book.review_count === 1 ? "review" : "reviews"})</span>
                    </span>
                  ) : <span className={styles.newTag}>NEW</span>}
                  {meta.map((item) => <span key={item} className={styles.metaItem}>{item}</span>)}
                  {book.has_ebook && <span className={styles.formatTag}>EBOOK</span>}
                  {book.has_paperback && <span className={styles.formatTag}>PAPERBACK</span>}
                </div>
                {book.description && <p className={styles.description}>{firstParagraph(book.description)}</p>}
                <div className={styles.actions}>
                  <Link href={`/book/${book.slug}`} className={styles.primary}>
                    Get this book <ArrowRight size={17} />
                  </Link>
                  {shown && (
                    <span className={styles.price}>
                      {naira(shown.price)}
                      {shown.oldPrice !== null && <del>{naira(shown.oldPrice)}</del>}
                    </span>
                  )}
                </div>
              </div>
              <Link href={`/book/${book.slug}`} className={styles.coverWrap} aria-label={`View ${book.title}`} tabIndex={-1}>
                <div className={styles.cover}>
                  {book.cover && near && <Image src={book.cover} alt={book.title} fill sizes="(max-width: 900px) 60vw, 330px" className={styles.coverImage} priority={i === 0} />}
                  <span className={styles.crease} aria-hidden="true" />
                </div>
                <span className={styles.ledge} aria-hidden="true" />
              </Link>
            </div>
          </article>
        );
      })}

      {count > 1 && (
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={() => go(index - 1)} aria-label="Previous featured book"><ChevronLeft size={20} /></button>
          <div className={styles.dots} role="tablist" aria-label="Choose a featured book">
            {books.map((book, i) => (
              <button
                key={book.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={book.title}
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                onClick={() => go(i)}
              >
                {i === index && !paused && !reduceMotion && <span key={index} className={styles.dotProgress} style={{ animationDuration: `${SLIDE_MS}ms` }} />}
              </button>
            ))}
          </div>
          <button type="button" className={styles.arrow} onClick={() => go(index + 1)} aria-label="Next featured book"><ChevronRight size={20} /></button>
        </div>
      )}
    </section>
  );
}
