// app/(app)/publish/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import MarqueeName from "../../../components/MarqueeName";
import Button from "../../../components/buttons/buttons";
import BookLibrary from "../../../components/BookLibrary";
import { useMyBooks, EmptyBooksState } from "../../../hooks/useMyBooks";

export default function PublishPage() {
  const router = useRouter();
  const goToAddNewTitle = () => router.push("/app/publish/new");
  const { books, loading, error } = useMyBooks();

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* items-center + no flex-wrap: the button always stays to the
          right, never drops to its own line. overflow-hidden lives only
          on the title/subtitle column below (for the marquee/truncate) —
          putting it here on the row too clipped the button's own glow
          into a hard-edged box instead of a soft natural fade. */}
      <div className="vp-card-in mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          <Title className="block truncate">Publish</Title>
          <Subtitle className="block max-w-full">
            <MarqueeName
              text="Manage your books and publish new titles"
              fadeColor="rgba(10,14,27,0.96)"
            />
          </Subtitle>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="shrink-0 items-center gap-1 whitespace-nowrap px-4 py-2 text-[0.78rem] font-bold"
          style={{
            minHeight: "1.85rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "var(--r-sm)",
          }}
          onClick={goToAddNewTitle}
        >
          <Plus size={13} strokeWidth={2.5} />
          Add New Title
        </Button>
      </div>

      {error && (
        <p className="vp-card-in mb-3 text-[0.78rem] text-red-300">{error}</p>
      )}

      {loading ? (
        <div className="vp-card-in py-10 text-center text-[0.8rem] text-white/40">
          Loading your books…
        </div>
      ) : books.length === 0 ? (
        <div className="vp-card-in" style={{ animationDelay: "80ms" }}>
          <EmptyBooksState onAddTitle={goToAddNewTitle} minHeight="22rem" />
        </div>
      ) : (
        <BookLibrary books={books} onAddTitle={goToAddNewTitle} />
      )}
    </div>
  );
}
