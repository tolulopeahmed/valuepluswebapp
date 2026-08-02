"use client";

// Storefront cart — light theme throughout (see BuyBox.tsx's docstring
// for the reasoning), nested in the same dark Navbar/Footer chrome as
// every other public page.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import BackButton from "@/components/storefront/BackButton";
import { apiFetch, ApiError } from "@/lib/api";
import { notify } from "@/lib/snackbar";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  subscribeToCartChanges,
  minQuantityFor,
  type CartItem,
} from "@/lib/cart";

interface PublicBook {
  id: string;
  title: string;
  cover: string | null;
  price: string | null;
  ebook_price: string | null;
  format: string;
}

interface CartLine extends CartItem {
  book: PublicBook;
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

// A cart line's own `format` (what was actually selected when it was
// added — see lib/cart.ts) picks which of the book's two independent
// prices applies; `book.format`/`book.price` alone would be wrong for
// an Ebook line on a book that also has a physical edition.
function priceForLine(line: CartLine): number | null {
  const raw = line.format === "Ebook" ? line.book.ebook_price : line.book.price;
  return raw !== null ? Number(raw) : null;
}

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const loadCart = async () => {
    const items = getCart();
    const resolved = await Promise.all(
      items.map(async (item) => {
        const book = await fetchPublicBook(item.slug);
        return book ? { ...item, book } : null;
      }),
    );
    setLines(resolved.filter((l): l is CartLine => l !== null));
  };

  useEffect(() => {
    loadCart();
    return subscribeToCartChanges(loadCart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = (lines ?? []).reduce(
    (sum, line) => sum + (priceForLine(line) ?? 0) * line.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discountAmount);
  const hasPhysicalItem = (lines ?? []).some((l) => l.format !== "Ebook");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const result = await apiFetch<{ valid: boolean; discount_amount: string; message: string }>(
        "/storefront/coupons/validate/",
        {
          skipAuth: true,
          method: "POST",
          body: JSON.stringify({
            code: couponCode.trim(),
            subtotal,
            book_ids: (lines ?? []).map((line) => line.book.id),
          }),
        },
      );
      setDiscountAmount(result.valid ? Number(result.discount_amount) : 0);
      setCouponMessage(result.message || (result.valid ? "Coupon applied!" : "Invalid coupon."));
    } catch (err) {
      setDiscountAmount(0);
      if (!(err instanceof ApiError)) {
        notify("Could not validate coupon. Please try again.", "error");
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = () => {
    router.push(
      `/checkout?coupon=${encodeURIComponent(couponCode.trim())}&discount=${discountAmount}`,
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-vp-ink text-white">
      <div className="noise-layer" />
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:pt-32">
        <BackButton className="mb-4" />
        <h1 className="mb-6 text-3xl font-black text-white">Your Cart</h1>

        {lines === null ? (
          <p className="text-white/50">Loading your cart…</p>
        ) : lines.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-[#14181f]">
            <ShoppingCart size={28} className="mx-auto mb-3 text-black/30" />
            <p className="font-bold">Your cart is empty</p>
            <Link href="/" className="mt-4 inline-block text-sm font-bold" style={{ color: "rgb(var(--vp-accent-rgb))" }}>
              Browse books →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4">
              {lines.map((line) => {
                const minQty = minQuantityFor(line.format);
                const price = priceForLine(line);
                return (
                <div key={`${line.bookId}-${line.format}`} className="flex items-center gap-3 border-b border-black/5 pb-3 last:border-0 last:pb-0">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-black/5">
                    {line.book.cover && (
                      <Image src={line.book.cover} alt={line.book.title} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#14181f]">{line.book.title}</p>
                    <p className="text-xs text-black/45">
                      {price !== null ? naira(price) : "—"}
                    </p>
                    {line.format && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <FormatBadge format={line.format} />
                        {minQty > 1 && (
                          <span className="text-[0.62rem] text-black/35">Min {minQty}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-black/[0.03]">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateCartQuantity(line.bookId, line.format, Math.max(minQty, line.quantity - 1))}
                      disabled={line.quantity <= minQty}
                      className="grid h-7 w-7 place-items-center text-black/60 disabled:opacity-30"
                    >
                      <Minus size={13} strokeWidth={2.5} />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-[#14181f]">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateCartQuantity(line.bookId, line.format, line.quantity + 1)}
                      className="grid h-7 w-7 place-items-center text-black/60"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove from cart"
                    onClick={() => removeFromCart(line.bookId, line.format)}
                    className="text-black/30 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm text-[#14181f] outline-none placeholder:text-black/35"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "#171100" }}
                >
                  {validatingCoupon ? "Checking…" : "Apply"}
                </button>
              </div>
              {couponMessage && (
                <p className="mt-2 text-xs font-semibold" style={{ color: discountAmount > 0 ? "#16a34a" : "#dc2626" }}>
                  {couponMessage}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-1.5 border-t border-black/5 pt-4 text-sm">
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
                <div className="flex justify-between text-base font-black text-[#14181f]">
                  <span>Total</span>
                  <span>{naira(total)}</span>
                </div>
              </div>

              {hasPhysicalItem && (
                <p className="mt-3 text-xs text-black/40">
                  A shipping address will be collected at checkout for physical copies —
                  delivery cost is paid separately by you.
                </p>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98]"
                style={{ background: "#171100" }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
