// components/BookLibrary.tsx
//
// The grid/list book-tile rendering shared by the Publish tab
// (app/app/publish/page.tsx — every title, with an "Add New Title" tile)
// and the read-only Published Books page (app/app/more/books/page.tsx —
// published titles only, no add tile) — extracted so the two don't
// duplicate the tile markup/styling. Owns the grid/list view toggle and
// the click routing rule: a published book goes straight to its own
// detail page, anything else (pending/draft/in_progress) opens
// BookDetailsModal instead, since there's nothing to "manage" yet.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LayoutGrid, List, Trash2, Check } from "lucide-react";
import SectionLabel from "./SectionLabel";
import BookDetailsModal from "./BookDetailsModal";
import {
  naira,
  displayPrice,
  BookCover,
  MY_BOOK_STATUS_LABEL,
  MY_BOOK_STATUS_BADGE_CLASS,
  type MyBook,
} from "../hooks/useMyBooks";

type View = "grid" | "list";
type Book = MyBook;

// Same border-color system as the public portfolio's book shelf
// (.vp-portfolio-book-card-1..6 in globals.css) — cycled by index so each
// title reads as its own object on the shelf instead of a uniform grid.
const BORDER_COLORS = [
  "rgba(184,84,66,0.55)",
  "rgba(133,190,170,0.55)",
  "rgba(176,76,135,0.55)",
  "rgba(235,204,146,0.5)",
  "rgba(84,126,191,0.55)",
  "rgba(227,179,109,0.5)",
];

