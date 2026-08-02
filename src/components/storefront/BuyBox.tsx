"use client";

// The public product page's actual "buy" interaction — a light card
// nested in the page's dark shell, same "light card floating on dark
// chrome" treatment the login/Get-a-Quote pages already use. Storefront
// pages (this, the cart, checkout, and order-confirmation) are
// deliberately light throughout: e-commerce checkout conventions
// (Paystack's own hosted checkout, Selar, Amazon, Jumia) read as "a
// store," where scannability of price/trust details matters more than
// the marketing site's dark editorial brand.
//
// A title's physical edition and Ebook edition are independent and can
// both be for sale at once (see Book.has_ebook/has_physical
// server-side) — when both exist, this renders a tab to pick one, each
// with its own price/quantity rules, and adds a SEPARATE cart line per
// edition (see lib/cart.ts's (bookId, format) keying).

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { addToCart, minQuantityFor } from "@/lib/cart";
import { notify } from "@/lib/snackbar";

interface Edition {
  format: string;
  label: string;
  price: number;
}

export default function BuyBox({
  bookId,
  slug,
  format,
  price,
  ebookPrice,
  hasEbook,
  hasPhysical,
}: {
  bookId: string;
  slug: string;
  format: string;
  price: number | null;
  ebookPrice: number | null;
  hasEbook: boolean;
  hasPhysical: boolean;
}) {
  const editions: Edition[] = [
    ...(hasPhysical && price !== null ? [{ format, label: format, price }] : []),
    ...(hasEbook && ebookPrice !== null ? [{ format: "Ebook", label: "Ebook", price: ebookPrice }] : []),
  ];

  const [selectedFormat, setSelectedFormat] = useState(editions[0]?.format ?? "");
  const selected = editions.find((e) => e.format === selectedFormat) ?? editions[0] ?? null;
  const minQty = minQuantityFor(selected?.format ?? "");
  const [quantity, setQuantity] = useState(minQty);

  // Different edition, different minimum (Ebook has none, physical has
  // MIN_PHYSICAL_QUANTITY) — reset rather than carrying over a quantity
  // that might now be below the new edition's floor.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantity(minQuantityFor(selected?.format ?? ""));
  }, [selected?.format]);

  const handleAddToCart = () => {
    if (!selected) return;
    addToCart(bookId, slug, selected.format, quantity);
    notify(`Added ${quantity} to cart!`, "success");
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
      {editions.length > 1 && (
        <div className="mb-4 flex gap-1.5 rounded-xl border border-black/10 bg-black/[0.03] p-1">
          {editions.map((edition) => {
            const isEbook = edition.format === "Ebook";
            const active = selected?.format === edition.format;
            return (
              <button
                key={edition.format}
                type="button"
                onClick={() => setSelectedFormat(edition.format)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[0.72rem] font-bold transition-colors"
                style={{
                  background: active ? "#171100" : "transparent",
                  color: active ? "#ffffff" : "rgba(0,0,0,0.5)",
                }}
              >
                {isEbook ? <Download size={13} strokeWidth={2.5} /> : <Truck size={13} strokeWidth={2.5} />}
                {edition.label}
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <p className="text-3xl font-black text-[#14181f]">₦{selected.price.toLocaleString()}</p>
      )}

      {selected && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[0.72rem] font-bold uppercase tracking-wide text-black/45">
              Quantity
            </span>
            <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-black/[0.03]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
                disabled={quantity <= minQty}
                className="grid h-9 w-9 place-items-center text-black/60 transition-colors hover:text-black disabled:opacity-30"
              >
                <Minus size={15} strokeWidth={2.5} />
              </button>
              <span className="w-10 text-center text-sm font-bold text-[#14181f]">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="grid h-9 w-9 place-items-center text-black/60 transition-colors hover:text-black"
              >
                <Plus size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {minQty > 1 && (
            <p className="mt-1.5 text-[0.68rem] text-black/40">
              Minimum order for a physical copy: {minQty} copies.
            </p>
          )}
        </>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!selected}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171100] py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        <ShoppingCart size={16} strokeWidth={2.25} />
        {selected ? "Add to Cart" : "Not available yet"}
      </button>

      {selected?.format === "Ebook" ? (
        <p className="mt-2.5 text-center text-[0.68rem] leading-relaxed text-black/40">
          Instant digital delivery — you&apos;ll get the download link right after payment,
          and by email.
        </p>
      ) : (
        selected && (
          <p className="mt-2.5 text-center text-[0.68rem] leading-relaxed text-black/40">
            A physical copy — delivery cost is paid separately by you, arranged at checkout.
          </p>
        )
      )}

      <Link
        href="/cart"
        className="mt-3 block text-center text-[0.78rem] font-bold text-black/50 hover:text-black/70"
      >
        View Cart →
      </Link>
    </div>
  );
}
