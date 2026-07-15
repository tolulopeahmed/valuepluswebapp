// app/(app)/components/PublisherBooks.tsx

"use client";

import SectionLabel from "../../components/SectionLabel";
import GlassCard from "./GlassCard";
import Button from "../../components/buttons/buttons";
import { ProgressRoadmap, type RoadmapItem } from "./CurriculumRoadmap";

export interface Book {
  id: number;
  title: string;
  cover: string;
  status: "published" | "in_progress" | "draft";
  sales: number;
  earned: number;
}

export const BOOKS: Book[] = [
  {
    id: 1,
    title: "The Wealth Blueprint",
    cover: "bg-gradient-to-br from-[#9d4d3d] to-[#3e1713]",
    status: "published",
    sales: 124,
    earned: 186000,
  },
  {
    id: 2,
    title: "Faith That Moves Mountains",
    cover: "bg-gradient-to-br from-[#233d66] to-[#091423]",
    status: "published",
    sales: 87,
    earned: 130500,
  },
  {
    id: 3,
    title: "The Leadership Code",
    cover: "bg-gradient-to-br from-[#915071] to-[#2f1223]",
    status: "in_progress",
    sales: 0,
    earned: 0,
  },
];

export interface Sale {
  title: string;
  buyer: string;
  amount: number;
  time: string;
}

export const RECENT_SALES: Sale[] = [
  {
    title: "The Wealth Blueprint",
    buyer: "R. Okoye",
    amount: 4500,
    time: "2h ago",
  },
  {
    title: "Faith That Moves Mountains",
    buyer: "A. Bello",
    amount: 3000,
    time: "5h ago",
  },
  {
    title: "The Wealth Blueprint",
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

function Icon({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
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
              <div
                className={`h-14 w-10 flex-shrink-0 rounded-lg ${book.cover} border border-white/[0.15]`}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] font-black text-white">
                  {book.title}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-[2px] text-[0.44rem] font-black uppercase tracking-wider ${
                      book.status === "published"
                        ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80]"
                        : "bg-[rgba(var(--vp-accent-rgb),0.12)] text-[rgb(var(--vp-accent-rgb))]"
                    }`}
                  >
                    {book.status === "published" ? "Published" : "In Progress"}
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

              <Button variant="secondary" size="sm" className="flex-shrink-0">
                Manage
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export function PublisherRoadmap() {
  const items: RoadmapItem[] = BOOKS.map((book) => ({
    id: book.id,
    label: book.title.split(" ").slice(0, 2).join(" "),
    status: (book.status === "published"
      ? "done"
      : book.status === "in_progress"
        ? "current"
        : "upcoming") as "done" | "current" | "upcoming",
  }));

  return <ProgressRoadmap items={items} />;
}
