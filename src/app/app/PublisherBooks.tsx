// app/(app)/components/PublisherBooks.tsx

"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import SectionLabel from "../../components/SectionLabel";
import GlassCard from "./GlassCard";
import Button from "../../components/buttons/buttons";
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

export function BooksSection({ books = BOOKS }: { books?: Book[] }) {
  return (
    <div>
      <SectionLabel>Manage books</SectionLabel>

      <div className="grid gap-2.5 md:grid-cols-2">
        {books.map((book, i) => (
          <GlassCard
            key={book.id}
            className="vp-card-in p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-white/15">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] font-black text-white">
                  {book.title}
                </p>
                <p className="truncate text-[0.58rem] text-white/35">
                  {book.category}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-2px text-[0.44rem] font-black uppercase tracking-wider ${STATUS_BADGE_CLASS[book.status]}`}
                  >
                    {STATUS_LABEL[book.status]}
                  </span>

                  {book.sales > 0 && (
                    <span className="text-[0.55rem] text-white/35">
                      {book.sales} sales
                    </span>
                  )}
                </div>

                {book.earned > 0 && (
                  <p className="mt-0.5 text-[0.68rem] font-black text-[rgb(var(--vp-accent-rgb))]">
                    {naira(book.earned)} earned
                  </p>
                )}
              </div>

              <Button variant="secondary" size="sm" className="shrink-0">
                Manage
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

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

// One lap of the shelf: every book, then the Add New Title tile at the
// end. Rendered twice back-to-back in the marquee track below so the
// CSS animation (translate 0 → -50%, linear infinite) loops seamlessly —
// it reads as restarting from the beginning rather than reversing or
// jump-cutting.
function ShelfLap({
  keyPrefix,
  onAddNewTitle,
}: {
  keyPrefix: string;
  onAddNewTitle: () => void;
}) {
  return (
    <>
      {BOOKS.map((book, i) => (
        <div
          key={`${keyPrefix}-${book.id}`}
          className="vp-shelf-book-item"
          style={{ borderColor: BORDER_COLORS[i % BORDER_COLORS.length] }}
        >
          <Image
            src={book.cover}
            alt={book.title}
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onAddNewTitle}
        className="vp-shelf-add-tile"
        aria-label="Add new title"
      >
        <span
          className="grid h-8 w-8 place-items-center rounded-full"
          style={{
            background: "rgba(var(--vp-accent-rgb),0.18)",
            color: "rgb(var(--vp-accent-rgb))",
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
        </span>
        <span className="px-1 text-center text-[0.48rem] font-black uppercase leading-tight tracking-wide text-white/70">
          Add New Title
        </span>
      </button>
    </>
  );
}

export function PublisherBookShelf() {
  const router = useRouter();
  const goToPublish = () => router.push("/app/publish");

  return (
    <div>
      <SectionLabel>My Books</SectionLabel>

      <div className="vp-shelf-marquee-shell">
        <div className="vp-shelf-marquee-viewport">
          <div className="vp-shelf-marquee-track">
            <ShelfLap keyPrefix="a" onAddNewTitle={goToPublish} />
            <ShelfLap keyPrefix="b" onAddNewTitle={goToPublish} />
          </div>
        </div>
      </div>
    </div>
  );
}
