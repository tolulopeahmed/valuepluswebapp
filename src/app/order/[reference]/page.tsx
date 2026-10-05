"use client";

// Paystack's callback_url (see CheckoutInitiateView) lands here after the
// buyer pays. The webhook usually beats this page to actually marking
// the order paid, but OrderStatusView falls back to verifying with
// Paystack directly if it hasn't yet — so this polls briefly rather
// than trusting a single fetch.

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2, Clock, Copy, Download, BookOpen, XCircle, LogIn, MailCheck, ShieldCheck } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import BackButton from "@/components/storefront/BackButton";
import Button from "@/components/buttons/buttons";
import { apiFetch, ApiError, getTokens } from "@/lib/api";
import { clearCart } from "@/lib/cart";
import { notify } from "@/lib/snackbar";
import { openValuePlusApp } from "@/lib/openApp";

// Mirrors apps.storefront.services.ebook_item_access server-side. Access
// links only ever come back for the signed-in account that owns the
// purchase — the order reference in this page's URL isn't enough on its
// own, so every other state explains what the visitor needs to do.
type EbookAccess =
  | {
      state: "ready";
      book_id: string;
      token: string;
      can_download: boolean;
      can_read_in_app: boolean;
      // "offer": author allows PDFs, so "Get PDF" is shown upfront.
      // "request": author turned downloads off — "Request PDF from
      // author" still self-serves the same watermarked copy by email.
      pdf_access: "offer" | "request" | null;
      copy_id: string;
    }
  | { state: "legacy_link"; drive_link: string }
  | { state: "login_required" | "claim_required" | "other_account" | "preparing" | "revoked" };

interface OrderItem {
  book_title: string;
  quantity: number;
  format: string;
  line_total: string;
  book_cover: string | null;
  ebook_access: EbookAccess | null;
}

interface OrderStatus {
  paystack_reference: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  subtotal: string;
  discount_amount: string;
  total: string;
  items: OrderItem[];
  distributor_links: { book_title: string; code: string; commission_percentage: string; url: string }[];
}

