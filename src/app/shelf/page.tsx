// Server wrapper for the public catalog: fetches the books on the server and
// caches the page (ISR), so visitors get books in the HTML straight from the
// CDN instead of waiting for the browser to call an API that may be
// cold-starting. Search/sort/filters stay client-side (ShelfCatalog).
//
// Formerly /books — see next.config.ts for the permanent redirect from
// the old URL.
import ShelfCatalog from "./ShelfCatalog";
import { getBooks } from "./catalog";

// Refresh the cached page in the background at most every 5 min - new titles
// appear within minutes without any visitor waiting on the API.
export const revalidate = 300;

export default async function ShelfPage() {
  return <ShelfCatalog initial={await getBooks()} />;
}
