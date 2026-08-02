"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import BackButton from "@/components/storefront/BackButton";
import { apiFetch, ApiError } from "@/lib/api";
import { notify } from "@/lib/snackbar";
import { getCart } from "@/lib/cart";

interface PublicBook {
  id: string;
  title: string;
  price: string | null;
  ebook_price: string | null;
  format: string;
}

async function fetchPublicBook(slug: string): Promise<PublicBook | null> {
  try {
    return await apiFetch<PublicBook>(`/books/public/${slug}/`, { skipAuth: true });
  } catch {
    return null;
  }
}

function naira(value: number) {
  return `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<{ id: string; title: string; price: number; quantity: number; format: string }[] | null>(null);
  const [couponCode] = useState(searchParams.get("coupon") ?? "");
  const [discountAmount, setDiscountAmount] = useState(Number(searchParams.get("discount") ?? 0));

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryCostAck, setDeliveryCostAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const items = getCart();
    Promise.all(
      items.map(async (item) => {
        const book = await fetchPublicBook(item.slug);
        if (!book) return null;
        // The cart line's own `format` (what was actually selected —
        // see lib/cart.ts) picks which of the book's two independent
        // prices applies here, not the book's own `format` field.
        const price = item.format === "Ebook" ? book.ebook_price : book.price;
        if (price === null) return null;
        return {
          id: book.id,
          title: book.title,
          price: Number(price),
          quantity: item.quantity,
          format: item.format,
        };
      }),
    ).then((resolved) => setBooks(resolved.filter((b): b is NonNullable<typeof b> => b !== null)));
  }, []);

  const subtotal = (books ?? []).reduce((sum, b) => sum + b.price * b.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);
  const hasPhysicalItem = (books ?? []).some((b) => b.format !== "Ebook");

  const handleSubmit = async () => {
    if (!books || books.length === 0) {
      notify("Your cart is empty.", "error");
      return;
    }
    if (!buyerName.trim() || !buyerEmail.trim()) {
      notify("Please enter your name and email.", "error");
      return;
    }
    if (hasPhysicalItem && !shippingAddress.trim()) {
      notify("A shipping address is required for a physical copy.", "error");
      return;
    }
    if (hasPhysicalItem && !deliveryCostAck) {
      notify("Please confirm you understand you'll pay the delivery cost.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiFetch<{ authorization_url: string; reference: string }>(
        "/storefront/checkout/initiate/",
        {
          skipAuth: true,
          method: "POST",
          body: JSON.stringify({
            items: books.map((b) => ({ book_id: b.id, format: b.format, quantity: b.quantity })),
            coupon_code: couponCode,
            buyer_name: buyerName.trim(),
            buyer_email: buyerEmail.trim(),
            buyer_phone: buyerPhone.trim(),
            shipping_address: shippingAddress.trim(),
            delivery_cost_acknowledged: deliveryCostAck,
          }),
        },
      );
      window.location.href = result.authorization_url;
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not start checkout. Please try again.", "error");
      }
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-vp-ink text-white">
      <div className="noise-layer" />
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 md:pt-32">
        <BackButton href="/cart" label="Back to Cart" className="mb-4" />
        <h1 className="mb-6 text-3xl font-black text-white">Checkout</h1>

        <div className="rounded-2xl border border-black/10 bg-white p-5 text-[#14181f]">
          {books === null ? (
            <p className="text-black/45">Loading…</p>
          ) : books.length === 0 ? (
            <p className="text-black/45">Your cart is empty.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 border-b border-black/5 pb-4">
                {books.map((b) => (
                  <div key={`${b.id}-${b.format}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-black/70">
                      <span className="truncate">{b.title} × {b.quantity}</span>
                      {b.format && <FormatBadge format={b.format} className="shrink-0" />}
                    </span>
                    <span className="shrink-0 font-bold">{naira(b.price * b.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-black/60">
                  <span>Subtotal</span>
                  <span>{naira(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-semibold text-[#16a34a]">
                    <span>Discount</span>
                    <span>&minus;{naira(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black">
                  <span>Total</span>
                  <span>{naira(total)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Full name *"
                  className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3 text-sm outline-none placeholder:text-black/35"
                />
                <input
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Email address *"
                  type="email"
                  className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3 text-sm outline-none placeholder:text-black/35"
                />
                <input
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3 text-sm outline-none placeholder:text-black/35"
                />
                {hasPhysicalItem && (
                  <>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Shipping address *"
                      rows={3}
                      className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3 text-sm outline-none placeholder:text-black/35"
                    />
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3">
                      <input
                        type="checkbox"
                        checked={deliveryCostAck}
                        onChange={(e) => setDeliveryCostAck(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#171100]"
                      />
                      <span className="text-xs leading-relaxed text-black/60">
                        I understand delivery cost for physical copies is paid by me (the
                        receiver) separately, and isn&apos;t included in the total above.
                      </span>
                    </label>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || (hasPhysicalItem && !deliveryCostAck)}
                className="mt-5 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
                style={{ background: "#171100" }}
              >
                {submitting ? "Redirecting to payment…" : `Pay ${naira(total)}`}
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm />
    </Suspense>
  );
}
