"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Calendar,
  Check,
  ExternalLink,
  FileStack,
  FolderOpen,
  Layers,
  Pencil,
  Printer,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import GlassCard from "../../../GlassCard";
import SectionLabel from "../../../../../components/SectionLabel";
import Button from "../../../../../components/buttons/buttons";
import Modal from "../../../../../components/Modal";
import BookCoverCropModal from "../../../../../components/BookCoverCropModal";
import ReorderPrintsModal from "../../../../../components/ReorderPrintsModal";
import { notify } from "../../../../../lib/snackbar";
import { ApiError } from "../../../../../lib/api";
import {
  useMyBooks,
  naira,
  BookCover,
  uploadBookCover,
  deleteBookCover,
  updateBookPrice,
  suggestedPrice,
  type MyBook,
} from "../../../../../hooks/useMyBooks";

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center"
      style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <span className="text-white/55">{icon}</span>
      <p className="text-[0.56rem] font-black uppercase tracking-[0.1em] text-white/45">
        {label}
      </p>
      <p className="text-[0.95rem] font-black text-white">{value}</p>
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
  const style = { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" };

  const content = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "rgba(var(--vp-accent-rgb),0.16)", color: "rgb(var(--vp-accent-rgb))" }}
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
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
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
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-white/15">
          <BookCover book={book} sizes="56px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.85rem] font-black text-white">Cover Image</p>
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
          style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
        >
          <p className="text-[0.78rem] font-bold text-white/70">
            Your assets aren&apos;t ready yet
          </p>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-white/40">
            Manuscript files, ISBN certificates, and other production files will be available
            here once publishing is complete.
          </p>
        </div>
      )}
    </Modal>
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

  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading && books.length === 0) {
    return (
      <div className="py-24 text-center text-[0.85rem] text-white/40">Loading your book…</div>
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

  const suggested = suggestedPrice(book.quotation);
  const currentPrice = book.price !== null ? Number(book.price) : null;
  const effectivePrice = currentPrice ?? suggested;

  const handleStartEditPrice = () => {
    setPriceInput(effectivePrice !== null ? String(Math.round(effectivePrice)) : "");
    setEditingPrice(true);
  };

  const handleSavePrice = async () => {
    const value = Number(priceInput.replace(/,/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      notify("Enter a valid price.", "error");
      return;
    }
    setSavingPrice(true);
    try {
      await updateBookPrice(book.id, value);
      await refetch();
      setEditingPrice(false);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not update the price. Please try again.", "error");
      }
    } finally {
      setSavingPrice(false);
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
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em]"
              style={{ background: "#123524", color: "#4ade80", border: "1px solid rgba(74,222,128,0.5)" }}
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
              <p className="mt-1 text-[0.82rem] text-white/55">{book.subtitle}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              {book.format && (
                <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] text-white/60">
                  {book.format}
                </span>
              )}
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
          </div>
        </div>
      </div>

      {/* Price */}
      <GlassCard accent className="vp-card-in mt-5 p-5" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between">
          <SectionLabel style={{ marginBottom: 0 }}>Sale Price</SectionLabel>
          {!editingPrice && (
            <button
              type="button"
              onClick={handleStartEditPrice}
              aria-label="Edit price"
              className="flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-90"
              style={{ background: "rgba(var(--vp-accent-rgb),0.16)", color: "rgb(var(--vp-accent-rgb))" }}
            >
              <Pencil size={13} strokeWidth={2.3} />
            </button>
          )}
        </div>

        {editingPrice ? (
          <div className="mt-3 flex items-center gap-2">
            <div
              className="flex flex-1 items-center gap-2 rounded-xl border bg-white/5 px-3.5 py-2.5"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <span className="text-white/40">₦</span>
              <input
                autoFocus
                inputMode="numeric"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="0"
                className="w-full bg-transparent text-[1.1rem] font-black text-white outline-none placeholder:text-white/25"
              />
            </div>
            <Button variant="primary" size="md" loading={savingPrice} onClick={handleSavePrice}>
              <Check size={16} />
            </Button>
            <Button variant="secondary" size="md" onClick={() => setEditingPrice(false)} disabled={savingPrice}>
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-4xl font-black text-white">
              {effectivePrice !== null ? naira(effectivePrice) : "—"}
            </p>
            {currentPrice === null && suggested !== null && (
              <p className="mt-1.5 text-[0.7rem] leading-relaxed text-white/40">
                Suggested default — 2.5× the print cost. Tap the pencil to confirm or change it.
              </p>
            )}
            {currentPrice === null && suggested === null && (
              <p className="mt-1.5 text-[0.7rem] leading-relaxed text-white/40">
                No price set yet — tap the pencil to add one.
              </p>
            )}
          </>
        )}
      </GlassCard>

      {/* Stats */}
      <div className="vp-card-in mt-5 grid grid-cols-3 gap-3" style={{ animationDelay: "100ms" }}>
        <StatTile icon={<TrendingUp size={16} strokeWidth={1.8} />} label="Sales" value={String(book.sales)} />
        <StatTile icon={<Wallet size={16} strokeWidth={1.8} />} label="Earned" value={naira(book.earned)} />
        <StatTile
          icon={<Layers size={16} strokeWidth={1.8} />}
          label="Pages"
          value={book.pages !== null ? String(book.pages) : "—"}
        />
      </div>

      {/* Actions */}
      <div className="vp-card-in mt-5 grid gap-3 sm:grid-cols-3" style={{ animationDelay: "140ms" }}>
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

      <AssetsModal open={assetsOpen} onClose={() => setAssetsOpen(false)} book={book} />

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
