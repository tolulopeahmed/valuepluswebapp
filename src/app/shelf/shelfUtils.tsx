import { Star } from "lucide-react";
import type { PublicBookSummary } from "./ShelfCatalog";

export function naira(value: number) {
  return `₦${value.toLocaleString()}`;
}

// The price shown on the shelf: ebook first, then paperback, then hardback.
export function displayPrice(book: PublicBookSummary): { price: number; oldPrice: number | null } | null {
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

export function bookYear(book: PublicBookSummary) {
  return book.date_published ? book.date_published.slice(0, 4) : "";
}

// Published in the last 30 days.
export function isNewRelease(book: PublicBookSummary) {
  if (!book.date_published) return false;
  return Date.now() - new Date(book.date_published).getTime() < 30 * 24 * 60 * 60 * 1000;
}

export function firstParagraph(text: string) {
  return text.replace(/\r\n?/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).find(Boolean) ?? "";
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span aria-label={`Rated ${value.toFixed(1)} out of 5`} style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.5}
          aria-hidden="true"
          fill={value >= n - 0.25 ? "#f2c94c" : "transparent"}
          color={value >= n - 0.25 ? "#f2c94c" : "#6b7280"}
        />
      ))}
    </span>
  );
}
