"use client";

// Paystack's callback_url (see CheckoutInitiateView) lands here after the
// buyer pays. The webhook usually beats this page to actually marking
// the order paid, but OrderStatusView falls back to verifying with
// Paystack directly if it hasn't yet — so this polls briefly rather
// than trusting a single fetch.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Download, XCircle } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import BackButton from "@/components/storefront/BackButton";
import { apiFetch } from "@/lib/api";
import { clearCart } from "@/lib/cart";

interface OrderItem {
  book_title: string;
  quantity: number;
  format: string;
  line_total: string;
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

        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-[#14181f]">
          {!order || order.status === "pending" ? (
            <>
              <Clock size={32} className="mx-auto mb-3 animate-pulse text-black/30" />
              <p className="font-bold">Confirming your payment…</p>
              <p className="mt-1 text-sm text-black/45">This usually only takes a few seconds.</p>
            </>
          ) : order.status === "paid" ? (
            <>
              <CheckCircle2 size={36} className="mx-auto mb-3 text-[#16a34a]" />
              <p className="text-lg font-black">Payment successful!</p>
              <p className="mt-1 text-sm text-black/50">
                Order {order.paystack_reference} — {naira(Number(order.total))}
              </p>
              <div className="mt-5 flex flex-col gap-1.5 text-left text-sm">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-black/70">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{item.book_title} × {item.quantity}</span>
                      {item.format && <FormatBadge format={item.format} className="shrink-0" />}
                    </span>
                    <span className="shrink-0 font-bold">{naira(Number(item.line_total))}</span>
                  </div>
                ))}
              </div>
              {order.items.some((item) => item.ebook_drive_link) && (
                <div className="mt-5 flex flex-col gap-2">
                  {order.items
                    .filter((item) => item.ebook_drive_link)
                    .map((item, i) => (
                      <a
                        key={i}
                        href={item.ebook_drive_link!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
                        style={{ background: "#16a34a" }}
                      >
                        <Download size={16} strokeWidth={2.25} />
                        Access &ldquo;{item.book_title}&rdquo;
                      </a>
                    ))}
                </div>
              )}

              <p className="mt-5 text-xs leading-relaxed text-black/40">
                A receipt has been emailed to you
                {order.items.some((item) => item.ebook_drive_link)
                  ? " with your ebook access link"
                  : ""}
                . Physical copies ship to the address you provided.
              </p>
              <Link
                href="/"
                className="mt-5 inline-block rounded-xl px-6 py-3 text-sm font-bold text-white"
                style={{ background: "#171100" }}
              >
                Back to ValuePlus
              </Link>
            </>
          ) : (
            <>
              <XCircle size={32} className="mx-auto mb-3 text-red-500" />
              <p className="font-bold">Payment {order.status}</p>
              <p className="mt-1 text-sm text-black/45">
                Your cart wasn&apos;t charged. You can try again from your cart.
              </p>
              <Link
                href="/cart"
                className="mt-5 inline-block rounded-xl px-6 py-3 text-sm font-bold text-white"
                style={{ background: "#171100" }}
              >
                Back to Cart
              </Link>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
