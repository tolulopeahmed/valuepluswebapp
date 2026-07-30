"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import BookCoverCropModal from "./BookCoverCropModal";
import { notify } from "../lib/snackbar";
import { ApiError } from "../lib/api";
import {
  naira,
  BookCover,
  uploadBookCover,
  deleteBookCover,
  useMyBooks,
  MY_BOOK_STATUS_LABEL,
  MY_BOOK_STATUS_BADGE_CLASS,
  type MyBook,
} from "../hooks/useMyBooks";

// Same admin line used elsewhere (Sidebar.tsx, more/Settings.tsx):
// 09024312689 in wa.me international format.
const ADMIN_WHATSAPP_NUMBER = "2349024312689";

// lucide has no WhatsApp glyph — same local fill-based SVG already
// duplicated in Sidebar.tsx/Settings.tsx for the same reason.
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.02 4C9.4 4 4 9.33 4 15.9c0 2.1.56 4.15 1.62 5.95L4 28l6.32-1.58A12.17 12.17 0 0 0 16.02 28C22.65 28 28 22.67 28 16.1 28 9.53 22.65 4 16.02 4Zm0 21.86c-1.78 0-3.52-.47-5.03-1.36l-.36-.21-3.75.94 1-3.62-.24-.38a9.86 9.86 0 0 1-1.5-5.23c0-5.38 4.43-9.76 9.88-9.76 5.45 0 9.88 4.38 9.88 9.76s-4.43 9.86-9.88 9.86Z" />
      <path d="M21.42 18.55c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.09 3.17 5.07 4.45.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

// The manuscript details from "Get a Quote" — pages/words/chapters/copies,
// book size, selected services, notes — for a book still awaiting a real
// quote (no price yet) from staff.
function buildWhatsAppMessage(book: MyBook): string {
  const q = book.quotation;
  const lines: string[] = [
    `Hi ValuePlus! Following up on my quote request for "${book.title}".`,
    "",
  ];

  if (book.category) lines.push(`Category: ${book.category}`);
  if (q?.book_size) lines.push(`Book size: ${q.book_size}`);
  if (q?.pages) lines.push(`Pages: ${q.pages}`);
  if (q?.words) lines.push(`Words: ${q.words}`);
  if (q?.chapters) lines.push(`Chapters: ${q.chapters}`);
  if (q?.copies) lines.push(`Copies: ${q.copies}`);

  if (q && q.selected_services.length > 0) {
    lines.push("", "Services requested:");
    for (const service of q.selected_services) {
      lines.push(`- ${service.label}`);
    }
    lines.push(`Services total: ${naira(q.services_total)}`);
  }

  if (q?.additional_notes) {
    lines.push("", `Notes: ${q.additional_notes}`);
  }

  lines.push(
    "",
    q?.has_print_element
      ? "I'm still expecting my full quote (including print cost) — could you follow up? Thank you!"
      : "Just confirming this is my final quote — could you follow up? Thank you!",
  );

  return lines.join("\n");
}

// A `pending` book (fresh off "Get a Quote") has no real price yet — show
// what was actually submitted, plus a WhatsApp follow-up, instead of the
// price/reprint panel meant for a book staff have already quoted. Sits in
// the narrow column beside the cover, so this stays compact — a single
// wrapped line of stats rather than a bordered table, small service
// chips, and the estimate total in the same "so far" phrasing as the
// quote-received email.
function QuotationDetails({ book }: { book: MyBook }) {
  const q = book.quotation;
  if (!q) return null;

  const details: string[] = [];
  if (q.book_size) details.push(q.book_size);
  if (q.pages) details.push(`${q.pages} pages`);
  if (q.words) details.push(`${q.words.toLocaleString()} words`);
  if (q.chapters) details.push(`${q.chapters} chapters`);
  if (q.copies) details.push(`${q.copies} copies`);

  return (
    <div className="mt-3">
      <p className="text-[0.56rem] font-black uppercase tracking-[0.12em] text-white/35">
        What you submitted
      </p>

      {details.length > 0 && (
        <p className="mt-1.5 text-[0.72rem] leading-relaxed text-white/75">
          {details.join(" · ")}
        </p>
      )}

      {q.selected_services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {q.selected_services.map((service) => (
            <span
              key={service.id}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.56rem] font-semibold text-white/65"
            >
              {service.label}
            </span>
          ))}
        </div>
      )}

      {q.selected_services.length > 0 &&
        (() => {
          // Once staff enter a print cost (or there was never a print
          // element to price in the first place), total_cost — which
          // folds in print_cost and any staff-added custom items, not
          // just the catalog services — is the real final number, not
          // just an estimate still missing pieces.
          const isFinal = q.print_cost !== null || !q.has_print_element;
          return (
            <p
              className="mt-2 text-[0.72rem] font-black"
              style={{ color: "rgb(var(--vp-accent-rgb))" }}
            >
              {isFinal
                ? `Total: ${naira(q.total_cost)}`
                : `Services total so far: ${naira(q.total_cost)}`}
            </p>
          );
        })()}

      {q.additional_notes && (
        <p className="mt-2 text-[0.68rem] italic leading-relaxed text-white/50">
          &ldquo;{q.additional_notes}&rdquo;
        </p>
      )}
    </div>
  );
}