function naira(value: number) {
  return `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Sent with the visitor's session when there is one — that's what
// unlocks their ebook links (see EbookAccess above). A signed-out
// visitor still sees the order itself.
function fetchStatus(reference: string) {
  return apiFetch<OrderStatus>(`/storefront/orders/${reference}/status/`, {
    skipAuth: !getTokens().access,
  });
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 8;

export default function OrderStatusPage() {
  const { reference } = useParams() as { reference: string };
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const data = await fetchStatus(reference);
        if (cancelled) return;
        setOrder(data);
        if (data.status === "paid") clearCart();
      } catch {
        // Keep polling — a transient failure shouldn't freeze the page
        // on a permanent "checking" state.
      }
    };

    check();
    const interval = setInterval(() => {
      setPollCount((c) => c + 1);
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [reference]);

  useEffect(() => {
    if (pollCount === 0 || pollCount > MAX_POLLS || order?.status !== "pending") return;
    fetchStatus(reference)
      .then((data) => {
        setOrder(data);
        if (data.status === "paid") clearCart();
      })
      .catch(() => {});
  }, [pollCount, order?.status, reference]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-vp-ink text-white">
      <div className="noise-layer" />
      <Navbar />

      <div className="mx-auto max-w-xl px-4 pb-24 pt-28 md:pt-32">
        <BackButton href="/" label="Back to ValuePlus" className="mb-4" />

        {!order || order.status === "pending" ? (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-[#14181f]">
            <Clock size={32} className="mx-auto mb-3 animate-pulse text-black/30" />
            <p className="font-bold">Confirming your payment…</p>
            <p className="mt-1 text-sm text-black/45">This usually only takes a few seconds.</p>
          </div>
        ) : order.status === "paid" ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-[#14181f]">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#16a34a]/10">
                <CheckCircle2 size={30} className="text-[#16a34a]" />
              </div>
              <p className="text-xl font-black">Order confirmed</p>
              <p className="mt-1.5 text-sm text-black/45">
                #{order.paystack_reference.slice(0, 8).toUpperCase()} · {naira(Number(order.total))}
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 text-[#14181f]">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-black/40">Your order</p>
              <div className="flex flex-col gap-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-black/5">
                      {item.book_cover && (
                        <Image src={item.book_cover} alt="" width={44} height={56} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.book_title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {item.format && <FormatBadge format={item.format} />}
                        {item.quantity > 1 && <span className="text-xs text-black/40">× {item.quantity}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold">{naira(Number(item.line_total))}</span>
                  </div>
                ))}
              </div>

              <EbookAccessSection
                order={order}
                reference={reference}
                onRefresh={async () => setOrder(await fetchStatus(reference))}
              />
            </div>

            {order.distributor_links.length > 0 && (
              <div className="rounded-2xl border border-[#EFC700]/40 bg-[#EFC700]/[0.08] p-5 text-[#14181f]">
                <p className="text-sm font-black">You&apos;re now a distributor 🎉</p>
                <p className="mt-1 text-xs leading-relaxed text-black/55">
                  Share your link — you&apos;ll earn the percentage below of the author&apos;s net share on every sale through it.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {order.distributor_links.map((affiliate) => (
                    <div key={affiliate.code} className="rounded-xl border border-black/10 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold">{affiliate.book_title}</p>
                        <span className="shrink-0 rounded-full bg-[#171100] px-2 py-0.5 text-[0.65rem] font-black text-[#EFC700]">
                          {affiliate.commission_percentage}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="min-w-0 flex-1 truncate rounded-lg bg-black/[0.05] px-2.5 py-2 text-xs font-semibold">
                          {affiliate.url}
                        </code>
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(affiliate.url).then(() => {
                              setCopiedCode(affiliate.code);
                              notify("Link copied!", "success");
                              setTimeout(() => setCopiedCode((c) => (c === affiliate.code ? null : c)), 1800);
                            })
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-colors"
                          style={{ background: copiedCode === affiliate.code ? "#16a34a" : "#171100" }}
                          aria-label="Copy link"
                        >
                          {copiedCode === affiliate.code ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-black/10 bg-white p-5 text-center">
              <p className="text-xs leading-relaxed text-black/40">
                A receipt has been emailed to you
                {order.items.some((item) => item.ebook_access)
                  ? " with your ebook access link"
                  : ""}
                . Physical copies ship to the address you provided.
              </p>
              <Link href="/" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">
                Back to ValuePlus
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-[#14181f]">
            <XCircle size={32} className="mx-auto mb-3 text-red-500" />
            <p className="font-bold">Payment {order.status}</p>
            <p className="mt-1 text-sm text-black/45">
              Your cart wasn&apos;t charged. You can try again from your cart.
            </p>
            <Button href="/cart" variant="primary" size="md" className="mt-5">
              Back to Cart
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

// .btn-secondary is white-text-on-dark-glass, tuned for the app shell's
// dark background — invisible (blank white pill) on this page's white
// card, so it's overridden to the card's own light/dark-ink look.
const LIGHT_SECONDARY = "w-full border! border-black/15! bg-white! text-[#14181f]! shadow-none!";

function StatePanel({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-black/[0.03] p-4 text-center">
      <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-black/[0.06] text-black/60">
        {icon}
      </div>
      <p className="text-sm font-bold">{title}</p>
      {children}
    </div>
  );
}

type PdfRequest = { status: "idle" | "sending" | "sent" | "limited"; message?: string };

function EbookAccessSection({
  order,
  reference,
  onRefresh,
}: {
  order: OrderStatus;
  reference: string;
  onRefresh: () => Promise<void>;
}) {
  const [pdfRequests, setPdfRequests] = useState<Record<string, PdfRequest>>({});
  const [claiming, setClaiming] = useState(false);

  const ebookItems = order.items.filter((item) => item.ebook_access);
  if (ebookItems.length === 0) return null;
  const states = new Set(ebookItems.map((item) => item.ebook_access!.state));
  const next = encodeURIComponent(`/order/${reference}`);

  const requestPdf = async (bookId: string) => {
    setPdfRequests((prev) => ({ ...prev, [bookId]: { status: "sending" } }));
    try {
      const result = await apiFetch<{ sent_to: string }>(`/storefront/library/books/${bookId}/pdf/`, {
        method: "POST",
      });
      setPdfRequests((prev) => ({ ...prev, [bookId]: { status: "sent", message: result.sent_to } }));
    } catch (err) {
      const limited = err instanceof ApiError && err.status === 429;
      setPdfRequests((prev) => ({
        ...prev,
        [bookId]: limited ? { status: "limited", message: err.message } : { status: "idle" },
      }));
    }
  };

  const claimOrder = async () => {
    setClaiming(true);
    try {
      const { claimed } = await apiFetch<{ claimed: number }>("/storefront/library/claim/", {
        method: "POST",
        body: JSON.stringify({ order_reference: reference }),
      });
      if (claimed === 0) notify("This purchase is already linked to another account.", "error");
      await onRefresh();
    } catch {
      // apiFetch already surfaced the error.
    } finally {
      setClaiming(false);
    }
  };

  // Signed out: one panel for the whole order, not one per book.
  if (states.has("login_required")) {
    return (
      <div className="mt-4 border-t border-black/5 pt-4">
        <StatePanel icon={<LogIn size={17} strokeWidth={2.25} />} title="Sign in to access your ebook">
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-black/50">
            Your book opens only for the account that bought it. Sign in or create a free
            account with the email you used at checkout.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button href={`/login?next=${next}`} variant="primary" size="md" className="w-full">
              Sign in
            </Button>
            <Button href={`/login?mode=signup&next=${next}`} variant="secondary" size="md" className={LIGHT_SECONDARY}>
              Create free account
            </Button>
          </div>
        </StatePanel>
        <p className="mt-2 text-center text-[0.7rem] text-black/35">
          Your receipt email also has your access links.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-black/5 pt-4">
      {states.has("claim_required") && (
        <StatePanel icon={<LogIn size={17} strokeWidth={2.25} />} title="Bought with a different email?">
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-black/50">
            This order was placed with another email address. Add it to the account you&apos;re
            signed in with to read it.
          </p>
          <Button variant="primary" size="md" className="mt-4 w-full" loading={claiming} onClick={claimOrder}>
            Add to my account
          </Button>
        </StatePanel>
      )}
      {states.has("other_account") && (
        <StatePanel icon={<LogIn size={17} strokeWidth={2.25} />} title="Signed in to a different account">
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-black/50">
            This purchase belongs to another ValuePlus account. Sign in with the account you
            bought it with.
          </p>
        </StatePanel>
      )}

      {ebookItems.map((item, i) => {
        const access = item.ebook_access!;
        const heading =
          ebookItems.length > 1 ? (
            <p className="text-xs font-bold text-black/50">&ldquo;{item.book_title}&rdquo;</p>
          ) : null;

        if (access.state === "legacy_link") {
          return (
            <div key={i} className="flex flex-col gap-2">
              {heading}
              <Button href={access.drive_link} variant="primary" size="md" className="w-full">
                <span className="inline-flex items-center gap-2">
                  <Download size={16} strokeWidth={2.25} />
                  Access &ldquo;{item.book_title}&rdquo;
                </span>
              </Button>
            </div>
          );
        }
        if (access.state === "preparing" || access.state === "revoked") {
          return (
            <div key={i} className="flex flex-col gap-2">
              {heading}
              <p className="rounded-xl bg-black/[0.03] px-3 py-2.5 text-center text-xs text-black/50">
                {access.state === "preparing"
                  ? "Your ebook is being prepared — we'll email you as soon as it's ready."
                  : "Access to this book ended because the order was refunded."}
              </p>
            </div>
          );
        }
        if (access.state !== "ready") return null;

        const pdf = pdfRequests[access.book_id] ?? { status: "idle" };
        const pdfButtonLabel = pdf.status === "sent" ? "PDF sent" : access.pdf_access === "offer" ? "Get PDF" : "Request PDF from author";

        return (
          <div key={i} className="flex flex-col gap-2">
            {heading}
            {access.can_read_in_app && (
              <Button variant="primary" size="md" className="w-full" onClick={openValuePlusApp}>
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={16} strokeWidth={2.25} />
                  Read in ValuePlus App
                </span>
              </Button>
            )}
            {access.pdf_access === "offer" ? (
              <Button
                variant={access.can_read_in_app ? "secondary" : "primary"}
                size="md"
                className={access.can_read_in_app ? LIGHT_SECONDARY : "w-full"}
                loading={pdf.status === "sending"}
                disabled={pdf.status === "sent" || pdf.status === "limited"}
                onClick={() => requestPdf(access.book_id)}
              >
                <span className="inline-flex items-center gap-2">
                  {pdf.status === "sent" ? <MailCheck size={16} strokeWidth={2.25} /> : <Download size={16} strokeWidth={2.25} />}
                  {pdfButtonLabel}
                </span>
              </Button>
            ) : access.pdf_access === "request" && pdf.status !== "sent" ? (
              <button
                type="button"
                onClick={() => requestPdf(access.book_id)}
                disabled={pdf.status === "sending" || pdf.status === "limited"}
                className="mx-auto text-xs font-bold text-black/55 underline underline-offset-4 transition-colors hover:text-black disabled:opacity-50"
              >
                {pdf.status === "sending" ? "Preparing your copy…" : "Request PDF from author"}
              </button>
            ) : null}
            {pdf.status === "sent" && (
              <p className="text-center text-xs text-[#16a34a]">
                Sent to {pdf.message} — check your inbox.
              </p>
            )}
            {pdf.status === "limited" && (
              <p className="text-center text-xs text-black/50">{pdf.message}</p>
            )}
            <p className="inline-flex items-center justify-center gap-1.5 text-center text-[0.68rem] text-black/35">
              <ShieldCheck size={12} strokeWidth={2.25} />
              Personalised to you · Copy {access.copy_id}
            </p>
          </div>
        );
      })}
    </div>
  );
}
