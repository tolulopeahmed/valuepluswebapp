"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Search, Star, X } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { apiFetch } from "@/lib/api";
import styles from "./shelf.module.css";
import p from "./paperback.module.css";
import ShelfFeatured from "./ShelfFeatured";
import { Stars, bookYear, displayPrice, firstParagraph, isNewRelease, naira } from "./shelfUtils";

export interface PublicBookSummary {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  slug: string;
  cover: string | null;
  // "A5", "A4", "6 x 9 in" ... from the ebook PDF; "" if unknown.
  trim_size?: string;
  paperback_price: string | null;
  hardback_price: string | null;
  ebook_price: string | null;
  paperback_old_price?: string | null;
  hardback_old_price?: string | null;
  ebook_old_price?: string | null;
  has_paperback: boolean;
  has_hardback: boolean;
  has_ebook: boolean;
  author_name: string;
  pages?: number | null;
  description?: string;
  date_published?: string | null;
  average_rating?: number | null;
  review_count?: number;
}

export interface PaginatedBooks {
  count: number;
  next: string | null;
  results: PublicBookSummary[];
}

// One paperback on the shelf, with movie-poster badges and a details
// panel that slides up on hover.
function BookCard({ book, index }: { book: PublicBookSummary; index: number }) {
  const shown = displayPrice(book);
  const year = bookYear(book);
  const rated = (book.review_count ?? 0) > 0;
  const format = book.has_ebook ? "EBOOK" : book.has_paperback ? "PAPERBACK" : book.has_hardback ? "HARDBACK" : "";
  const meta = [year, book.pages ? `${book.pages} pages` : "", book.trim_size].filter(Boolean).join(" · ");
  return <Link href={`/book/${book.slug}`} className={p.card} style={{ "--delay": `${Math.min(index, 9) * 40}ms` } as CSSProperties}>
    <div className={p.slot}>
      <div className={p.book}>
        {book.cover
          ? <Image src={book.cover} alt={book.title} fill sizes="(max-width: 520px) 46vw, (max-width: 820px) 31vw, (max-width: 1100px) 23vw, 230px" className={p.cover} priority={index < 5} />
          : <div className={p.fallback}><BookOpen size={24} /><span>{book.title}</span><small>{book.author_name}</small></div>}
        <span className={p.crease} aria-hidden="true" />
        {rated
          ? <span className={`${p.badge} ${p.ratingBadge}`}><Star size={10} fill="#f2c94c" strokeWidth={0} aria-hidden="true" />{Number(book.average_rating ?? 0).toFixed(1)}</span>
          : isNewRelease(book) && <span className={`${p.badge} ${p.newBadge}`}>NEW</span>}
        {format && <span className={`${p.badge} ${p.formatBadge}`}>{format}</span>}
        {year && <span className={`${p.badge} ${p.yearBadge}`}>{year}</span>}
        <div className={p.peek} aria-hidden="true">
          <h4>{book.title}</h4>
          {rated && <div className={p.peekRating}><Stars value={Number(book.average_rating ?? 0)} size={11} />{Number(book.average_rating ?? 0).toFixed(1)}</div>}
          {meta && <p className={p.peekMeta}>{meta}</p>}
          {book.description && <p className={p.peekText}>{firstParagraph(book.description)}</p>}
          <span className={p.peekCta}>View book <ArrowRight size={12} /></span>
        </div>
      </div>
    </div>
    <div className={p.info}>
      <p className={p.category}>{[book.category || "ValuePlus edition", book.trim_size].filter(Boolean).join(" · ")}</p>
      <h3>{book.title}</h3>
      <p className={p.author}>{book.author_name}</p>
      <div className={p.price}>{shown ? <><span>{naira(shown.price)}</span>{shown.oldPrice !== null && <del>{naira(shown.oldPrice)}</del>}</> : <span className={p.author}>View editions</span>}</div>
    </div>
  </Link>;
}

