// app/(app)/publish/page.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, LayoutGrid, List, RefreshCw, ShoppingBag } from "lucide-react";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import SectionLabel from "../../../components/SectionLabel";
import Button from "../../../components/buttons/buttons";
import { BOOKS, STATUS_LABEL, slugifyTitle, type Book } from "../PublisherBooks";

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

const STATUS_BADGE_CLASS: Record<Book["status"], string> = {
  published: "bg-[rgba(74,222,128,0.16)] text-[#4ade80]",
  in_progress:
    "bg-[rgba(var(--vp-accent-rgb),0.2)] text-[rgb(var(--vp-accent-rgb))]",
  draft: "bg-white/12 text-white/55",
};

function StatusBadge({ status }: { status: Book["status"] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-2px text-[0.42rem] font-black uppercase tracking-wide ${STATUS_BADGE_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

// Reprint has no flow yet, so it's stubbed like other not-yet-built
// actions in this app (e.g. Settings' onSelect). Buy opens the book's
// public ValuePlus page — the link a publisher hands to real buyers,
// same idea as a Selar product page.
function BookActions({ book }: { book: Book }) {
  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={() => console.log("publish: reprint", book.id)}
        className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[0.55rem] font-black uppercase tracking-wide text-white/70 transition-colors hover:text-white"
        style={{ borderColor: "rgba(255,255,255,0.18)" }}
      >
        <RefreshCw size={11} strokeWidth={2.4} />
        Reprint
      </button>

      <a
        href={`/book/${slugifyTitle(book.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[0.55rem] font-black uppercase tracking-wide"
        style={{ background: "rgb(var(--vp-accent-rgb))", color: "#171100" }}
      >
        <ShoppingBag size={11} strokeWidth={2.4} />
        Buy
      </a>
    </div>
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

// The cover is its own <button> (opens the book), so Reprint/Buy sit
// outside it as siblings — nesting a link/button inside a <button> is
// invalid HTML and breaks click handling.
function BookGridTile({ book, index }: { book: Book; index: number }) {
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => console.log("publish: open book", book.id)}
        className="group relative aspect-[3/4.4] w-full overflow-hidden rounded-2xl border shadow-[0_10px_26px_rgba(0,0,0,0.4)] transition-transform duration-200 active:scale-[0.97]"
        style={{ borderColor }}
      >
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="(min-width: 768px) 22vw, 45vw"
          className="object-cover"
        />
        <span className="absolute right-1.5 top-1.5">
          <StatusBadge status={book.status} />
        </span>
      </button>

      <div className="min-w-0 text-left">
        <p className="truncate text-[0.76rem] font-black text-white">
          {book.title}
        </p>
        <p className="truncate text-[0.58rem] text-white/40">
          {book.category}
        </p>
        <p className="truncate text-[0.6rem] text-white/50">
          {book.datePublished ?? "Not yet published"}
        </p>
        {book.earned > 0 && (
          <p className="truncate text-[0.62rem] font-black text-[rgb(var(--vp-accent-rgb))]">
            {naira(book.earned)}
          </p>
        )}
      </div>

      {book.status === "published" && <BookActions book={book} />}
    </div>
  );
}

function BookListRow({ book, index }: { book: Book; index: number }) {
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div
      className="flex w-full flex-col gap-3 rounded-2xl border p-3"
      style={{ background: "rgba(255,255,255,0.03)", borderColor }}
    >
      <div className="flex w-full items-center gap-3">
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
      </div>

      {book.status === "published" && (
        <div className="w-full sm:w-56 sm:self-end">
          <BookActions book={book} />
        </div>
      )}
    </div>
  );
}

export default function PublishPage() {
  const [view, setView] = useState<View>("grid");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Title className="block">Publish</Title>
          <Subtitle>Manage your books and publish new titles</Subtitle>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-auto items-center gap-1.5"
          onClick={() => console.log("publish: add-new-title")}
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
          className="vp-card-in grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4"
          style={{ animationDelay: "80ms" }}
        >
          {BOOKS.map((book, i) => (
            <BookGridTile key={book.id} book={book} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="vp-card-in flex flex-col gap-2.5"
          style={{ animationDelay: "80ms" }}
        >
          {BOOKS.map((book, i) => (
            <BookListRow key={book.id} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