interface BookDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onOrderReprint?: (book: MyBook) => void;
  onChangePrice?: (book: MyBook) => void;
  book: MyBook | null;
}

export default function BookDetailsModal({
  open,
  onClose,
  onOrderReprint,
  onChangePrice,
  book,
}: BookDetailsModalProps) {
  const { refetch } = useMyBooks();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [removingCover, setRemovingCover] = useState(false);

  // Fresh cover-edit state every time the modal closes, rather than
  // carrying over whatever was left from a previous book/session.
  useEffect(() => {
    if (open) return;
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingImageSrc(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!book) return null;

  // Still awaiting a real quote — no price has been set yet.
  const isAwaitingQuote = book.price === null && book.quotation !== null;

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets picking the same file again re-trigger onChange
    if (!file) return;
    setPendingImageSrc(URL.createObjectURL(file));
  };

  const closeCropModal = () => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
  };

  const handleCropSave = async (blob: Blob) => {
    try {
      await uploadBookCover(book.id, blob);
      await refetch();
      closeCropModal();
    } catch (err) {
      // apiFetch already fires an error snackbar for ApiError — only the
      // network-level case needs a fallback here.
      if (!(err instanceof ApiError)) {
        notify("Could not update the cover. Please try again.", "error");
      }
    }
  };

  const handleRemoveCover = async () => {
    setRemovingCover(true);
    try {
      await deleteBookCover(book.id);
      await refetch();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not remove the cover. Please try again.", "error");
      }
    } finally {
      setRemovingCover(false);
    }
  };

  return (
    <>
      <Modal open={open && pendingImageSrc === null} onClose={onClose}>
        {/* Cover on the left, details on the right — pricing/buttons stay
          full-width at the bottom regardless. */}
        <div className="flex gap-4">
          <div className="relative aspect-[3/4.4] w-40 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <BookCover book={book} sizes="160px" />

            {/* Edit always available; Remove only once a real cover exists
              — reverting to the generated placeholder isn't meaningful
              when that's already all there is. */}
            <div className="absolute right-1.5 top-1.5 z-10 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change book cover"
                className="flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-90"
                style={{ background: "rgb(var(--vp-accent-rgb))" }}
              >
                <Pencil size={11} strokeWidth={2.5} color="#171100" />
              </button>

              {book.cover && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  disabled={removingCover}
                  aria-label="Remove book cover"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-red-300 backdrop-blur-sm transition-colors hover:bg-red-500/80 hover:text-white disabled:opacity-50"
                >
                  <Trash2 size={11} strokeWidth={2.5} />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="hidden"
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
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.54rem] font-black uppercase tracking-[0.1em] ${MY_BOOK_STATUS_BADGE_CLASS[book.status]}`}
              >
                {MY_BOOK_STATUS_LABEL[book.status]}
              </span>

              {book.format && (
                <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[0.54rem] font-black uppercase tracking-[0.1em] text-white/60">
                  {book.format}
                </span>
              )}

              {book.pages !== null && (
                <span className="text-[0.54rem] font-black uppercase tracking-[0.1em] text-white/35">
                  {book.pages} pages
                </span>
              )}
            </div>

            {/* Right beside the cover, directly under the glowing PENDING
              badge — not a separate full-width block below the fold. */}
            {isAwaitingQuote && <QuotationDetails book={book} />}
          </div>
        </div>

        <div className="my-5 h-px bg-white/10" />

        {book.status === "published" ? (
          <>
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-white/35">
                Price
              </p>
              <p className="mt-1 text-3xl font-black text-white">
                {naira(book.price)}
              </p>
            </div>

            {/* Live now — Change Price/Order Reprint/WhatsApp follow-up
              are all superseded by the dedicated book page, which has
              its own price editor plus real Assets/Reprint/Public Link
              actions. */}
            <Button
              variant="primary"
              size="md"
              className="mt-6 w-full"
              onClick={() => {
                router.push(`/app/publish/book/${book.id}`);
                onClose();
              }}
            >
              View Details
              <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </>
        ) : isAwaitingQuote ? (
          <>
            <p className="text-[0.72rem] leading-relaxed text-white/40">
              {book.quotation?.has_print_element ? (
                <>
                  We&apos;re working on the print cost. You&apos;ll get a mail
                  soon once it&apos;s ready.
                </>
              ) : (
                <>This is your final cost (no print costs to add).</>
              )}
            </p>

            <a
              href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(book))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              style={{ background: "#25D366" }}
            >
              <WhatsAppIcon size={18} />
              Follow up on WhatsApp
            </a>
          </>
        ) : (
          <>
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
          </>
        )}
      </Modal>

      <BookCoverCropModal
        open={pendingImageSrc !== null}
        imageSrc={pendingImageSrc}
        onClose={closeCropModal}
        onSave={handleCropSave}
      />
    </>
  );
}