export default function ShelfCatalog({ initial }: { initial: PaginatedBooks | null }) {
  const [books, setBooks] = useState(initial?.results ?? []);
  const [loading, setLoading] = useState(!initial || !!initial.next);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("latest");

  // Load remaining catalogue pages before applying local filters, so a
  // category/search never silently omits titles on a later API page.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    (async () => {
      setError(false); setLoading(true);
      try {
        let page = initial ?? await apiFetch<PaginatedBooks>("/books/public/", { skipAuth: true, signal: controller.signal });
        let collected = page.results;
        if (active) setBooks(collected);
        const visited = new Set<string>();
        while (page.next) {
          if (visited.has(page.next)) throw new Error("Repeated catalogue page");
          visited.add(page.next);
          const response = await fetch(page.next, { signal: controller.signal });
          if (!response.ok) throw new Error("Could not load catalogue");
          page = await response.json();
          collected = [...new Map([...collected, ...page.results].map(book => [book.id, book])).values()];
          if (active) setBooks(collected);
        }
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); };
  }, [initial, retry]);

  const categories = useMemo(() => Array.from(new Set(books.map(book => book.category.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [books]);
  const visible = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const matches = books.filter(book => (!category || book.category.trim() === category) && (!search || `${book.title} ${book.subtitle} ${book.author_name} ${book.category}`.toLocaleLowerCase().includes(search)));
    if (sort === "title") matches.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "price") matches.sort((a, b) => (displayPrice(a)?.price ?? Infinity) - (displayPrice(b)?.price ?? Infinity));
    return matches;
  }, [books, category, query, sort]);
  const reset = () => { setCategory(null); setQuery(""); };
  // Newest releases with a cover lead the featured slider (the API returns
  // books newest first).
  const featured = useMemo(() => books.filter(book => book.cover).slice(0, 5), [books]);

  return <main className={styles.page}>
    <Navbar />
    <ShelfFeatured books={featured} />
    <div className={styles.ambient} aria-hidden="true" />
    <div className={`${styles.content} ${featured.length ? p.afterHero : ""}`}>
      <header className={p.pageHeading}>
        <div><p className={styles.eyebrow}><span />THE VALUEPLUS COLLECTION</p><h1>ValuePlus <span>Shelf</span><i>.</i></h1><p>Find your next great read. Keep a little of it with you.</p></div>
        <div className={styles.heroNote}><BookOpen size={23} strokeWidth={1.3} /><span>Original voices.<br /><strong>Extraordinary perspectives.</strong></span></div>
      </header>

      <section className={styles.controls} aria-label="Browse the collection">
        <div className={styles.toolbar}>
          <label className={styles.search}><Search size={18} strokeWidth={1.7} /><span className={styles.srOnly}>Search by title, author or category</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a book, author or idea…" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}</label>
          <div className={styles.sort}><label htmlFor="shelf-sort">Sort by</label><select id="shelf-sort" value={sort} onChange={e => setSort(e.target.value)}><option value="latest">Latest releases</option><option value="title">Title, A–Z</option><option value="price">Price, low to high</option></select></div>
        </div>
        <div className={styles.categoryBar} role="group" aria-label="Filter by category">
          <button type="button" aria-pressed={category === null} className={category === null ? styles.activeCategory : ""} onClick={() => setCategory(null)}>All books <span>{books.length}</span></button>
          {categories.map(item => <button type="button" key={item} aria-pressed={category === item} className={category === item ? styles.activeCategory : ""} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </section>

      <section className={styles.collection} aria-label="Books" aria-busy={loading}>
        <div className={styles.collectionHeading}><h2>{category || "The complete collection"}</h2><p role="status" aria-live="polite">{loading ? "Curating your shelf…" : `${visible.length} ${visible.length === 1 ? "title" : "titles"}${query ? " found" : " to discover"}`}</p></div>
        {error && <div className={styles.notice} role="alert">We couldn’t load {books.length ? "the rest of " : ""}the collection. <button type="button" onClick={() => setRetry(n => n + 1)}>Try again</button></div>}
        {loading && !books.length ? <div className={p.grid}>{Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeleton}><div /><span /><span /></div>)}</div> : visible.length ? <div className={p.grid} key={`${category}-${query}-${sort}`}>{visible.map((book, index) => <BookCard key={book.id} book={book} index={index} />)}</div> : !loading && !error ? <div className={styles.empty}><BookOpen size={34} strokeWidth={1} /><h3>{books.length ? "A different search. A new discovery." : "Good reads are on their way."}</h3><p>{books.length ? "Try another title or author, or explore the full collection." : "Check back soon for our first titles."}</p>{books.length > 0 && <button type="button" onClick={reset}>Explore all books <ArrowUpRight size={15} /></button>}</div> : null}
        {visible.length > 0 && <div className={styles.endnote}><span />Made to be read. Made to stay with you.<span /></div>}
      </section>
    </div>
    <Footer />
  </main>;
}
