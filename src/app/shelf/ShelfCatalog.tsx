"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Search, X } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import { apiFetch } from "@/lib/api";
import styles from "./shelf.module.css";

export interface PublicBookSummary {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  slug: string;
  cover: string | null;
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
}

function displayPrice(book: PublicBookSummary): { price: number; oldPrice: number | null } | null {
  const pick =
    book.ebook_price !== null ? [book.ebook_price, book.ebook_old_price]
    : book.paperback_price !== null ? [book.paperback_price, book.paperback_old_price]
    : book.hardback_price !== null ? [book.hardback_price, book.hardback_old_price]
    : null;
  if (!pick) return null;
  const price = Number(pick[0]);
  const old = pick[1] != null ? Number(pick[1]) : null;
  return { price, oldPrice: old !== null && old > price ? old : null };
}

export interface PaginatedBooks {
  count: number;
  next: string | null;
  results: PublicBookSummary[];
}

function naira(value: number) {
  return `₦${value.toLocaleString()}`;
}


function BookCard({ book, index }: { book: PublicBookSummary; index: number }) {
  const shown = displayPrice(book);
  return <Link href={`/book/${book.slug}`} className={styles.bookCard} style={{ "--delay": `${Math.min(index, 7) * 45}ms` } as CSSProperties}>
    <div className={styles.stage}>
      <div className={styles.book}>
        {book.cover ? <Image src={book.cover} alt={book.title} fill sizes="(max-width: 600px) 38vw, (max-width: 1000px) 24vw, 220px" className={styles.cover} priority={index < 4} /> : <div className={styles.fallback}><BookOpen size={26} /><span>{book.title}</span><small>{book.author_name}</small></div>}
        <span className={styles.binding} aria-hidden="true" />
        <span className={styles.sheen} aria-hidden="true" />
      </div>
      <span className={styles.openBook} aria-hidden="true"><ArrowUpRight size={16} /></span>
    </div>
    <div className={styles.bookInfo}>
      <p className={styles.category}>{book.category || "ValuePlus edition"}</p>
      <h3>{book.title}</h3>
      <p className={styles.author}>{book.author_name}</p>
      <div className={styles.price}>{shown ? <><span>{naira(shown.price)}</span>{shown.oldPrice !== null && <del>{naira(shown.oldPrice)}</del>}</> : <span className={styles.author}>View editions</span>}</div>
      {(book.has_ebook || book.has_paperback || book.has_hardback) && (
        <div className={styles.formats}>
          {book.has_ebook && <FormatBadge format="Ebook" className="!px-2 !py-0.5 !text-[0.48rem]" />}
          {book.has_paperback && <FormatBadge format="Paperback" className="!px-2 !py-0.5 !text-[0.48rem]" />}
          {book.has_hardback && <FormatBadge format="Hardback" className="!px-2 !py-0.5 !text-[0.48rem]" />}
        </div>
      )}
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

  return <main className={styles.page}>
    <Navbar />
    <div className={styles.ambient} aria-hidden="true" />
    <div className={styles.content}>
      <header className={styles.hero}>
        <div><p className={styles.eyebrow}><span />THE VALUEPLUS COLLECTION</p><h1>ValuePlus <span>Shelf</span><span className={styles.period}>.</span></h1><p className={styles.intro}>Find your next great read.<br className={styles.mobileBreak} /> Keep a little of it with you.</p></div>
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
        {loading && !books.length ? <div className={styles.grid}>{Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeleton}><div /><span /><span /></div>)}</div> : visible.length ? <div className={styles.grid} key={`${category}-${query}-${sort}`}>{visible.map((book, index) => <BookCard key={book.id} book={book} index={index} />)}</div> : !loading && !error ? <div className={styles.empty}><BookOpen size={34} strokeWidth={1} /><h3>{books.length ? "A different search. A new discovery." : "Good reads are on their way."}</h3><p>{books.length ? "Try another title or author, or explore the full collection." : "Check back soon for our first titles."}</p>{books.length > 0 && <button type="button" onClick={reset}>Explore all books <ArrowUpRight size={15} /></button>}</div> : null}
        {visible.length > 0 && <div className={styles.endnote}><span />Made to be read. Made to stay with you.<span /></div>}
      </section>
    </div>
    <Footer />
  </main>;
}
