"use client";

import Image from "next/image";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import { STATUS_LABEL, type Book } from "../data/books";

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

const STATUS_BADGE_STYLE: Record<
  Book["status"],
  { background: string; color: string }
> = {
  published: { background: "rgba(74,222,128,0.16)", color: "#4ade80" },
  in_progress: {
    background: "rgba(var(--vp-accent-rgb),0.18)",
    color: "rgb(var(--vp-accent-rgb))",
  },
  draft: { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" },
};

interface BookDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onOrderReprint?: (book: Book) => void;
  onChangePrice?: (book: Book) => void;
  book: Book | null;
}

export default function BookDetailsModal({
  open,
  onClose,
  onOrderReprint,
  onChangePrice,
  book,
}: BookDetailsModalProps) {
  if (!book) return null;

  const statusStyle = STATUS_BADGE_STYLE[book.status];

  return (
    <Modal open={open} onClose={onClose}>
      {/* Large hero cover — this modal is for viewing the book's details,
          so the image leads rather than sitting as a small side thumbnail. */}
      <div className="relative mx-auto aspect-[3/4.4] w-56 max-w-full overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="224px"
          className="object-cover"
          priority
        />
      </div>

      <div className="mt-5">
        <p
          className="text-[0.6rem] font-black uppercase tracking-[0.14em]"
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        >
          {book.category}
        </p>

        <h3 className="mt-1 text-2xl font-black leading-tight text-white">
          {book.title}
        </h3>
        <p className="mt-1 text-[0.85rem] text-white/55">{book.subtitle}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em]"
          style={statusStyle}
        >
          {STATUS_LABEL[book.status]}
        </span>

        <span className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-white/35">
          {book.pages} pages
        </span>
      </div>

      <div className="my-5 h-px bg-white/10" />

      <div>
        <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-white/35">
          Price
        </p>
        <p className="mt-1 text-3xl font-black text-white">
          {naira(book.price)}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="secondary"
          size="md"
          className="flex-1 rounded-full"
          onClick={() => onChangePrice?.(book)}
        >
          Change Price
        </Button>

        <Button
          variant="primary"
          size="md"
          className="flex-1 rounded-full"
          onClick={() => {
            onOrderReprint?.(book);
            onClose();
          }}
        >
          Order Reprint
        </Button>
      </div>
    </Modal>
  );
}
