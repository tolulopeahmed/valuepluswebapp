// Server-side catalogue fetch shared by /shelf and the author pages
// (/<handle>): both are cached (ISR) so visitors get books in the HTML
// straight from the CDN.
import type { PaginatedBooks } from "./ShelfCatalog";

// Refresh the cached page in the background at most every 5 min - new titles
// appear within minutes without any visitor waiting on the API.
const revalidate = 300;

// The API runs on Render's free tier, which sleeps when idle and can take
// ~30-60s to wake. This refresh runs in the background (visitors keep getting
// the cached page), so it can afford to wait - and retry once.
const FETCH_TIMEOUT_MS = 45000;

async function fetchBooks(baseUrl: string, author?: string) {
  const query = author ? `?author=${encodeURIComponent(author)}` : "";
  const res = await fetch(`${baseUrl}/books/public/${query}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Catalogue request failed (${res.status})`);
  return (await res.json()) as PaginatedBooks;
}

// `author` (a handle) narrows it to one author's titles - their page.
export async function getBooks(author?: string): Promise<PaginatedBooks | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    return await fetchBooks(baseUrl, author);
  } catch {
    try {
      return await fetchBooks(baseUrl, author);
    } catch (error) {
      // At build time, ship the page without books (the browser fills them
      // in). On a background refresh, throw instead: Next.js then keeps
      // serving the last good page rather than caching an empty shelf.
      if (process.env.NEXT_PHASE === "phase-production-build") return null;
      throw error;
    }
  }
}

