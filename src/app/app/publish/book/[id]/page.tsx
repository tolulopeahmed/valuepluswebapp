"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookMarked,
  BookOpen,
  Calendar,
  Check,
  Download,
  ExternalLink,
  FileStack,
  FolderOpen,
  Layers,
  Pencil,
  Printer,
  Tag,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import GlassCard from "../../../GlassCard";
import SectionLabel from "../../../../../components/SectionLabel";
import Button from "../../../../../components/buttons/buttons";
import Modal from "../../../../../components/Modal";
import BookCoverCropModal from "../../../../../components/BookCoverCropModal";
import ReorderPrintsModal from "../../../../../components/ReorderPrintsModal";
import FormatBadge from "../../../../../components/FormatBadge";
import { notify } from "../../../../../lib/snackbar";
import { ApiError } from "../../../../../lib/api";
import {
  useMyBooks,
  naira,
  BookCover,
  uploadBookCover,
  deleteBookCover,
  updateBookPrice,
  updateBookDescription,
  updateBookEbook,
  fetchBookCoupon,
  saveBookCoupon,
  deleteBookCoupon,
  fetchBookFormatRequests,
  requestBookFormat,
  suggestedPrice,
  suggestedPriceFromPrintCost,
  type MyBook,
  type BookCoupon,
  type PhysicalFormat,
  type BookFormatRequestSummary,
} from "../../../../../hooks/useMyBooks";
import { useTransactions } from "../../../../../hooks/useWallet";

function StatTile({
  icon,
  label,
  value,
  valueColor,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  onClick?: () => void;
}) {
  const className =
    "flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition-transform active:scale-[0.97]";
  const style = {
    background: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
  };
  const content = (
    <>
      <div className="flex items-center gap-1 text-white/55">
        {icon}
        <p className="text-[0.56rem] font-black uppercase tracking-[0.1em] text-white/45">
          {label}
        </p>
      </div>
      <p
        className="text-[0.95rem] font-black"
        style={{ color: valueColor ?? "#ffffff" }}
      >
        {value}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

function ActionCard({
  icon,
  label,
  description,
  onClick,
  href,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-transform active:scale-[0.98]";
  const style = {
    background: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.1)",
  };

  const content = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.16)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.85rem] font-black text-white">{label}</p>
        <p className="truncate text-[0.66rem] text-white/40">{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} style={style}>
      {content}
    </button>
  );
}

// The closest thing to "what did I actually get" today — the cover
// file, plus whatever services the original quote's snapshot recorded.
// Manuscript/ISBN/other production files aren't modeled as downloadable
// assets anywhere yet, so this is honest about where those live instead
// of pretending a download link exists for them.
function AssetsModal({
  open,
  onClose,
  book,
}: {
  open: boolean;
  onClose: () => void;
  book: MyBook;
}) {
  const q = book.quotation;

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-1 text-[1.05rem] font-black text-white">Your Assets</h3>
      <p className="mb-4 text-[0.78rem] leading-relaxed text-white/45">
        Everything included with &ldquo;{book.title}&rdquo;.
      </p>

      <div
        className="flex items-center gap-3 rounded-2xl border p-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-white/15">
          <BookCover book={book} sizes="56px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.85rem] font-black text-white">
            Cover Image
          </p>
          {book.cover ? (
            <a
              href={book.cover}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.7rem] font-bold"
              style={{ color: "rgb(var(--vp-accent-rgb))" }}
            >
              Download →
            </a>
          ) : (
            <p className="text-[0.7rem] text-white/35">No cover uploaded yet</p>
          )}
        </div>
      </div>

      {q && q.selected_services.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[0.6rem] font-black uppercase tracking-[0.14em] text-white/35">
            Services included
          </p>
          <div className="flex flex-wrap gap-1.5">
            {q.selected_services.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.68rem] font-semibold text-white/70"
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {book.assets_link ? (
        <a
          href={book.assets_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-transform active:scale-[0.98]"
          style={{ background: "rgb(var(--vp-accent-rgb))", color: "#171100" }}
        >
          <FolderOpen size={16} strokeWidth={2} />
          Open in Google Drive
        </a>
      ) : (
        <div
          className="mt-4 rounded-2xl border px-4 py-3 text-center"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <p className="text-[0.78rem] font-bold text-white/70">
            Your assets aren&apos;t ready yet
          </p>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-white/40">
            Manuscript files, ISBN certificates, and other production files will
            be available here once publishing is complete.
          </p>
        </div>
      )}
    </Modal>
  );
}

