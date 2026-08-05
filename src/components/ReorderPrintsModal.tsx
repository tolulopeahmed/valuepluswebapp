"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import { notify } from "../lib/snackbar";
import { ApiError } from "../lib/api";
import { requestReprint, type MyBook, type PhysicalFormat } from "../hooks/useMyBooks";

// Same admin line used everywhere else (Transactions.tsx, Sidebar.tsx,
// Settings.tsx, book/[id]/page.tsx's own WhatsApp reorder link).
const ADMIN_WHATSAPP_NUMBER = "2349024312689";

type PaperType = "cream" | "white";

function defaultPaperType(book: MyBook): PaperType {
  const ids = book.quotation?.selected_services.map((s) => s.id) ?? [];
  if (ids.includes("white")) return "white";
  return "cream";
}

// Paperback wins as the default when a book sells both — same "primary
// edition" convention used everywhere else (see useMyBooks.tsx's
// displayPrice) — but only ever one this book actually has a physical
// edition for (see BookFormatRequestView for how a NEW edition gets
// added; this modal is only ever for reordering more of one that
// already exists).
function defaultFormat(book: MyBook): PhysicalFormat {
  return book.has_paperback ? "Paperback" : "Hardback";
}

function ToggleOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-xl border px-3 py-2.5 text-[0.82rem] font-bold transition-colors"
      style={{
        borderColor: active ? "rgb(var(--vp-accent-rgb))" : "rgba(255,255,255,0.12)",
        background: active ? "rgba(var(--vp-accent-rgb),0.14)" : "rgba(255,255,255,0.04)",
        color: active ? "rgb(var(--vp-accent-rgb))" : "rgba(255,255,255,0.6)",
      }}
    >
      {label}
    </button>
  );
}

export default function ReorderPrintsModal({
  open,
  onClose,
  book,
}: {
  open: boolean;
  onClose: () => void;
  book: MyBook;
}) {
  const [view, setView] = useState<"form" | "success">("form");
  const [format, setFormat] = useState<PhysicalFormat>(() => defaultFormat(book));
  const [copies, setCopies] = useState("");
  const [paperType, setPaperType] = useState<PaperType>(() => defaultPaperType(book));
  // Nylon seals default to on regardless of what the original quote
  // ordered — product decision, not a mirror of the original selection
  // (unlike paperType above).
  const [nylonSeals, setNylonSeals] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const copiesValue = Number(copies.replace(/,/g, "")) || 0;

  const reset = () => {
    setView("form");
    setFormat(defaultFormat(book));
    setCopies("");
    setPaperType(defaultPaperType(book));
    setNylonSeals(true);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (copiesValue <= 0) {
      notify("Enter how many copies you'd like to reorder.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await requestReprint(book.id, { format, copies: copiesValue, paperType, nylonSeals });
      setView("success");
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not send your request. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const followUpMessage = `Hi ValuePlus! I'd like to reorder ${copiesValue || "some"} ${format} ${
    copiesValue === 1 ? "copy" : "copies"
  } of "${book.title}" — ${paperType === "cream" ? "Cream Paper" : "White Paper"}, ${
    nylonSeals ? "with" : "without"
  } Nylon Seals. Please let me know the next steps. Thank you!`;
  const followUpHref = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(followUpMessage)}`;

  return (
    <Modal open={open} onClose={handleClose}>
      {view === "success" ? (
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(74,222,128,0.28)] bg-[rgba(74,222,128,0.12)] text-[#4ade80]">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>

          <h3 className="mb-2 text-[1.05rem] font-black text-white">Request received!</h3>
          <p className="mb-6 max-w-[20rem] text-[0.82rem] leading-relaxed text-white/50">
            You&apos;ll get a quote by email soon.
          </p>

          <Button variant="primary" size="md" className="w-full" onClick={handleClose}>
            OK
          </Button>
          <a
            href={followUpHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full rounded-2xl border py-3 text-center text-sm font-bold transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
          >
            Follow Up on WhatsApp
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-[1.05rem] font-black text-white">Reorder Prints</h3>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-white/50">
              Enter how many copies you&apos;re reordering — we&apos;ll send you a full quote by
              email soon.
            </p>
          </div>

          {/* Only shown when there's actually a choice to make — a book
              selling just one physical format has nothing to pick
              between, so the toggle would just be redundant chrome. */}
          {book.has_paperback && book.has_hardback && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
                Format
              </span>
              <div className="flex gap-2">
                <ToggleOption
                  label="Paperback"
                  active={format === "Paperback"}
                  onClick={() => setFormat("Paperback")}
                />
                <ToggleOption
                  label="Hardback"
                  active={format === "Hardback"}
                  onClick={() => setFormat("Hardback")}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
              Copies
            </span>
            <input
              inputMode="numeric"
              value={copies}
              onChange={(e) =>
                setCopies(e.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="0"
              className="w-full rounded-xl border bg-white/5 px-3.5 py-3 text-[1.05rem] font-bold text-white outline-none placeholder:text-white/25"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
              Paper Type
            </span>
            <div className="flex gap-2">
              <ToggleOption
                label="Cream Paper"
                active={paperType === "cream"}
                onClick={() => setPaperType("cream")}
              />
              <ToggleOption
                label="White Paper"
                active={paperType === "white"}
                onClick={() => setPaperType("white")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
              Nylon Seals
            </span>
            <div className="flex gap-2">
              <ToggleOption label="Yes" active={nylonSeals} onClick={() => setNylonSeals(true)} />
              <ToggleOption label="No" active={!nylonSeals} onClick={() => setNylonSeals(false)} />
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleSubmit}
            disabled={copiesValue <= 0 || submitting}
          >
            {submitting ? "Sending…" : "Send Me The Invoice"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
