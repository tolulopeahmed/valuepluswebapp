// app/(app)/more/books/page.tsx
//
// "My Books" settings row -> here. Read-only counterpart to the Publish
// tab: only status==="published" titles, no "Add New Title" tile (that's
// the Publish tab's job) — reuses BookLibrary for the actual grid/list
// rendering so the two pages don't duplicate that markup.

"use client";

import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import Title from "../../../../components/Title";
import Subtitle from "../../../../components/Subtitle";
import BookLibrary from "../../../../components/BookLibrary";
import { useMyBooks } from "../../../../hooks/useMyBooks";

function EmptyPublishedState({ onGoToPublish }: { onGoToPublish: () => void }) {
  return (
    <button
      type="button"
      onClick={onGoToPublish}
      className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center transition-transform active:scale-[0.99]"
      style={{
        minHeight: "18rem",
        borderColor: "rgba(var(--vp-accent-rgb),0.4)",
        background: "rgba(var(--vp-accent-rgb),0.07)",
      }}
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.18)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <BookOpen size={22} strokeWidth={2.2} />
      </span>
      <span className="max-w-[16rem] text-[0.9rem] font-black leading-snug text-white/70">
        Nothing published yet.{" "}
        <span style={{ color: "rgb(var(--vp-accent-rgb))" }}>
          Check your Publish tab for what&apos;s in progress.
        </span>
      </span>
    </button>
  );
}

export default function PublishedBooksPage() {
  const router = useRouter();
  const { books, loading, error } = useMyBooks();
  const publishedBooks = books.filter((b) => b.status === "published");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-5">
        <Title className="block truncate">Published Books</Title>
        <Subtitle className="block max-w-full">
          Every title you&apos;ve published, live on ValuePlus
        </Subtitle>
      </div>

      {error && (
        <p className="vp-card-in mb-3 text-[0.78rem] text-red-300">{error}</p>
      )}

      {loading ? (
        <div className="vp-card-in py-10 text-center text-[0.8rem] text-white/40">
          Loading your books…
        </div>
      ) : publishedBooks.length === 0 ? (
        <div className="vp-card-in" style={{ animationDelay: "80ms" }}>
          <EmptyPublishedState onGoToPublish={() => router.push("/app/publish")} />
        </div>
      ) : (
        <BookLibrary books={publishedBooks} />
      )}
    </div>
  );
}
