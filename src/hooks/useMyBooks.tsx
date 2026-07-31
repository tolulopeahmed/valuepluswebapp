"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ShrinkToFitText from "@/components/ShrinkToFitText";

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
  selected_services: {
    id: string;
    label: string;
    type: string;
    amount: string;
    quantity?: number | null;
    unit?: string | null;
  }[];
  services_total: string;
  print_cost: string | null;
  // services_total + any staff-added custom items + print_cost — the
  // real final amount owed, once staff have priced everything (see
  // QuotationRequest.total_cost on the backend). Prefer this over
  // services_total for display once it's known to be final.
  total_cost: string;
  // Whether anything from the "Print Finish" group was requested — if
  // not, services_total is already the final cost, not a partial one.
  has_print_element: boolean;
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
  // Google Drive link to production files — blank until staff set it in
  // Django admin, generally once publishing is complete.
  assets_link: string;
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

interface MyBooksContextValue {
  books: MyBook[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const MyBooksContext = createContext<MyBooksContextValue | null>(null);

// Every tab (Home, Publish, Earn, More) and a couple of modals each used
// to call a self-fetching useMyBooks() independently — fine on its own,
// except React Router... no, Next's app-router layout keeps /app/app's
// layout mounted across sibling tab navigation, so each of THESE hooks
// was unmounting/remounting (and therefore refetching from scratch) every
// single time the user switched tabs, on top of firing more than once
// per page when several consumers rendered at once. One provider, mounted
// once in app/app/layout.tsx alongside AppShellProvider, now owns the
// single fetch — every consumer just reads the shared cache.
export function MyBooksProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<MyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

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
      // The backend already orders by -created_at (see Book.Meta), but
      // sorting again here guarantees newest-first regardless of that —
      // status (pending/draft/published/...) never factors into it, so
      // a brand-new draft always sits above an older published title.
      setBooks(
        [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your books.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only the very first authenticated mount (or a fresh login after a
    // logout) should trigger a fetch here — once loaded, the data lives
    // in this provider for the rest of the session and every tab switch
    // just re-reads it via context instead of hitting the network again.
    // Callers that need a fresh copy after a mutation (e.g. after
    // submitting a quote) already call the returned refetch() explicitly.
    if (!isAuthenticated) {
      hasFetchedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refetch(); // clears books/loading for the logged-out state
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    refetch();
  }, [isAuthenticated, refetch]);

  return (
    <MyBooksContext.Provider value={{ books, loading, error, refetch }}>
      {children}
    </MyBooksContext.Provider>
  );
}

export function useMyBooks() {
  const ctx = useContext(MyBooksContext);
  if (!ctx) {
    throw new Error("useMyBooks must be used within MyBooksProvider (i.e. inside src/app/app)");
  }
  return ctx;
}

// Whoever saves last simply wins — staff can also set/replace a book's
// cover directly in Django admin, and neither side needs to know about
// the other. Callers should follow a successful call with the shared
// MyBooksProvider's refetch() so every consumer (home shelf, Publish
// page, this same modal) picks up the new image at once.
export function uploadBookCover(bookId: string, blob: Blob) {
  const formData = new FormData();
  formData.append("cover", blob, "cover.jpg");
  return apiFetch<MyBook>(`/books/mine/${bookId}/cover/`, {
    method: "PATCH",
    body: formData,
  });
}

// Reverts to the generated placeholder cover (see BookCover below).
export function deleteBookCover(bookId: string) {
  return apiFetch<MyBook>(`/books/mine/${bookId}/cover/`, {
    method: "DELETE",
  });
}

// Whoever saves last wins here too — staff can also set `price` directly
// on the Book change form in Django admin. Follow with the shared
// MyBooksProvider's refetch() so every consumer picks up the new price.
export function updateBookPrice(bookId: string, price: number) {
  return apiFetch<MyBook>(`/books/mine/${bookId}/price/`, {
    method: "PATCH",
    body: JSON.stringify({ price }),
  });
}

// The default sale price a book is offered at until the author sets
// their own: ~2.5x the physical unit print cost (quotation.print_cost —
// staff's own manual entry for "what one copy costs to actually print",
// see QuotationRequest.print_cost's help_text). Null when there's
// nothing to base a suggestion on yet (no print element in the quote,
// e.g. an ebook-only title, or staff haven't entered a print cost yet)
// — the price field falls back to plain manual entry in that case
// rather than suggesting a number pulled out of thin air.
const SUGGESTED_PRICE_MULTIPLIER = 2.5;

export function suggestedPrice(quotation: BookQuotationSummary | null): number | null {
  if (!quotation || quotation.print_cost === null) return null;
  const printCost = Number(quotation.print_cost);
  if (!Number.isFinite(printCost) || printCost <= 0) return null;
  return Math.round(printCost * SUGGESTED_PRICE_MULTIPLIER);
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
        // Faint watermark layered UNDER the gradient (first in the list
        // paints on top of later ones) — background images always paint
        // before any box content, positioned or not, so this can't ever
        // end up covering the title/subtitle/author text above it.
        backgroundImage: `url(/images/logos/valueplus-mark-watermark.png), linear-gradient(150deg, ${from}, ${to})`,
        backgroundSize: "70% auto, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
        containerType: "inline-size",
      }}
    >
      {/* min-w-0 is the fix, not just decoration — items-center (the
          root's cross-axis alignment) doesn't stretch this flex child to
          the root's width by default, so without an explicit width it
          shrink-wraps to its widest *unbroken* line (e.g. one long word
          like "CONVERSION" at a big font-size) and grows past the cover's
          actual edges instead of being constrained by them. */}
      <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-1">
        <ShrinkToFitText
          className="w-full font-black uppercase tracking-[-0.01em] text-white"
          maxRatio={0.2}
          minRatio={0.07}
          maxLines={3}
          lineHeight={0.95}
        >
          {title}
        </ShrinkToFitText>
        {book.subtitle && (
          <ShrinkToFitText
            className="w-full font-medium text-white/55"
            maxRatio={0.045}
            minRatio={0.03}
            maxLines={2}
            lineHeight={1.3}
          >
            {book.subtitle}
          </ShrinkToFitText>
        )}
      </div>

      {authorName && (
        <>
          <span
            className="h-px w-5"
            style={{ background: "rgba(255,255,255,0.3)" }}
          />
          <ShrinkToFitText
            className="w-full min-w-0 pt-1 font-semibold uppercase tracking-[0.1em] text-white/70"
            maxRatio={0.055}
            minRatio={0.042}
            maxLines={2}
          >
            {authorName}
          </ShrinkToFitText>
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
