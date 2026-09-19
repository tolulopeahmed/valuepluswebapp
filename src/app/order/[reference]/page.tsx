"use client";

// Paystack's callback_url (see CheckoutInitiateView) lands here after the
// buyer pays. The webhook usually beats this page to actually marking
// the order paid, but OrderStatusView falls back to verifying with
// Paystack directly if it hasn't yet — so this polls briefly rather
// than trusting a single fetch.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2, Clock, Copy, Download, XCircle } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import BackButton from "@/components/storefront/BackButton";
import Button from "@/components/buttons/buttons";
import { apiFetch } from "@/lib/api";
import { clearCart } from "@/lib/cart";
import { notify } from "@/lib/snackbar";

interface OrderItem {
  book_title: string;
  quantity: number;
  format: string;
  line_total: string;
  book_cover: string | null;
  // Only ever populated once the order is actually paid, and only for
  // an Ebook line — see OrderItemSerializer.get_ebook_drive_link
  // server-side. Null before that, or if the book has no link set.
  ebook_drive_link: string | null;
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
        const data = await apiFetch<OrderStatus>(`/storefront/orders/${reference}/status/`, {
          skipAuth: true,
        });
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
    apiFetch<OrderStatus>(`/storefront/orders/${reference}/status/`, { skipAuth: true })
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

              {order.items.some((item) => item.ebook_drive_link) && (
                <div className="mt-4 flex flex-col gap-2 border-t border-black/5 pt-4">
                  {order.items
                    .filter((item) => item.ebook_drive_link)
                    .map((item, i) => (
                      <Button key={i} href={item.ebook_drive_link!} variant="primary" size="md" className="w-full">
                        <span className="inline-flex items-center gap-2">
                          <Download size={16} strokeWidth={2.25} />
                          Access &ldquo;{item.book_title}&rdquo;
                        </span>
                      </Button>
                    ))}
                </div>
              )}
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
                {order.items.some((item) => item.ebook_drive_link) ? " with your ebook access link" : ""}
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