const DESCRIPTION_WORD_LIMIT = 50;

function wordCount(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

// Edits the same `description` field staff can already set directly on
// the Book change form in Django admin (see BookDescriptionSerializer) —
// a modal rather than inline editing (like the price field gets) since
// this is a multi-line, paragraph-preserving blurb, not a single value.
function DescriptionModal({
  open,
  onClose,
  book,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  book: MyBook;
  onSaved: () => Promise<void>;
}) {
  const [value, setValue] = useState(book.description);
  const [saving, setSaving] = useState(false);
  const count = wordCount(value);
  const overLimit = count > DESCRIPTION_WORD_LIMIT;

  // Fresh value every time the modal closes, rather than carrying over
  // an abandoned edit into the next time it's opened — same pattern
  // BookDetailsModal.tsx uses for its own cover-edit state.
  useEffect(() => {
    if (open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(book.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSave = async () => {
    if (overLimit) return;
    setSaving(true);
    try {
      await updateBookDescription(book.id, value.trim());
      await onSaved();
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not update the description. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !saving && onClose()}>
      <h3 className="mb-1 text-[1.05rem] font-black text-white">Description</h3>
      <p className="mb-4 text-[0.78rem] leading-relaxed text-white/45">
        What readers see on &ldquo;{book.title}&rdquo;&apos;s public page. Up to{" "}
        {DESCRIPTION_WORD_LIMIT} words — paragraphs are fine.
      </p>

      <textarea
        autoFocus
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tell readers what this book is about…"
        className="w-full resize-none rounded-2xl border bg-white/5 px-3.5 py-3 text-[0.85rem] leading-relaxed text-white outline-none placeholder:text-white/25"
        style={{
          borderColor: overLimit
            ? "rgba(248,113,113,0.5)"
            : "rgba(255,255,255,0.1)",
        }}
      />
      <p
        className="mt-1.5 text-right text-[0.68rem] font-bold"
        style={{ color: overLimit ? "#F87171" : "rgba(255,255,255,0.35)" }}
      >
        {count} / {DESCRIPTION_WORD_LIMIT} words
      </p>

      <div className="mt-3 flex gap-2">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          loading={saving}
          disabled={overLimit}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

// Sets/edits the one active coupon for this book (see apps.books.views.
// BookCouponView — upsert, not a list) — code, percent/fixed discount,
// an optional expiry date, and an optional usage cap.
function CouponModal({
  open,
  onClose,
  book,
  coupon,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  book: MyBook;
  coupon: BookCoupon | null;
  onSaved: (coupon: BookCoupon) => void;
  onDeleted: () => void;
}) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(
    "percent",
  );
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fresh form state every time the modal opens, seeded from whatever
  // coupon currently exists (or blank defaults for a new one) — same
  // "reset on open/close" pattern as DescriptionModal above.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(coupon?.code ?? "");
    setDiscountType(coupon?.discount_type ?? "percent");
    setDiscountValue(coupon ? coupon.discount_value : "");
    setExpiresAt(coupon?.valid_until ? coupon.valid_until.slice(0, 10) : "");
    setMaxUses(
      coupon?.max_uses !== null && coupon?.max_uses !== undefined
        ? String(coupon.max_uses)
        : "",
    );
    setIsActive(coupon?.is_active ?? true);
  }, [open, coupon]);

  const handleSave = async () => {
    const value = Number(discountValue);
    if (!code.trim()) {
      notify("Enter a coupon code.", "error");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      notify("Enter a discount amount greater than 0.", "error");
      return;
    }
    setSaving(true);
    try {
      const result = await saveBookCoupon(book.id, {
        code: code.trim(),
        discount_type: discountType,
        discount_value: value,
        is_active: isActive,
        valid_until: expiresAt ? `${expiresAt}T23:59:59` : null,
        max_uses: maxUses.trim() ? Number(maxUses) : null,
      });
      onSaved(result);
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not save the coupon. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBookCoupon(book.id);
      onDeleted();
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not remove the coupon. Please try again.", "error");
      }
    } finally {
      setDeleting(false);
    }
  };

  const busy = saving || deleting;

  return (
    <Modal open={open} onClose={() => !busy && onClose()}>
      <h3 className="mb-1 text-[1.05rem] font-black text-white">Coupon</h3>
      <p className="mb-4 text-[0.78rem] leading-relaxed text-white/45">
        A discount code just for &ldquo;{book.title}&rdquo;.
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-[0.65rem] font-black uppercase tracking-wide text-white/45">
            Code
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUMMER20"
            className="w-full rounded-xl border bg-white/5 px-3.5 py-2.5 text-[0.9rem] font-bold uppercase tracking-wide text-white outline-none placeholder:text-white/25 placeholder:normal-case placeholder:font-normal"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          />
        </div>

        <div>
          <span className="mb-1 block text-[0.65rem] font-black uppercase tracking-wide text-white/45">
            Discount
          </span>
          <div className="flex gap-2">
            <div
              className="flex overflow-hidden rounded-xl border"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              {(["percent", "fixed"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDiscountType(t)}
                  className="px-3 py-2.5 text-[0.75rem] font-bold transition-colors"
                  style={{
                    background:
                      discountType === t
                        ? "rgb(var(--vp-accent-rgb))"
                        : "transparent",
                    color:
                      discountType === t ? "#171100" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {t === "percent" ? "%" : "₦"}
                </button>
              ))}
            </div>
            <div
              className="flex flex-1 items-center gap-1.5 rounded-xl border bg-white/5 px-3.5 py-2.5"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <input
                inputMode="decimal"
                value={discountValue}
                onChange={(e) =>
                  setDiscountValue(e.target.value.replace(/[^\d.]/g, ""))
                }
                placeholder="0"
                className="w-full bg-transparent text-[0.9rem] font-black text-white outline-none placeholder:text-white/25"
              />
              <span className="shrink-0 text-[0.7rem] text-white/35">
                {discountType === "percent" ? "% off" : "off"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-[0.65rem] font-black uppercase tracking-wide text-white/45">
              Expires
            </span>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-xl border bg-white/5 px-3 py-2.5 text-[0.8rem] font-semibold text-white outline-none"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                colorScheme: "dark",
              }}
            />
          </div>
          <div>
            <span className="mb-1 block text-[0.65rem] font-black uppercase tracking-wide text-white/45">
              Use limit
            </span>
            <input
              inputMode="numeric"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Unlimited"
              className="w-full rounded-xl border bg-white/5 px-3 py-2.5 text-[0.8rem] font-semibold text-white outline-none placeholder:text-white/25"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className="flex items-center justify-between rounded-xl border px-3.5 py-2.5"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <span className="text-[0.78rem] font-bold text-white/75">Active</span>
          <span
            className="flex h-5 w-9 items-center rounded-full px-0.5 transition-colors"
            style={{
              background: isActive
                ? "rgb(var(--vp-accent-rgb))"
                : "rgba(255,255,255,0.15)",
            }}
          >
            <span
              className="h-4 w-4 rounded-full bg-white transition-transform"
              style={{
                transform: isActive ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </span>
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          loading={saving}
          disabled={deleting}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button variant="secondary" size="md" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
      </div>

      {coupon && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="mt-3 w-full text-center text-[0.72rem] font-bold text-red-300/70 transition-colors hover:text-red-300 disabled:opacity-50"
        >
          {deleting ? "Removing…" : "Remove coupon"}
        </button>
      )}
    </Modal>
  );
}

// Same amount-color rule the Transactions page/home dashboard use
// (Transactions.tsx's amountColorFor): pending is always grey regardless
// of credit/debit (nothing's actually moved yet), failed is red, and
// otherwise credit is green / debit is the warm accent.
const EARNINGS_AMOUNT_COLOR: Record<"credit" | "debit", string> = {
  credit: "#34D399",
  debit: "#E0A458",
};

function amountColorFor(tx: { status: string; type: "credit" | "debit" }) {
  if (tx.status === "failed") return "#F87171";
  if (tx.status === "pending") return "rgba(255,255,255,0.55)";
  return EARNINGS_AMOUNT_COLOR[tx.type];
}

function formatTxDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Clicking "Earned" opens this rather than sending the author over to
// the general Transactions page — scoped to just this book's book_sale
// rows (real earnings from real sales), not every transaction that
// happens to reference the book (a quote_payment or reprint debit is
// money the author owes ValuePlus for production, not part of "how did
// I get to this earned number").
function EarningsModal({
  open,
  onClose,
  book,
}: {
  open: boolean;
  onClose: () => void;
  book: MyBook;
}) {
  const { transactions, loading } = useTransactions();
  const bookTransactions = transactions.filter(
    (tx) => tx.book_id === book.id && tx.source === "book_sale",
  );

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-1 text-[1.05rem] font-black text-white">
        Earnings History
      </h3>
      <p className="mb-4 text-[0.78rem] leading-relaxed text-white/45">
        Every transaction tied to &ldquo;{book.title}&rdquo;.
      </p>

      {loading ? (
        <p className="py-6 text-center text-[0.78rem] text-white/40">
          Loading…
        </p>
      ) : bookTransactions.length === 0 ? (
        <p className="py-6 text-center text-[0.78rem] text-white/40">
          No transactions for this book yet.
        </p>
      ) : (
        <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
          {bookTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8rem] font-bold text-white/85">
                  {tx.title}
                </p>
                <p className="mt-0.5 text-[0.66rem] text-white/40">
                  {formatTxDate(tx.created_at)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-[0.85rem] font-black"
                  style={{ color: amountColorFor(tx) }}
                >
                  {tx.type === "credit" ? "+" : "-"}
                  {naira(Number(tx.amount))}
                </p>
                <p className="mt-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white/35">
                  {tx.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// Sets/edits this book's Ebook edition — independent of any physical
// edition it has (the Sale Price card above). A Drive link is required
// alongside a price (enforced server-side too — see BookEbookSerializer)
// since that link is what actually gets handed to a buyer the moment
// they pay; there's no "priced but nothing to deliver" state possible.
function EbookModal({
  open,
  onClose,
  book,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  book: MyBook;
  onSaved: () => Promise<void>;
}) {
  const [priceInput, setPriceInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPriceInput(book.ebook_price ? String(Math.round(Number(book.ebook_price))) : "");
    setLinkInput(book.ebook_drive_link);
  }, [open, book.ebook_price, book.ebook_drive_link]);

  const handleSave = async () => {
    const value = Number(priceInput.replace(/,/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      notify("Enter a valid price.", "error");
      return;
    }
    if (!linkInput.trim()) {
      notify("Add the Google Drive link to the Ebook file.", "error");
      return;
    }
    setSaving(true);
    try {
      await updateBookEbook(book.id, value, linkInput.trim());
      await onSaved();
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not save the Ebook edition. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await updateBookEbook(book.id, null, "");
      await onSaved();
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not remove the Ebook edition. Please try again.", "error");
      }
    } finally {
      setRemoving(false);
    }
  };

  const busy = saving || removing;

  return (
    <Modal open={open} onClose={() => !busy && onClose()}>
      <h3 className="mb-1 text-[1.05rem] font-black text-white">Ebook Edition</h3>
      <p className="mb-4 text-[0.78rem] leading-relaxed text-white/45">
        Sell &ldquo;{book.title}&rdquo; as an Ebook too — buyers get this link the moment they
        pay, on their order page and by email.
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-[0.65rem] font-black uppercase tracking-wide text-white/45">
            Ebook price
          </span>
          <div
            className="flex items-center gap-2 rounded-xl border bg-white/5 px-3.5 py-2.5"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <span className="text-white/40">₦</span>
            <input
              autoFocus
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="0"
              className="w-full bg-transparent text-[1.05rem] font-black text-white outline-none placeholder:text-white/25"
            />
          </div>
        </div>

        <div>
          <span className="mb-1 block text-[0.65rem] font-black uppercase tracking-wide text-white/45">
            Google Drive link
          </span>
          <input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-xl border bg-white/5 px-3.5 py-2.5 text-[0.85rem] text-white outline-none placeholder:text-white/25"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          />
          <p className="mt-1.5 text-[0.66rem] leading-relaxed text-white/35">
            Set sharing to &ldquo;Anyone with the link&rdquo; so buyers can actually open it.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          loading={saving}
          disabled={removing}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button variant="secondary" size="md" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
      </div>

      {book.has_ebook && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          className="mt-3 w-full text-center text-[0.72rem] font-bold text-red-300/70 transition-colors hover:text-red-300 disabled:opacity-50"
        >
          {removing ? "Removing…" : "Remove Ebook edition"}
        </button>
      )}
    </Modal>
  );
}

// A physical edition (Paperback/Hardback) this book doesn't have yet is
// never just a price field — it's real one-off production cost that
// needs quoting first (see BookFormatRequest), so this card cycles
// through 4 states: no request yet ("Request Quote"), pending
// ("Quote requested…"), quoted-but-not-priced (shows the quoted cost,
// pencil now sets a sale price), and priced (the normal editable price
// card, same UX Ebook already has).
function PhysicalFormatCard({
  format,
  icon,
  price,
  formatRequest,
  editing,
  priceInput,
  saving,
  requesting,
  onStartEdit,
  onPriceInputChange,
  onSave,
  onCancelEdit,
  onRequestQuote,
  animationDelay,
}: {
  format: PhysicalFormat;
  icon: ReactNode;
  price: string | null;
  formatRequest: BookFormatRequestSummary | undefined;
  editing: boolean;
  priceInput: string;
  saving: boolean;
  requesting: boolean;
  onStartEdit: () => void;
  onPriceInputChange: (v: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onRequestQuote: () => void;
  animationDelay: string;
}) {
  const hasPrice = price !== null;
  const isQuoted = !hasPrice && formatRequest?.status === "quoted";
  const isPending = !hasPrice && formatRequest?.status === "pending";
  const canRequest = !hasPrice && !isPending && !isQuoted;
  const canEdit = hasPrice || isQuoted;

  return (
    <GlassCard accent className="vp-card-in p-3.5" style={{ animationDelay }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white/45">
          {icon}
          <SectionLabel style={{ marginBottom: -10, fontSize: 13 }}>{format}</SectionLabel>
        </div>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={onStartEdit}
            aria-label={`Edit ${format} price`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
            style={{
              background: "rgba(var(--vp-accent-rgb),0.16)",
              color: "rgb(var(--vp-accent-rgb))",
            }}
          >
            <Pencil size={12} strokeWidth={2.3} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <div
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border bg-white/5 px-2.5 py-2"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <span className="text-white/40">₦</span>
            <input
              autoFocus
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => onPriceInputChange(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="0"
              className="w-full min-w-0 bg-transparent text-[0.95rem] font-black text-white outline-none placeholder:text-white/25"
            />
          </div>
          <Button variant="primary" size="sm" loading={saving} onClick={onSave} className="!px-2.5">
            <Check size={14} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancelEdit}
            disabled={saving}
            className="!px-2.5"
          >
            <X size={14} />
          </Button>
        </div>
      ) : hasPrice ? (
        <p className="mt-1 text-2xl font-black leading-tight text-white">{naira(price)}</p>
      ) : isQuoted ? (
        <>
          <p
            className="mt-1 text-[0.95rem] font-black leading-tight"
            style={{ color: "rgb(var(--vp-accent-rgb))" }}
          >
            Quoted: {naira(formatRequest.print_cost)}
          </p>
          <p className="mt-1.5 text-[0.62rem] leading-relaxed text-white/40">
            Tap the pencil to set your sale price.
          </p>
        </>
      ) : isPending ? (
        <p className="mt-1.5 text-[0.7rem] leading-relaxed text-white/50">
          Quote requested — we&apos;ll email you once it&apos;s ready.
        </p>
      ) : (
        canRequest && (
          <button
            type="button"
            onClick={onRequestQuote}
            disabled={requesting}
            className="mt-2 text-[0.72rem] font-bold disabled:opacity-50"
            style={{ color: "rgb(var(--vp-accent-rgb))" }}
          >
            {requesting ? "Requesting…" : "Request Quote"}
          </button>
        )
      )}
    </GlassCard>
  );
}

function CenteredMessage({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 py-24 text-center">
      <p className="text-lg font-black text-white">{title}</p>
      <p className="max-w-xs text-[0.85rem] text-white/45">{subtitle}</p>
      <Button variant="primary" size="md" onClick={onBack} className="mt-2">
        Back to Publish
      </Button>
    </div>
  );
}

export default function BookLivePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { books, loading, refetch } = useMyBooks();
  const book = books.find((b) => b.id === id) ?? null;

  // Which physical edition's price is being edited right now, if any —
  // a single shared slot (not one per format) since only one card is
  // ever open for editing at a time, same UX as before this had a
  // second physical format to juggle.
  const [editingFormat, setEditingFormat] = useState<PhysicalFormat | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [requestingFormat, setRequestingFormat] = useState<PhysicalFormat | null>(null);
  const [formatRequests, setFormatRequests] = useState<BookFormatRequestSummary[]>([]);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coupon, setCoupon] = useState<BookCoupon | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [earningsOpen, setEarningsOpen] = useState(false);
  const [ebookOpen, setEbookOpen] = useState(false);

  // Not part of `book` (a separate resource — see BookCouponView), so it
  // needs its own fetch once the book id is known. Silently stays null
  // on failure — "no coupon" is the tile's own honest fallback state,
  // not worth a toast for what's a secondary bit of info on this page.
  useEffect(() => {
    if (!id) return;
    fetchBookCoupon(id)
      .then((data) => setCoupon("id" in data ? (data as BookCoupon) : null))
      .catch(() => {});
  }, [id]);

  // Same reasoning as the coupon fetch above — drives whether a physical
  // format shows "Request Quote", "Quote requested…", or "Quoted — set
  // your price" (see latestRequestFor below).
  useEffect(() => {
    if (!id) return;
    fetchBookFormatRequests(id)
      .then(setFormatRequests)
      .catch(() => {});
  }, [id]);

  if (loading && books.length === 0) {
    return (
      <div className="py-24 text-center text-[0.85rem] text-white/40">
        Loading your book…
      </div>
    );
  }

  if (!book) {
    return (
      <CenteredMessage
        title="Book not found"
        subtitle="This title doesn't exist, or isn't yours."
        onBack={() => router.push("/app/publish")}
      />
    );
  }

  if (book.status !== "published") {
    return (
      <CenteredMessage
        title="Not live yet"
        subtitle={`"${book.title}" hasn't been published yet — check back once it's live.`}
        onBack={() => router.push("/app/publish")}
      />
    );
  }

  // Most recent (non-)closed request for a format — "quoted" wins over
  // an older "closed" one for the same format if both exist, so a
  // second, more recent attempt always takes precedence for display.
  const latestRequestFor = (format: PhysicalFormat): BookFormatRequestSummary | undefined =>
    formatRequests
      .filter((r) => r.requested_format === format)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const priceFor = (format: PhysicalFormat): string | null =>
    format === "Paperback" ? book.paperback_price : book.hardback_price;

  // Paperback's suggestion comes from the book's original "Get a Quote"
  // print_cost; a Hardback added later has no such quote — its own
  // BookFormatRequest.print_cost (once staff have quoted it) is the
  // equivalent number to suggest 2.5x off instead.
  const suggestedFor = (format: PhysicalFormat): number | null =>
    format === "Paperback"
      ? suggestedPrice(book.quotation)
      : suggestedPriceFromPrintCost(latestRequestFor(format)?.print_cost ?? null);

  const handleStartEditPrice = (format: PhysicalFormat) => {
    const current = priceFor(format);
    const effective = current !== null ? Number(current) : suggestedFor(format);
    setPriceInput(effective !== null ? String(Math.round(effective)) : "");
    setEditingFormat(format);
  };

  const handleSavePrice = async () => {
    if (!editingFormat) return;
    const value = Number(priceInput.replace(/,/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      notify("Enter a valid price.", "error");
      return;
    }
    setSavingPrice(true);
    try {
      await updateBookPrice(book.id, editingFormat, value);
      await refetch();
      setEditingFormat(null);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not update the price. Please try again.", "error");
      }
    } finally {
      setSavingPrice(false);
    }
  };

  const handleRequestFormat = async (format: PhysicalFormat) => {
    setRequestingFormat(format);
    try {
      const result = await requestBookFormat(book.id, format);
      setFormatRequests((prev) => [...prev, result]);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not send the request. Please try again.", "error");
      }
    } finally {
      setRequestingFormat(null);
    }
  };

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
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

  const publicHref = `/book/${book.slug}`;

  return (
    <div className="mx-auto w-full max-w-4xl pb-10">
      {/* Hero — the celebratory "this book is live" moment: accent glow,
          cover with its own edit/remove affordance, LIVE badge, and the
          key facts, all in one premium card instead of a plain title bar. */}
      <div
        className="vp-card-in relative overflow-hidden rounded-[1.75rem] border p-6 md:p-8"
        style={{
          borderColor: "rgba(var(--vp-accent-rgb),0.25)",
          background:
            "radial-gradient(120% 100% at 50% -12%, rgba(var(--vp-accent-rgb),0.24), transparent 60%), linear-gradient(180deg, #1B2340 0%, #10152A 100%)",
        }}
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative aspect-[3/4.4] w-36 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:w-40">
            <BookCover book={book} sizes="160px" />

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

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] ${
                book.has_paperback || book.has_hardback || book.has_ebook
                  ? "vp-badge-glow-green"
                  : ""
              }`}
              style={{
                background: "#123524",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.5)",
              }}
            >
              <BadgeCheck size={12} strokeWidth={2.5} />
              Live
            </span>

            <p
              className="mt-2.5 text-[0.68rem] font-black uppercase tracking-[0.14em]"
              style={{ color: "rgb(var(--vp-accent-rgb))" }}
            >
              {book.category}
            </p>

            <h1 className="mt-1 text-2xl font-black leading-tight text-white md:text-3xl">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="mt-1 text-[0.82rem] text-white/55">
                {book.subtitle}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              {book.has_paperback && <FormatBadge format="Paperback" />}
              {book.has_hardback && <FormatBadge format="Hardback" />}
              {book.has_ebook && <FormatBadge format="Ebook" />}
              {book.pages !== null && (
                <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold text-white/40">
                  <Layers size={11} />
                  {book.pages} pages
                </span>
              )}
              {book.date_published && (
                <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold text-white/40">
                  <Calendar size={11} />
                  {new Date(book.date_published).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {book.description ? (
              <button
                type="button"
                onClick={() => setDescriptionOpen(true)}
                className="mt-3 flex w-full items-start gap-2 rounded-xl text-left transition-opacity hover:opacity-80 sm:text-left"
              >
                <p className="min-w-0 flex-1 whitespace-pre-line text-[0.78rem] leading-relaxed text-white/55">
                  {book.description}
                </p>
                <Pencil
                  size={12}
                  strokeWidth={2.3}
                  className="mt-0.5 shrink-0 text-white/35"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDescriptionOpen(true)}
                className="mt-3 flex items-center gap-1.5 text-[0.72rem] font-bold text-white/35 transition-colors hover:text-white/55"
              >
                <Pencil size={12} strokeWidth={2.3} />
                Add a description
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Paperback + Hardback + Ebook — three independent editions, each
          its own card in one row, so an author can price/quote/publish
          any subset of the three without the others blocking it. */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <PhysicalFormatCard
          format="Paperback"
          icon={<BookOpen size={13} strokeWidth={2.2} />}
          price={priceFor("Paperback")}
          formatRequest={latestRequestFor("Paperback")}
          editing={editingFormat === "Paperback"}
          priceInput={priceInput}
          saving={savingPrice}
          requesting={requestingFormat === "Paperback"}
          onStartEdit={() => handleStartEditPrice("Paperback")}
          onPriceInputChange={setPriceInput}
          onSave={handleSavePrice}
          onCancelEdit={() => setEditingFormat(null)}
          onRequestQuote={() => handleRequestFormat("Paperback")}
          animationDelay="60ms"
        />

        <PhysicalFormatCard
          format="Hardback"
          icon={<BookMarked size={13} strokeWidth={2.2} />}
          price={priceFor("Hardback")}
          formatRequest={latestRequestFor("Hardback")}
          editing={editingFormat === "Hardback"}
          priceInput={priceInput}
          saving={savingPrice}
          requesting={requestingFormat === "Hardback"}
          onStartEdit={() => handleStartEditPrice("Hardback")}
          onPriceInputChange={setPriceInput}
          onSave={handleSavePrice}
          onCancelEdit={() => setEditingFormat(null)}
          onRequestQuote={() => handleRequestFormat("Hardback")}
          animationDelay="65ms"
        />

        {/* Ebook — independent of the physical editions beside it. Can be
            added regardless of whether either physical edition is set up. */}
        <GlassCard accent className="vp-card-in p-3.5" style={{ animationDelay: "70ms" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/45">
              <Download size={13} strokeWidth={2.2} />
              <SectionLabel style={{ marginBottom: -10, fontSize: 13 }}>
                Ebook
              </SectionLabel>
            </div>
            <button
              type="button"
              onClick={() => setEbookOpen(true)}
              aria-label={book.has_ebook ? "Edit Ebook edition" : "Set up Ebook edition"}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
              style={{
                background: "rgba(var(--vp-accent-rgb),0.16)",
                color: "rgb(var(--vp-accent-rgb))",
              }}
            >
              <Pencil size={12} strokeWidth={2.3} />
            </button>
          </div>

          {book.has_ebook ? (
            <p className="mt-1 text-2xl font-black leading-tight text-white">
              {naira(Number(book.ebook_price))}
            </p>
          ) : (
            <p className="mt-1.5 text-[0.62rem] leading-relaxed text-white/40">
              Not set up yet — tap the pencil to add one.
            </p>
          )}
        </GlassCard>
      </div>

      {/* Stats */}
      <div
        className="vp-card-in mt-5 grid grid-cols-3 gap-3"
        style={{ animationDelay: "100ms" }}
      >
        <StatTile
          icon={<TrendingUp size={12} strokeWidth={2} />}
          label="Sales"
          value={String(book.sales)}
        />
        <StatTile
          icon={<Wallet size={12} strokeWidth={2} />}
          label="Earned"
          value={naira(book.earned)}
          valueColor="#34D399"
          onClick={() => setEarningsOpen(true)}
        />
        <StatTile
          icon={<Tag size={12} strokeWidth={2} />}
          label="Coupon"
          value={coupon ? coupon.code : "None"}
          onClick={() => setCouponOpen(true)}
        />
      </div>

      {/* Actions */}
      <div
        className="vp-card-in mt-5 grid gap-3 sm:grid-cols-3"
        style={{ animationDelay: "140ms" }}
      >
        <ActionCard
          icon={<FileStack size={18} strokeWidth={1.9} />}
          label="View Assets"
          description="What's included"
          onClick={() => setAssetsOpen(true)}
        />
        <ActionCard
          icon={<Printer size={18} strokeWidth={1.9} />}
          label="Reorder Prints"
          description="Order more copies"
          onClick={() => setReorderOpen(true)}
        />
        <ActionCard
          icon={<ExternalLink size={18} strokeWidth={1.9} />}
          label="View Public Link"
          description="See it live, like on Amazon"
          href={publicHref}
        />
      </div>

      <AssetsModal
        open={assetsOpen}
        onClose={() => setAssetsOpen(false)}
        book={book}
      />

      <DescriptionModal
        open={descriptionOpen}
        onClose={() => setDescriptionOpen(false)}
        book={book}
        onSaved={refetch}
      />

      <CouponModal
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        book={book}
        coupon={coupon}
        onSaved={setCoupon}
        onDeleted={() => setCoupon(null)}
      />

      <EbookModal
        open={ebookOpen}
        onClose={() => setEbookOpen(false)}
        book={book}
        onSaved={refetch}
      />

      <EarningsModal
        open={earningsOpen}
        onClose={() => setEarningsOpen(false)}
        book={book}
      />

      <ReorderPrintsModal
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        book={book}
      />

      <BookCoverCropModal
        open={pendingImageSrc !== null}
        imageSrc={pendingImageSrc}
        onClose={closeCropModal}
        onSave={handleCropSave}
      />
    </div>
  );
}
