// app/(app)/components/PublisherBooks.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Check, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import SectionLabel from "../../components/SectionLabel";
import BookDetailsModal from "../../components/BookDetailsModal";
import {
  useMyBooks,
  naira,
  BookCover,
  EmptyBooksState,
  type MyBook,
} from "../../hooks/useMyBooks";

// Same border-color system as the Publish page's shelf and the public
// portfolio's book cards (.vp-portfolio-book-card-1..6 in globals.css) —
// cycled by index so each cover reads as its own object, not a uniform
// strip.
const BORDER_COLORS = [
  "rgba(184,84,66,0.55)",
  "rgba(133,190,170,0.55)",
  "rgba(176,76,135,0.55)",
  "rgba(235,204,146,0.5)",
  "rgba(84,126,191,0.55)",
  "rgba(227,179,109,0.5)",
];

// Green check = published, orange ellipsis = anything not live yet
// (pending/draft/in_progress) — one badge covers all three, since the
// shelf only needs to distinguish "live" from "not live yet".
function ShelfStatusBadge({ status }: { status: MyBook["status"] }) {
  const isPublished = status === "published";

  return (
    <span
      className={`vp-shelf-status-badge${isPublished ? "" : " vp-badge-glow"}`}
      style={
        isPublished
          ? { background: "#4ade80", color: "#0b1a0f" }
          : { background: "#fb923c", color: "#2a1503" }
      }
      aria-label={isPublished ? "Published" : "Pending"}
      title={isPublished ? "Published" : "Pending"}
    >
      {isPublished ? (
        <Check size={13} strokeWidth={3.25} />
      ) : (
        <MoreHorizontal size={14} strokeWidth={3.25} />
      )}
    </span>
  );
}

function ShelfBookTile({
  book,
  index,
  onSelect,
}: {
  book: MyBook;
  index: number;
  onSelect: (book: MyBook) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(book)}
      className="vp-shelf-book-item vp-book-cover-hover"
      style={{ borderColor: BORDER_COLORS[index % BORDER_COLORS.length] }}
    >
      <BookCover book={book} sizes="45vw" />
      <ShelfStatusBadge status={book.status} />

      {/* Same hover/press reveal as the public portfolio's book cards
          (.vp-portfolio-book-details) — title (accent color) on top,
          price below, instead of category/title. */}
      <div className="vp-shelf-book-details">
        <p className="vp-shelf-book-title">{book.title}</p>
        <p className="vp-shelf-book-price">{naira(book.price)}</p>
      </div>
    </button>
  );
}

function ShelfAddTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="vp-shelf-add-tile"
      aria-label="Add new title"
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

export function PublisherBookShelf() {
  const router = useRouter();
  // Straight to the creation flow, not just the listing — this tile is
  // literally labeled "Add New Title".
  const goToAddNewTitle = () => router.push("/app/publish/new");
  const viewportRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [selectedBook, setSelectedBook] = useState<MyBook | null>(null);
  const { books, loading } = useMyBooks();

  // Auto-advances scrollLeft a little every frame, once — unlike the
  // portfolio marquee (a duplicated CSS animation that loops forever),
  // this makes a single pass and stops for good once it reaches the
  // end (the Add New Title tile), rather than resetting and repeating.
  // Pausing on hover/press still lets the user scroll or swipe it
  // manually via the element's native overflow-x, both during the pass
  // and after it's finished.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const PIXELS_PER_FRAME = 0.4;
    let frame: number;

    const step = () => {
      if (!pausedRef.current) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          if (el.scrollLeft >= max - 1) {
            el.scrollLeft = max;
            return; // reached the end — stop, don't loop
          }
          el.scrollLeft += PIXELS_PER_FRAME;
        }
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [books.length]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div>
      <SectionLabel>My Books</SectionLabel>

      {loading ? (
        <div className="py-6 text-center text-[0.8rem] text-white/40">
          Loading your books…
        </div>
      ) : books.length === 0 ? (
        <EmptyBooksState onAddTitle={goToAddNewTitle} minHeight="14rem" />
      ) : (
        <div className="vp-shelf-marquee-shell">
          <div
            ref={viewportRef}
            className="vp-shelf-marquee-viewport"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onPointerDown={pause}
            onPointerUp={resume}
            onPointerCancel={resume}
            onTouchStart={pause}
            onTouchEnd={resume}
          >
            <div className="vp-shelf-marquee-track">
              {books.map((book, i) => (
                <ShelfBookTile
                  key={book.id}
                  book={book}
                  index={i}
                  onSelect={setSelectedBook}
                />
              ))}
              <ShelfAddTile onClick={goToAddNewTitle} />
            </div>
          </div>
        </div>
      )}

      <BookDetailsModal
        open={selectedBook !== null}
        onClose={() => setSelectedBook(null)}
        book={selectedBook}
        onOrderReprint={(book) =>
          console.log("publish: order reprint", book.id)
        }
        onChangePrice={(book) => console.log("publish: change price", book.id)}
      />
    </div>
  );
}