// Solid (not translucent) backgrounds so the labels read clearly against
// the cover. Draft in particular used to be white text on translucent
// white — same color family diluted against the dark cover, so it never
// had real contrast no matter how opaque; a solid dark neutral behind
// solid white text actually pops. in_progress goes fully solid accent
// with dark text, matching how .btn-primary already treats "text on
// solid accent" elsewhere in the app. pending (a book just created from
// a quote request, before any work has started) gets its own blue
// treatment — distinct from draft, since it's a different state: nothing
// has been submitted yet, staff still owe the requester a full quote.
function StatusBadge({ status }: { status: Book["status"] }) {
  return (
    // py-1.5 (equal to px-1.5) keeps this a compact, flat pill rather
    // than a tall one — full rounding (not the old small corner-tag
    // radius) matches the pill badge used everywhere else (BookDetailsModal).
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.42rem] font-black uppercase tracking-wide shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${MY_BOOK_STATUS_BADGE_CLASS[status]}`}
    >
      {status === "published" && <Check size={8} strokeWidth={3.5} />}
      {MY_BOOK_STATUS_LABEL[status]}
    </span>
  );
}

// Only drafts get a delete affordance — published/in-progress titles
// shouldn't be a one-tap remove away.
function DeleteDraftButton({
  book,
  className,
}: {
  book: Book;
  className: string;
}) {
  if (book.status !== "draft") return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        console.log("publish: delete draft", book.id);
      }}
      aria-label={`Delete draft "${book.title}"`}
      className={`grid place-items-center rounded-full bg-black/60 text-red-300 backdrop-blur-sm transition-colors hover:bg-red-500/80 hover:text-white ${className}`}
    >
      <Trash2 size={12} strokeWidth={2.4} />
    </button>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  const options: { id: View; label: string; Icon: typeof LayoutGrid }[] = [
    { id: "grid", label: "Grid view", Icon: LayoutGrid },
    { id: "list", label: "List view", Icon: List },
  ];

  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      {options.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(id)}
            className="grid h-8 w-8 place-items-center rounded-full transition-all duration-200 active:scale-90"
            style={
              active
                ? {
                    background: "rgb(var(--vp-accent-rgb))",
                    color: "#171100",
                    boxShadow: "0 4px 14px rgba(var(--vp-accent-rgb),0.35)",
                  }
                : { color: "rgba(255,255,255,0.45)" }
            }
          >
            <Icon size={15} strokeWidth={2.3} />
          </button>
        );
      })}
    </div>
  );
}

// Title (small, accent) and price (big, white) reveal on hover/press
// inside the cover itself via the shared .vp-shelf-book-details overlay,
// instead of sitting in a separate block below the image. Reuses that
// exact CSS (globals.css) rather than duplicating it; only the outer
// sizing differs (w-full/aspect-* here, since this tile lives in a CSS
// grid, not the homepage shelf's fixed-width scroll track) —
// .vp-book-cover-hover is a layout-free marker class so both sizings can
// opt into the same hover-reveal behavior without one clobbering the
// other's width.
//
// The delete button has to be a sibling of the cover button, not a
// child — nesting a button inside a button is invalid HTML and breaks
// click handling — so the outer element carries the tile's size/position
// and the cover button fills it via inset-0.
function BookGridTile({
  book,
  index,
  onSelect,
}: {
  book: Book;
  index: number;
  onSelect: (book: Book) => void;
}) {
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div className="relative aspect-[3/4.4] w-full">
      <button
        type="button"
        onClick={() => onSelect(book)}
        className="vp-book-cover-hover absolute inset-0 overflow-hidden rounded-2xl border shadow-[0_10px_26px_rgba(0,0,0,0.4)] transition-transform duration-200 active:scale-[0.97]"
        style={{ borderColor }}
      >
        <BookCover book={book} sizes="(min-width: 768px) 18vw, 32vw" />

        <div className="vp-shelf-book-details">
          <p className="vp-shelf-book-title">{book.title}</p>
          <p className="vp-shelf-book-price">{naira(displayPrice(book))}</p>
        </div>
      </button>

      {/* Inset within the card, matching the home shelf's corner badge
          (.vp-shelf-status-badge: top/right 0.625rem = top-2.5/right-2.5) —
          poking the badge up above the edge (the old -top-2) looked
          like it was straddling the border instead of sitting neatly
          in the corner. Still a sibling of the cover button rather than
          a child, just so it never risks being clipped by the button's
          own overflow-hidden rounded corners. */}
      <span className="absolute top-2.5 right-2.5 z-10">
        <StatusBadge status={book.status} />
      </span>

      <DeleteDraftButton
        book={book}
        className="absolute bottom-1.5 right-1.5 z-10 h-6 w-6"
      />
    </div>
  );
}

function AddNewTitleGridTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[3/4.4] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors"
      style={{
        borderColor: "rgba(var(--vp-accent-rgb),0.4)",
        background: "rgba(var(--vp-accent-rgb),0.07)",
      }}
    >
      <span
        className="grid h-9 w-9 place-items-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.18)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <Plus size={19} strokeWidth={2.5} />
      </span>
      <span className="px-1 text-center text-[0.52rem] font-black uppercase leading-tight tracking-wide text-white/70">
        Add New Title
      </span>
    </button>
  );
}

function BookListRow({
  book,
  index,
  onSelect,
}: {
  book: Book;
  index: number;
  onSelect: (book: Book) => void;
}) {
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div
      className="flex w-full items-center gap-3 rounded-2xl border p-3"
      style={{ background: "rgba(255,255,255,0.03)", borderColor }}
    >
      <button
        type="button"
        onClick={() => onSelect(book)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg border border-white/15">
          <BookCover book={book} sizes="44px" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.85rem] font-black text-white">
            {book.title}
          </p>
          <p className="truncate text-[0.62rem] text-white/40">
            {book.category}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={book.status} />
            <span className="text-[0.56rem] text-white/35">
              {book.date_published ?? "Not yet published"}
            </span>
          </div>
        </div>
      </button>

      <div className="shrink-0 text-right">
        <p
          className="text-[0.85rem] font-black"
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        >
          {naira(book.earned)}
        </p>
        {book.sales > 0 && (
          <p className="text-[0.55rem] text-white/35">{book.sales} sales</p>
        )}
      </div>

      <DeleteDraftButton book={book} className="h-7 w-7 shrink-0" />
    </div>
  );
}

function AddNewTitleListRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors"
      style={{
        borderColor: "rgba(var(--vp-accent-rgb),0.4)",
        background: "rgba(var(--vp-accent-rgb),0.07)",
      }}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.18)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <Plus size={15} strokeWidth={2.5} />
      </span>
      <span className="text-[0.72rem] font-black uppercase tracking-wide text-white/70">
        Add New Title
      </span>
    </button>
  );
}

// `books` is caller-filtered (the Publish tab passes every title, the
// Published Books page passes only status==="published") — this
// component itself doesn't know or care which subset it's showing.
// `onAddTitle` is optional: pass it to also render an "Add New Title"
// tile at the end of the grid/list (the Publish tab does; the read-only
// Published Books page doesn't, since adding a title isn't its job).
export default function BookLibrary({
  books,
  onAddTitle,
}: {
  books: Book[];
  onAddTitle?: () => void;
}) {
  const [view, setView] = useState<View>("grid");
  // Tracked by id, not a snapshot of the book object itself, so the
  // modal keeps showing live data (e.g. a just-updated cover) after
  // useMyBooks()'s shared refetch() runs — a raw object reference
  // wouldn't pick that up until the modal was closed and reopened.
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const router = useRouter();
  const selectedBook = books.find((b) => b.id === selectedBookId) ?? null;

  // Once a title is actually live, tapping it should go straight to the
  // full details page (price, assets, reprint, public link) instead of
  // the intermediate modal — that's the management surface. A
  // not-yet-published book still opens the modal (WhatsApp follow-up or
  // the Change Price/Order Reprint panel).
  const handleSelectBook = (book: Book) => {
    if (book.status === "published") {
      router.push(`/app/publish/book/${book.id}`);
      return;
    }
    setSelectedBookId(book.id);
  };

  return (
    <>
      {books.length > 0 && (
        <div className="vp-card-in mb-4 flex items-center justify-between gap-3">
          <SectionLabel>
            {books.length} {books.length === 1 ? "Title" : "Titles"}
          </SectionLabel>
          <ViewToggle view={view} onChange={setView} />
        </div>
      )}

      {view === "grid" ? (
        <div
          className="vp-card-in grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
          style={{ animationDelay: "80ms" }}
        >
          {books.map((book, i) => (
            <BookGridTile
              key={book.id}
              book={book}
              index={i}
              onSelect={handleSelectBook}
            />
          ))}
          {onAddTitle && <AddNewTitleGridTile onClick={onAddTitle} />}
        </div>
      ) : (
        <div
          className="vp-card-in flex flex-col gap-2.5"
          style={{ animationDelay: "80ms" }}
        >
          {books.map((book, i) => (
            <BookListRow
              key={book.id}
              book={book}
              index={i}
              onSelect={handleSelectBook}
            />
          ))}
          {onAddTitle && <AddNewTitleListRow onClick={onAddTitle} />}
        </div>
      )}

      <BookDetailsModal
        open={selectedBook !== null}
        onClose={() => setSelectedBookId(null)}
        book={selectedBook}
        onOrderReprint={(book) =>
          console.log("publish: order reprint", book.id)
        }
        onChangePrice={(book) => console.log("publish: change price", book.id)}
      />
    </>
  );
}
