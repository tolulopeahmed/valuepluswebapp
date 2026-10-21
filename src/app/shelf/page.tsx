// Server wrapper for the public catalog: fetches the books on the server and
// caches the page (ISR), so visitors get books in the HTML straight from the
// CDN instead of waiting for the browser to call an API that may be
// cold-starting. Search/sort/filters stay client-side (ShelfCatalog).
//
// Formerly /books — see next.config.ts for the permanent redirect from
// the old URL.
import ShelfCatalog, { type PaginatedBooks } from "./ShelfCatalog";

// Refresh the cached page in the background at most every 5 min - new titles
// appear within minutes without any visitor waiting on the API.
export const revalidate = 300;

// The API runs on Render's free tier, which sleeps when idle and can take
// ~30-60s to wake. This refresh runs in the background (visitors keep getting
// the cached page), so it can afford to wait - and retry once.
const FETCH_TIMEOUT_MS = 45000;

async function fetchBooks(baseUrl: string) {
  const res = await fetch(`${baseUrl}/books/public/`, {
    next: { revalidate },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Catalogue request failed (${res.status})`);
  return (await res.json()) as PaginatedBooks;
}

async function getBooks(): Promise<PaginatedBooks | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    return await fetchBooks(baseUrl);
  } catch {
    try {
      return await fetchBooks(baseUrl);
    } catch (error) {
      // At build time, ship the page without books (the browser fills them
      // in). On a background refresh, throw instead: Next.js then keeps
      // serving the last good page rather than caching an empty shelf.
      if (process.env.NEXT_PHASE === "phase-production-build") return null;
      throw error;
    }
  }
}

export default async function ShelfPage() {
  return <ShelfCatalog initial={await getBooks()} />;
}
