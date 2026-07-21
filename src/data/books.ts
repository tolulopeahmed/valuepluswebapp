// src/data/books.ts
//
// Plain data module (no "use client") so it can be imported directly by
// server components — the public /book/[slug] page needs BOOKS at
// request time, and importing it through PublisherBooks.tsx (a "use
// client" module) resolves to an unusable client reference there, not
// the real array. PublisherBooks.tsx re-exports everything here for its
// own (client) consumers, so this is the single source of truth either
// way.

export interface Book {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  // Real cover art (same assets as the public portfolio page), not a
  // gradient placeholder — an image path, rendered via next/image.
  cover: string;
  status: "published" | "in_progress" | "draft";
  pages: number;
  sales: number;
  earned: number;
  datePublished: string | null;
  price: number;
  description: string;
}

// Placeholder titles/covers borrowed from the public portfolio
// (components/landing/Portfolio.tsx) until real publisher uploads exist.
export const BOOKS: Book[] = [
  {
    id: 1,
    title: "A 10-Day Hack for Busy Moms",
    subtitle: "A Faith-Rooted Plan to Reclaim Your Time and Peace",
    category: "Faith / Inspiration",
    cover: "/images/covers/10-day-hack.jpg",
    status: "published",
    pages: 86,
    sales: 124,
    earned: 186000,
    datePublished: "Jan 15, 2026",
    price: 6500,
    description:
      "A practical, faith-rooted 10-day plan to help busy mothers reclaim their time, energy, and peace of mind.",
  },
  {
    id: 2,
    title: "Letters to My Child",
    subtitle: "A Father's Wisdom on Character, Faith, Work and Life",
    category: "Leadership",
    cover: "/images/covers/letters-to-my-child.png",
    status: "published",
    pages: 142,
    sales: 87,
    earned: 130500,
    datePublished: "Mar 3, 2026",
    price: 10000,
    description:
      "A father's collected wisdom on character, faith, work, and life — fifty intimate letters written for the next generation.",
  },
  {
    id: 3,
    title: "Beyond The Struggle",
    subtitle: "Finding Purpose on the Other Side of Hardship",
    category: "Personal Growth",
    cover: "/images/covers/beyond-the-struggle.png",
    status: "in_progress",
    pages: 118,
    sales: 0,
    earned: 0,
    datePublished: null,
    price: 7500,
    description:
      "An honest, encouraging look at pushing through hardship and finding purpose on the other side.",
  },
  {
    id: 4,
    title: "Woman of Vision",
    subtitle: "Building Business and Legacy Without Losing Yourself",
    category: "Business",
    cover: "/images/covers/woman-of-vision.jpg",
    status: "draft",
    pages: 164,
    sales: 0,
    earned: 0,
    datePublished: null,
    price: 9000,
    description:
      "A guide for ambitious women building businesses and legacies without losing themselves in the process.",
  },
];

// Used for the book's public buy-page URL (/book/[slug]) — kept alongside
// BOOKS since it's the one place title → URL identity is decided.
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const STATUS_LABEL: Record<Book["status"], string> = {
  published: "Published",
  in_progress: "In Progress",
  draft: "Draft",
};
