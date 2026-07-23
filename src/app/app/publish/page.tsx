// app/(app)/publish/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, LayoutGrid, List, Trash2, Check } from "lucide-react";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import SectionLabel from "../../../components/SectionLabel";
import MarqueeName from "../../../components/MarqueeName";
import Button from "../../../components/buttons/buttons";
import { BOOKS, STATUS_LABEL, type Book } from "../PublisherBooks";

type View = "grid" | "list";

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

// Same border-color system as the public portfolio's book shelf
// (.vp-portfolio-book-card-1..6 in globals.css) — cycled by index so each
// title reads as its own object on the shelf instead of a uniform grid.
const BORDER_COLORS = [
  "rgba(184,84,66,0.55)",
  "rgba(133,190,170,0.55)",
  "rgba(176,76,135,0.55)",
  "rgba(235,204,146,0.5)",
  "rgba(84,126,191,0.55)",
  "rgba(227,179,109,0.5)",
];

// Solid (not translucent) backgrounds so the labels read clearly against
// the cover. Draft in particular used to be white text on translucent
// white — same color family diluted against the dark cover, so it never
// had real contrast no matter how opaque; a solid dark neutral behind
// solid white text actually pops. in_progress goes fully solid accent
// with dark text, matching how .btn-primary already treats "text on
// solid accent" elsewhere in the app.
const STATUS_BADGE_CLASS: Record<Book["status"], string> = {
  published: "bg-[#123524] text-[#4ade80] border border-[rgba(74,222,128,0.6)]",
  in_progress:
    "bg-[rgb(var(--vp-accent-rgb))] text-[#171100] border border-[rgba(255,255,255,0.35)]",
  draft: "bg-[#3a3f52] text-white border border-white/25",
};

