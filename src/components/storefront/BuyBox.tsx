"use client";

// The public product page's actual "buy" interaction — a light card
// nested in the page's dark shell, same "light card floating on dark
// chrome" treatment the login/Get-a-Quote pages already use. Storefront
// pages (this, the cart, checkout, and order-confirmation) are
// deliberately light throughout: e-commerce checkout conventions
// (Paystack's own hosted checkout, Selar, Amazon, Jumia) read as "a
// store," where scannability of price/trust details matters more than
// the marketing site's dark editorial brand.

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { notify } from "@/lib/snackbar";

export default function BuyBox({
  bookId,
  slug,
  price,
}: {
  bookId: string;
  slug: string;
  price: number | null;
}) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(bookId, slug, quantity);
    notify(`Added ${quantity} to cart!`, "success");
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
      {price !== null && (
        <p className="text-3xl font-black text-[#14181f]">₦{price.toLocaleString()}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <span className="text-[0.72rem] font-bold uppercase tracking-wide text-black/45">
          Quantity
        </span>
        <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-black/[0.03]">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid h-9 w-9 place-items-center text-black/60 transition-colors hover:text-black"
          >
            <Minus size={15} strokeWidth={2.5} />
          </button>
          <span className="w-8 text-center text-sm font-bold text-[#14181f]">{quantity}</span>
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

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={price === null}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171100] py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        <ShoppingCart size={16} strokeWidth={2.25} />
        {price === null ? "Not available yet" : "Add to Cart"}
      </button>

      <Link
        href="/cart"
        className="mt-3 block text-center text-[0.78rem] font-bold text-black/50 hover:text-black/70"
      >
        View Cart →
      </Link>
    </div>
  );
}
