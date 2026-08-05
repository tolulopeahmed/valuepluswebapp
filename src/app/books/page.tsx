"use client";

// Public catalog — every published title, browsable/searchable by
// anyone (see GET /books/public/ — apps.books.views.PublicBookListView).
// A client component (not a Server Component like book/[slug]/page.tsx)
// since search needs live interactivity; the tradeoff is fine here, this
// isn't a single-title SEO landing page.

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import { apiFetch } from "@/lib/api";

interface PublicBookSummary {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  slug: string;
  cover: string | null;
  paperback_price: string | null;
  hardback_price: string | null;
  ebook_price: string | null;
  has_paperback: boolean;
  has_hardback: boolean;
  has_ebook: boolean;
  author_name: string;
}

// The catalog card only has room for one headline price — Paperback
// wins as the most common edition, falling back to Hardback then
// Ebook for a title that skips straight to one of those.
function displayPrice(book: PublicBookSummary): string | null {
  return book.paperback_price ?? book.hardback_price ?? book.ebook_price;
}

interface PaginatedBooks {
  count: number;
  next: string | null;
  results: PublicBookSummary[];
}

function naira(value: number) {
  return `₦${value.toLocaleString()}`;
}

function BookCard({ book }: { book: PublicBookSummary }) {
  return (
    <Link href={`/book/${book.slug}`} className="group flex min-w-0 flex-col gap-2">
      <div className="relative aspect-[3/4.4] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {book.cover ? (
          <Image
            src={book.cover}
            alt={book.title}
            fill
            sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-[0.68rem] text-white/25">
            No cover yet
          </div>
        )}
        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
          {book.has_paperback && (
            <FormatBadge format="Paperback" className="!px-2 !py-0.5 !text-[0.48rem]" />
          )}
          {book.has_hardback && (
            <FormatBadge format="Hardback" className="!px-2 !py-0.5 !text-[0.48rem]" />
          )}
          {book.has_ebook && (
            <FormatBadge format="Ebook" className="!px-2 !py-0.5 !text-[0.48rem]" />
          )}
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[0.82rem] font-bold text-white">{book.title}</p>
        <p className="truncate text-[0.66rem] text-white/40">By {book.author_name}</p>
        {displayPrice(book) !== null && (
          <p
            className="mt-0.5 text-[0.8rem] font-black"
            style={{ color: "rgb(var(--vp-accent-rgb))" }}
          >
            {naira(Number(displayPrice(book)))}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<PublicBookSummary[]>([]);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = q.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
      const data = await apiFetch<PaginatedBooks>(`/books/public/${params}`, {
        skipAuth: true,
      });
      setBooks(data.results);
      setCount(data.count);
      setNextUrl(data.next);
    } catch {
      setBooks([]);
      setCount(0);
      setNextUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search-as-you-type — 350ms is short enough to feel live,
  // long enough that a fast typist doesn't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => search(query), 350);
    return () => clearTimeout(timeout);
  }, [query, search]);

  // DRF's own next-page URL, already absolute (Book base + query string)
  // — fetched directly rather than through apiFetch, which would prefix
  // API_BASE_URL onto an already-full URL.
  const loadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const res = await fetch(nextUrl);
      const data: PaginatedBooks = await res.json();
      setBooks((prev) => [...prev, ...data.results]);
      setNextUrl(data.next);
    } catch {
      // Leave nextUrl as-is — the button just stays there to retry.
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="vp-product-page-bg min-h-screen overflow-x-hidden text-white">
      <div className="noise-layer" />
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:pt-32">
        <h1 className="text-3xl font-black text-white md:text-4xl">Books</h1>
        <p className="mt-1.5 text-sm text-white/50">
          {count > 0 ? `${count} title${count === 1 ? "" : "s"} ` : ""}published on ValuePlus —
          Ebook or physical, straight from the author.
        </p>

        <div
          className="mt-6 flex max-w-md items-center gap-2 rounded-xl border px-3.5 py-2.5"
          style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)" }}
        >
          <Search size={16} className="shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, or author"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-white/40">Loading books…</p>
          ) : books.length === 0 ? (
            <p className="text-sm text-white/40">
              {query.trim() ? `No books found for "${query.trim()}".` : "No books published yet."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {nextUrl && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mx-auto mt-8 block rounded-xl border px-6 py-3 text-sm font-bold text-white/70 transition-colors hover:text-white disabled:opacity-50"
                  style={{ borderColor: "rgba(255,255,255,0.15)" }}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