function StatusBadge({ status }: { status: Book["status"] }) {
  return (
    // py-1.5 (equal to px-1.5) made this a tall pill, not a compact
    // badge — a flatter vertical padding with a small (not full) radius
    // reads as a proper corner tag instead.
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[0.42rem] font-black uppercase tracking-wide shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${STATUS_BADGE_CLASS[status]}`}
    >
      {status === "published" && <Check size={8} strokeWidth={3.5} />}
      {STATUS_LABEL[status]}
    </span>
  );
}

// Only drafts get a delete affordance — published/in-progress titles
// shouldn't be a one-tap remove away.
function DeleteDraftButton({
  book,
  className,
}: {
  book: Book;
  className: string;
}) {
  if (book.status !== "draft") return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        console.log("publish: delete draft", book.id);
      }}
      aria-label={`Delete draft "${book.title}"`}
      className={`grid place-items-center rounded-full bg-black/60 text-red-300 backdrop-blur-sm transition-colors hover:bg-red-500/80 hover:text-white ${className}`}
    >
      <Trash2 size={12} strokeWidth={2.4} />
    </button>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  const options: { id: View; label: string; Icon: typeof LayoutGrid }[] = [
    { id: "grid", label: "Grid view", Icon: LayoutGrid },
    { id: "list", label: "List view", Icon: List },
  ];

  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      {options.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(id)}
            className="grid h-8 w-8 place-items-center rounded-full transition-all duration-200 active:scale-90"
            style={
              active
                ? {
                    background: "rgb(var(--vp-accent-rgb))",
                    color: "#171100",
                    boxShadow: "0 4px 14px rgba(var(--vp-accent-rgb),0.35)",
                  }
                : { color: "rgba(255,255,255,0.45)" }
            }
          >
            <Icon size={15} strokeWidth={2.3} />
          </button>
        );
      })}
    </div>
  );
}

// Same look as the homepage's publisher book shelf (PublisherBooks.tsx) —
// title (small, accent) and price (big, white) reveal on hover/press
// inside the cover itself via the shared .vp-shelf-book-details overlay,
// instead of sitting in a separate block below the image. Reuses that
// exact CSS (globals.css) rather than duplicating it; only the outer
// sizing differs (w-full/aspect-* here, since this tile lives in a CSS
// grid, not the shelf's fixed-width scroll track) — .vp-book-cover-hover
// is a layout-free marker class so both sizings can opt into the same
// hover-reveal behavior without one clobbering the other's width.
//
// The delete button has to be a sibling of the cover button, not a
// child — nesting a button inside a button is invalid HTML and breaks
// click handling — so the outer element carries the tile's size/position
// and the cover button fills it via inset-0.
function BookGridTile({ book, index }: { book: Book; index: number }) {
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div className="relative aspect-[3/4.4] w-full">
      <button
        type="button"
        onClick={() => console.log("publish: open book", book.id)}
        className="vp-book-cover-hover absolute inset-0 overflow-hidden rounded-2xl border shadow-[0_10px_26px_rgba(0,0,0,0.4)] transition-transform duration-200 active:scale-[0.97]"
        style={{ borderColor }}
      >
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="(min-width: 768px) 18vw, 32vw"
          className="object-cover"
        />
        <span className="absolute right-1 top-1">
          <StatusBadge status={book.status} />
        </span>

        <div className="vp-shelf-book-details">
          <p className="vp-shelf-book-title">{book.title}</p>
          <p className="vp-shelf-book-price">{naira(book.price)}</p>
        </div>
      </button>

      <DeleteDraftButton
        book={book}
        className="absolute bottom-1.5 right-1.5 z-10 h-6 w-6"
      />
    </div>
  );
}

function AddNewTitleGridTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[3/4.4] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors"
      style={{
        borderColor: "rgba(var(--vp-accent-rgb),0.4)",
        background: "rgba(var(--vp-accent-rgb),0.07)",
      }}
    >
      <span
        className="grid h-9 w-9 place-items-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.18)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <Plus size={19} strokeWidth={2.5} />
      </span>
      <span className="px-1 text-center text-[0.52rem] font-black uppercase leading-tight tracking-wide text-white/70">
        Add New Title
      </span>
    </button>
  );
}

function BookListRow({ book, index }: { book: Book; index: number }) {
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div
      className="flex w-full items-center gap-3 rounded-2xl border p-3"
      style={{ background: "rgba(255,255,255,0.03)", borderColor }}
    >
      <button
        type="button"
        onClick={() => console.log("publish: open book", book.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg border border-white/15">
          <Image
            src={book.cover}
            alt={book.title}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.85rem] font-black text-white">
            {book.title}
          </p>
          <p className="truncate text-[0.62rem] text-white/40">
            {book.category}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={book.status} />
            <span className="text-[0.56rem] text-white/35">
              {book.datePublished ?? "Not yet published"}
            </span>
          </div>
        </div>
      </button>

      <div className="shrink-0 text-right">
        <p
          className="text-[0.85rem] font-black"
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        >
          {naira(book.earned)}
        </p>
        {book.sales > 0 && (
          <p className="text-[0.55rem] text-white/35">{book.sales} sales</p>
        )}
      </div>

      <DeleteDraftButton book={book} className="h-7 w-7 shrink-0" />
    </div>
  );
}

function AddNewTitleListRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors"
      style={{
        borderColor: "rgba(var(--vp-accent-rgb),0.4)",
        background: "rgba(var(--vp-accent-rgb),0.07)",
      }}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.18)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <Plus size={15} strokeWidth={2.5} />
      </span>
      <span className="text-[0.72rem] font-black uppercase tracking-wide text-white/70">
        Add New Title
      </span>
    </button>
  );
}

export default function PublishPage() {
  const [view, setView] = useState<View>("grid");
  const router = useRouter();
  const goToAddNewTitle = () => router.push("/app/publish/new");

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* items-center + no flex-wrap: the button always stays to the
          right, never drops to its own line. overflow-hidden lives only
          on the title/subtitle column below (for the marquee/truncate) —
          putting it here on the row too clipped the button's own glow
          into a hard-edged box instead of a soft natural fade. */}
      <div className="vp-card-in mb-3 flex items-center justify-between gap-3">
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
          className="w-auto shrink-0 items-center gap-1.5 whitespace-nowrap"
          onClick={goToAddNewTitle}
        >
          <Plus size={15} strokeWidth={2.75} />
          Add New Title
        </Button>
      </div>

      <div
        className="vp-card-in mb-3.5 flex items-center justify-between gap-3"
        style={{ animationDelay: "40ms" }}
      >
        <SectionLabel>
          {BOOKS.length} {BOOKS.length === 1 ? "Title" : "Titles"}
        </SectionLabel>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "grid" ? (
        <div
          className="vp-card-in grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
          style={{ animationDelay: "80ms" }}
        >
          {BOOKS.map((book, i) => (
            <BookGridTile key={book.id} book={book} index={i} />
          ))}
          <AddNewTitleGridTile onClick={goToAddNewTitle} />
        </div>
      ) : (
        <div
          className="vp-card-in flex flex-col gap-2.5"
          style={{ animationDelay: "80ms" }}
        >
          {BOOKS.map((book, i) => (
            <BookListRow key={book.id} book={book} index={i} />
          ))}
          <AddNewTitleListRow onClick={goToAddNewTitle} />
        </div>
      )}
    </div>
  );
}
