// An author's own page: valuepluspublishing.com/<handle> (e.g.
// /tolulopeahmed) shows every title they've published, and only theirs -
// the one link an author shares for all their books. The handle comes from
// their name (apps.accounts.handles on the server); site routes like /shelf
// or /book always win over this catch-all, and the server never hands out
// a handle that matches one.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShelfCatalog from "../shelf/ShelfCatalog";
import { getBooks } from "../shelf/catalog";

export const revalidate = 300;

const HANDLE = /^[a-z0-9]{3,40}$/;

async function authorBooks(raw: string) {
  const handle = raw.toLowerCase();
  if (!HANDLE.test(handle)) notFound();
  const books = await getBooks(handle);
  if (books && books.results.length === 0) notFound();
  return { handle, books };
}

function byline(books: Awaited<ReturnType<typeof getBooks>>) {
  const names = (books?.results ?? []).map((book) => book.author_name).filter(Boolean);
  return names.sort((a, b) => a.length - b.length)[0] ?? "";
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const { books } = await authorBooks(handle);
  const name = byline(books);
  const count = books?.count ?? books?.results.length ?? 0;
  return {
    title: name ? `Books by ${name} | ValuePlus` : "ValuePlus author",
    description: name ? `All ${count} ${count === 1 ? "title" : "titles"} by ${name} on ValuePlus.` : undefined,
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const { books } = await authorBooks(handle);
  return <ShelfCatalog initial={books} authorHandle={handle} />;
}
