// app/(app)/components/PublisherBooks.tsx

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Plus, Check, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import SectionLabel from "../../components/SectionLabel";
import GlassCard from "./GlassCard";
import Button from "../../components/buttons/buttons";
import BookDetailsModal from "../../components/BookDetailsModal";
import { BOOKS, slugifyTitle, STATUS_LABEL, type Book } from "../../data/books";

// Book/BOOKS/slugifyTitle/STATUS_LABEL live in src/data/books.ts (not
// defined here) so the public /book/[slug] server page can import the
// plain array directly — pulling it through this "use client" module
// resolves to an unusable client reference there instead of real data.
export { BOOKS, slugifyTitle, STATUS_LABEL, type Book };

export interface Sale {
  title: string;
  buyer: string;
  amount: number;
  time: string;
}

export const RECENT_SALES: Sale[] = [
  {
    title: "A 10-Day Hack for Busy Moms",
    buyer: "R. Okoye",
    amount: 4500,
    time: "2h ago",
  },
  {
    title: "Letters to My Child",
    buyer: "A. Bello",
    amount: 3000,
    time: "5h ago",
  },
  {
    title: "A 10-Day Hack for Busy Moms",
    buyer: "T. Musa",
    amount: 4500,
    time: "1d ago",
  },
];

export interface LeaderboardEntry {
  name: string;
  xp: number;
  rank: number;
  isYou?: boolean;
}

export const LEADERBOARD: LeaderboardEntry[] = [
  { name: "Akolade F.", xp: 4120, rank: 1 },
  { name: "Chidinma O.", xp: 3870, rank: 2 },
  { name: "Tolulope A. (You)", xp: 2340, rank: 3, isYou: true },
];

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

const STATUS_BADGE_CLASS: Record<Book["status"], string> = {
  published: "bg-[rgba(74,222,128,0.15)] text-[#4ade80]",
  in_progress:
    "bg-[rgba(var(--vp-accent-rgb),0.12)] text-[rgb(var(--vp-accent-rgb))]",
  draft: "bg-white/10 text-white/50",
};

// export function BooksSection({ books = BOOKS }: { books?: Book[] }) {
//   return (
//     <div>
//       <SectionLabel>Manage books</SectionLabel>

//       <div className="grid gap-2.5 md:grid-cols-2">
//         {books.map((book, i) => (
//           <GlassCard
//             key={book.id}
//             className="vp-card-in p-4"
//             style={{ animationDelay: `${i * 50}ms` }}
//           >
//             <div className="flex items-center gap-3">
//               <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-white/15">
//                 <Image
//                   src={book.cover}
//                   alt={book.title}
//                   fill
//                   sizes="40px"
//                   className="object-cover"
//                 />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <p className="truncate text-[0.82rem] font-black text-white">
//                   {book.title}
//                 </p>
//                 <p className="truncate text-[0.58rem] text-white/35">
//                   {book.category}
//                 </p>

//                 <div className="mt-0.5 flex items-center gap-2">
//                   <span
//                     className={`inline-flex items-center rounded-full px-1.5 py-2px text-[0.44rem] font-black uppercase tracking-wider ${STATUS_BADGE_CLASS[book.status]}`}
//                   >
//                     {STATUS_LABEL[book.status]}
//                   </span>

//                   {book.sales > 0 && (
//                     <span className="text-[0.55rem] text-white/35">
//                       {book.sales} sales
//                     </span>
//                   )}
//                 </div>

//                 {book.earned > 0 && (
//                   <p className="mt-0.5 text-[0.68rem] font-black text-[rgb(var(--vp-accent-rgb))]">
//                     {naira(book.earned)} earned
//                   </p>
//                 )}
//               </div>

//               <Button variant="secondary" size="sm" className="shrink-0">
//                 Manage
//               </Button>
//             </div>
//           </GlassCard>
//         ))}
//       </div>
//     </div>
//   );
// }

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

// Green check = published, orange ellipsis = still in progress or a
// draft — one badge covers both non-published states, since the shelf
// only needs to distinguish "live" from "not live yet".
function ShelfStatusBadge({ status }: { status: Book["status"] }) {
  const isPublished = status === "published";

  return (
    <span
      className="vp-shelf-status-badge"
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
  book: Book;
  index: number;
  onSelect: (book: Book) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(book)}
      className="vp-shelf-book-item vp-book-cover-hover"
      style={{ borderColor: BORDER_COLORS[index % BORDER_COLORS.length] }}
    >
      <Image
        src={book.cover}
        alt={book.title}
        fill
        sizes="45vw"
        className="object-cover"
      />
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div>
      <SectionLabel>My Books</SectionLabel>

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
            {BOOKS.map((book, i) => (
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
