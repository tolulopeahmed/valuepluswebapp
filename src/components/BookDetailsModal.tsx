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
      {/* Cover on the left, details on the right — pricing/buttons stay
          full-width at the bottom regardless. */}
      <div className="flex gap-4">
        <div className="relative aspect-[3/4.4] w-40 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <Image
            src={book.cover}
            alt={book.title}
            fill
            sizes="160px"
            className="object-cover"
            priority
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-[0.6rem] font-black uppercase tracking-[0.14em]"
            style={{ color: "rgb(var(--vp-accent-rgb))" }}
          >
            {book.category}
          </p>

          <h3 className="mt-1 text-xl font-black leading-tight text-white">
            {book.title}
          </h3>
          <p className="mt-1 text-[0.78rem] text-white/55">{book.subtitle}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.54rem] font-black uppercase tracking-[0.1em]"
              style={statusStyle}
            >
              {STATUS_LABEL[book.status]}
            </span>

            <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[0.54rem] font-black uppercase tracking-[0.1em] text-white/60">
              {book.format}
            </span>

            <span className="text-[0.54rem] font-black uppercase tracking-[0.1em] text-white/35">
              {book.pages} pages
            </span>
          </div>
        </div>
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
          className="flex-1"
          onClick={() => onChangePrice?.(book)}
        >
          Change Price
        </Button>

        <Button
          variant="primary"
          size="md"
          className="flex-1"
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
