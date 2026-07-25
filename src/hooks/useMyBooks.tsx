"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Snapshot of the manuscript details a user submitted on "Get a Quote" —
// present whenever a book originated from that flow (i.e. every `pending`
// book), null for one created any other way.
export interface BookQuotationSummary {
  full_name: string;
  whatsapp_number: string;
  email: string;
  book_size: string;
  pages: number | null;
  words: number | null;
  chapters: number | null;
  copies: number | null;
  selected_services: { id: string; label: string; type: string; amount: string }[];
  services_total: string;
  print_cost: string | null;
  additional_notes: string;
  created_at: string;
}

// Real book shape from the Django backend (GET /books/mine/) — separate
// from the demo `Book` type in src/data/books.ts, which backs the public
// marketing storefront page and stays on static mock content. Several
// fields are nullable here (a `pending` book created straight from a
// quote request has no cover/price/format/pages yet) where the mock
// type's fields are all non-optional.
export interface MyBook {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  slug: string;
  cover: string | null;
  status: "pending" | "draft" | "in_progress" | "published";
  format: "Paperback" | "Ebook" | "Hardback" | "";
  pages: number | null;
  sales: number;
  earned: string;
  date_published: string | null;
  price: string | null;
  description: string;
  created_at: string;
  quotation: BookQuotationSummary | null;
}

export const MY_BOOK_STATUS_LABEL: Record<MyBook["status"], string> = {
  pending: "Pending",
  draft: "Draft",
  in_progress: "In Progress",
  published: "Published",
};

// pending uses the same orange + glow as the home shelf's "not live yet"
// corner badge (ShelfStatusBadge in PublisherBooks.tsx) — one consistent
// "still in progress" signal across both pages, instead of a third color.
export const MY_BOOK_STATUS_BADGE_CLASS: Record<MyBook["status"], string> = {
  pending:
    "bg-[rgba(251,146,60,0.16)] text-[#fb923c] border border-[rgba(251,146,60,0.5)] vp-badge-glow",
  draft: "bg-[#3a3f52] text-white border border-white/25",
  in_progress:
    "bg-[rgb(var(--vp-accent-rgb))] text-[#171100] border border-[rgba(255,255,255,0.35)]",
  published: "bg-[#123524] text-[#4ade80] border border-[rgba(74,222,128,0.6)]",
};

export function useMyBooks() {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<MyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<MyBook[]>("/books/mine/");
      setBooks(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your books.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fetching on mount/auth-change is the "synchronize with an external
    // system" case useEffect exists for. refetch()'s loading/error resets
    // do run synchronously before its first await (that's what this rule
    // flags), which is the standard, safe shape for a fetch-on-mount hook
    // — restructuring it away would only make this harder to follow.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { books, loading, error, refetch };
}

// Backend decimal fields (price/earned) arrive as strings; price is also
// nullable on a fresh `pending` book with no print quote yet. Shared by
// every view that renders a real book — Publish page and the home
// screen's shelf alike.
export function naira(value: string | number | null) {
  if (value === null) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  return `₦${n.toLocaleString()}`;
}

// Gradient pairs a mocked-up cover's background is picked from — deliberately
// varied hues so a shelf of several pending books doesn't read as one
// repeated tile. Picked deterministically per book (see coverPalette below),
// not on every render, so the same book always gets the same color instead
// of flickering between the grid and list views.
const COVER_GRADIENTS: [string, string][] = [
  ["#3a4763", "#1c2436"],
  ["#5b3a63", "#2b1c33"],
  ["#3a6350", "#1a2e22"],
  ["#63503a", "#332216"],
  ["#3a5a63", "#1a2c33"],
  ["#633a4a", "#331b23"],
  ["#4a5a3a", "#242e1a"],
  ["#3a3a63", "#1c1c33"],
];

function coverPalette(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length];
}

// A `pending`/not-yet-covered book has no real cover image, so next/image
// has nothing to render — instead of a bare initial letter, mock up a
// plain working title page: big bold title, small subtitle underneath,
// author's name anchored at the bottom, on a background color unique to
// this book (see coverPalette). Author name comes from the quote's
// full_name when there is one (every `pending` book has one).
export function BookCover({ book, sizes }: { book: MyBook; sizes: string }) {
  if (book.cover) {
    return (
      <Image
        src={book.cover}
        alt={book.title}
        fill
        unoptimized
        sizes={sizes}
        className="object-cover"
      />
    );
  }

  const title = book.title.trim();
  const [from, to] = coverPalette(book.id);

  if (!title) {
    return (
      <div
        className="flex h-full w-full items-center justify-center text-lg font-black text-white/80"
        style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
      >
        V
      </div>
    );
  }

  const authorName = book.quotation?.full_name;

  return (
    // container-type lets the title/subtitle/author text below size
    // itself in cqw — relative to THIS cover's own rendered width, not
    // the viewport — so "big and thick, readable from afar" scales
    // correctly whether this is a 44px list thumbnail or a 160px modal
    // cover, instead of one fixed rem size looking right in only one
    // of those places.
    <div
      className="flex h-full w-full flex-col items-center gap-1 p-2.5 text-center"
      style={{
        background: `linear-gradient(150deg, ${from}, ${to})`,
        containerType: "inline-size",
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <p
          className="line-clamp-3 font-black uppercase text-white"
          style={{ fontSize: "20cqw", lineHeight: 0.95, letterSpacing: "-0.01em" }}
        >
          {title}
        </p>
        {book.subtitle && (
          <p
            className="line-clamp-2 font-medium leading-snug text-white/55"
            style={{ fontSize: "4.5cqw" }}
          >
            {book.subtitle}
          </p>
        )}
      </div>

      {authorName && (
        <>
          <span
            className="h-px w-5"
            style={{ background: "rgba(255,255,255,0.3)" }}
          />
          <p
            className="pt-1 font-semibold uppercase tracking-[0.14em] text-white/60"
            style={{ fontSize: "4cqw" }}
          >
            {authorName}
          </p>
        </>
      )}
    </div>
  );
}

// Shown instead of the grid/list of books (and their trailing "add new
// title" tile) while a shelf has zero real books — that tile only makes
// sense once there's at least one title to sit alongside. Centered and
// roomy so it reads as the page's actual content, not a stray row.
export function EmptyBooksState({
  onAddTitle,
  minHeight = "18rem",
}: {
  onAddTitle: () => void;
  minHeight?: string;
}) {
  return (
    <button
      type="button"
      onClick={onAddTitle}
      className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center transition-transform active:scale-[0.99]"
      style={{
        minHeight,
        borderColor: "rgba(var(--vp-accent-rgb),0.4)",
        background: "rgba(var(--vp-accent-rgb),0.07)",
      }}
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.18)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <Plus size={22} strokeWidth={2.5} />
      </span>
      <span className="max-w-[16rem] text-[0.9rem] font-black leading-snug text-white/70">
        No book yet.{" "}
        <span style={{ color: "rgb(var(--vp-accent-rgb))" }}>
          Click to add new title.
        </span>
      </span>
    </button>
  );
}
