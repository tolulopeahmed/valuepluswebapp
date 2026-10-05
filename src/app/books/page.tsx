// Server wrapper for the public catalog: fetches the first page of books
// on the server and caches it (ISR), so visitors get books in the HTML
// straight from the CDN instead of waiting for the browser to call an API
// that may be cold-starting. Search/load-more stay client-side
// (BooksCatalog). If the API is unreachable, `initial` is null and the
// client falls back to fetching as before.
import BooksCatalog, { type PaginatedBooks } from "./BooksCatalog";

// Refresh the cached first page in the background at most every 5 min -
// new titles appear within minutes without any visitor waiting on the API.
export const revalidate = 300;

async function getFirstPage(): Promise<PaginatedBooks | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${baseUrl}/books/public/`, {
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as PaginatedBooks;
  } catch {
    return null;
  }
}

export default async function BooksPage() {
  return <BooksCatalog initial={await getFirstPage()} />;
}
