"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormatBadge from "@/components/FormatBadge";
import BackButton from "@/components/storefront/BackButton";
import Button from "@/components/buttons/buttons";
import { apiFetch, ApiError } from "@/lib/api";
import AddressAutocomplete, { type PickedPlace } from "@/components/storefront/AddressAutocomplete";
import { notify } from "@/lib/snackbar";
import { getCart } from "@/lib/cart";
import { useAuth } from "@/contexts/AuthContext";
import LoadingModal, { type LoadingStep } from "@/components/LoadingModal";

interface PublicBook {
  id: string;
  title: string;
  paperback_price: string | null;
  hardback_price: string | null;
  ebook_price: string | null;
  author_ships_physical?: boolean;
  affiliate_enabled: boolean;
  affiliate_percentage: string;
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
  const { user, loginWithGoogle } = useAuth();
  const [books, setBooks] = useState<{ id: string; title: string; price: number; quantity: number; format: string; authorShips: boolean; affiliateEnabled: boolean; affiliatePercentage: string; affiliateCode?: string; affiliateAt?: string }[] | null>(null);
  const [couponCode] = useState(searchParams.get("coupon") ?? "");
  const [discountAmount, setDiscountAmount] = useState(Number(searchParams.get("discount") ?? 0));

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [pickedPlace, setPickedPlace] = useState<PickedPlace | null>(null);
  const [deliveryCostAck, setDeliveryCostAck] = useState(false);
  const [becomeDistributor, setBecomeDistributor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([]);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ?? "";

  useEffect(() => {
    if (!user) return;
    setBuyerEmail(user.email);
    setBuyerName(`${user.first_name} ${user.last_name}`.trim());
    if (user.phone_number) setBuyerPhone(user.phone_number);
  }, [user]);

  async function handleGoogleCredential(idToken: string) {
    setLoadingSteps([{ label: "Verifying your Google account...", done: false }]);
    setGoogleLoading(true);
    try {
      let result = await loginWithGoogle(idToken);
      if (!result.account_exists) {
        setGoogleLoading(false);
        if (!window.confirm(`Create a ValuePlus account for ${result.email ?? "this Google account"} and continue?`)) return;
        setLoadingSteps([
          { label: "Verifying your Google account...", done: true },
          { label: "Creating your ValuePlus account...", done: false },
        ]);
        setGoogleLoading(true);
        result = await loginWithGoogle(idToken, true);
      }
      if (result.account_exists && result.user) {
        setBuyerEmail(result.user.email);
        setBuyerName(`${result.user.first_name} ${result.user.last_name}`.trim());
        if (result.user.phone_number) setBuyerPhone(result.user.phone_number);
        setLoadingSteps((steps) => steps.map((step) => ({ ...step, done: true })));
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (err) {
      if (!(err instanceof ApiError)) notify("Google sign-in could not be completed.", "error");
    } finally {
      setGoogleLoading(false);
    }
  }

  function renderGoogleButton() {
    if (!becomeDistributor || user || !googleClientId || !window.google || !googleButtonRef.current) return;
    googleButtonRef.current.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: ({ credential }) => handleGoogleCredential(credential),
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard", theme: "outline", size: "large", text: "continue_with",
      shape: "pill", width: Math.min(520, googleButtonRef.current.clientWidth || 520), logo_alignment: "left",
    });
  }

  useEffect(() => {
    renderGoogleButton();
    // Google owns the rendered button DOM.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [becomeDistributor, user, googleClientId]);

  useEffect(() => {
    const items = getCart();
    Promise.all(
      items.map(async (item) => {
        const book = await fetchPublicBook(item.slug);
        if (!book) return null;
        // The cart line's own `format` (what was actually selected —
        // see lib/cart.ts) picks which of the book's three independent
        // prices applies here.
        const price =
          item.format === "Ebook"
            ? book.ebook_price
            : item.format === "Hardback"
              ? book.hardback_price
              : book.paperback_price;
        if (price === null) return null;
        return {
          id: book.id,
          title: book.title,
          price: Number(price),
          quantity: item.quantity,
          format: item.format,
          authorShips: Boolean(book.author_ships_physical),
          affiliateEnabled: book.affiliate_enabled,
          affiliatePercentage: book.affiliate_percentage,
          affiliateCode: item.affiliateCode,
          affiliateAt: item.affiliateAt,
        };
      }),
    ).then((resolved) => setBooks(resolved.filter((b): b is NonNullable<typeof b> => b !== null)));
  }, []);

  const subtotal = (books ?? []).reduce((sum, b) => sum + b.price * b.quantity, 0);
  const hasPhysicalItem = (books ?? []).some((b) => b.format !== "Ebook");
  // Single copies the author ships: delivery is priced live and paid in
  // the same checkout. Press-run (50+) orders keep the old "pay delivery
  // separately" acknowledgement.
  const courierItems = (books ?? []).filter((b) => b.format !== "Ebook" && b.authorShips);
  const needsAck = (books ?? []).some((b) => b.format !== "Ebook" && !b.authorShips);
  const [quote, setQuote] = useState<{ fee: number; eta: string; ids: string[]; key: string } | null>(null);
  const [quoteState, setQuoteState] = useState<"idle" | "loading" | "error" | "unavailable">("idle");
  const [quoteError, setQuoteError] = useState("");
  const fullAddress = shippingAddress.trim();
  const quoteKey = JSON.stringify([courierItems.map((b) => [b.id, b.format, b.quantity]), buyerEmail.trim(), buyerPhone.trim(), fullAddress, pickedPlace]);
  const quoteReady = courierItems.length > 0 && buyerPhone.trim().length >= 7 && shippingAddress.trim().length >= 10 && /@/.test(buyerEmail);

  useEffect(() => {
    if (!quoteReady || quote?.key === quoteKey) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoteState("loading");
      try {
        const res = await apiFetch<{ available: boolean; delivery_fee: string; eta: string; quote_ids: string[] }>(
          "/storefront/delivery/quote/",
          {
            method: "POST",
            silent: true,
            body: JSON.stringify({
              items: courierItems.map((b) => ({ book_id: b.id, format: b.format, quantity: b.quantity })),
              buyer_name: buyerName.trim(),
              buyer_email: buyerEmail.trim(),
              buyer_phone: buyerPhone.trim(),
              shipping_address: fullAddress,
              latitude: pickedPlace?.lat ?? null,
              longitude: pickedPlace?.lng ?? null,
            }),
          },
        );
        if (cancelled) return;
        if (!res.available) {
          setQuote(null);
          setQuoteState("unavailable");
          return;
        }
        setQuote({ fee: Number(res.delivery_fee), eta: res.eta, ids: res.quote_ids, key: quoteKey });
        setQuoteState("idle");
      } catch (err) {
        if (cancelled) return;
        setQuote(null);
        setQuoteError(err instanceof ApiError ? err.message : "Couldn't price delivery. Check your connection.");
        setQuoteState("error");
      }
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey, quoteReady]);

  const quoteFresh = quote !== null && quote.key === quoteKey;
  const deliveryFee = quoteFresh ? quote.fee : 0;
  // Courier pricing isn't switched on (no key yet): fall back to the
  // acknowledgement, same as press-run orders.
  const ackRequired = needsAck || (courierItems.length > 0 && quoteState === "unavailable");
  const deliveryPending = courierItems.length > 0 && quoteState !== "unavailable" && !quoteFresh;
  const total = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const handleSubmit = async () => {
    if (!books || books.length === 0) {
      notify("Your cart is empty.", "error");
      return;
    }
    if (!buyerName.trim() || !buyerEmail.trim()) {
      notify("Please enter your name and email.", "error");
      return;
    }
    if (courierItems.length > 0 && !buyerName.trim().includes(" ")) {
      notify("Enter your full name (first and last) for the delivery.", "error");
      return;
    }
    if (hasPhysicalItem && !buyerPhone.trim()) {
      notify("A phone number is required for a physical copy, so the rider can reach you.", "error");
      return;
    }
    if (hasPhysicalItem && !shippingAddress.trim()) {
      notify("A shipping address is required for a physical copy.", "error");
      return;
    }
    if (ackRequired && !deliveryCostAck) {
      notify("Please confirm you understand you'll pay the delivery cost.", "error");
      return;
    }
    if (deliveryPending) {
      notify(quoteState === "error" ? quoteError : "Getting your delivery price - one moment.", "error");
      return;
    }
    if (becomeDistributor && !user) {
      notify("Continue with Google to create or log in to your distributor account.", "error");
      return;
    }

    setLoadingSteps([{ label: total === 0 ? "Completing your free order..." : "Preparing your secure payment...", done: false }]);
    setSubmitting(true);
    try {
      const result = await apiFetch<{ authorization_url: string; reference: string; payment_required?: boolean }>(
        "/storefront/checkout/initiate/",
        {
          method: "POST",
          body: JSON.stringify({
            items: books.map((b) => ({ book_id: b.id, format: b.format, quantity: b.quantity, affiliate_code: b.affiliateCode ?? "", affiliate_at: b.affiliateAt ?? null })),
            coupon_code: couponCode,
            buyer_name: buyerName.trim(),
            buyer_email: buyerEmail.trim(),
            buyer_phone: buyerPhone.trim(),
            shipping_address: fullAddress,
            delivery_cost_acknowledged: deliveryCostAck,
            delivery_quote_ids: quoteFresh ? quote.ids : [],
            become_distributor: becomeDistributor,
          }),
        },
      );
      setLoadingSteps([
        { label: result.payment_required === false ? "Free order completed" : "Preparing your secure payment...", done: true },
        { label: result.payment_required === false ? "Opening your order..." : "Opening Paystack...", done: false },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 250));
      window.location.href = result.authorization_url;
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not start checkout. Please try again.", "error");
      }
      setSubmitting(false);
    }
  };

  return (
    <main className="vp-product-page-bg min-h-screen overflow-x-hidden text-white">
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
                {courierItems.length > 0 && quoteState !== "unavailable" && (
                  <div className="flex justify-between text-black/60">
                    <span>
                      Delivery
                      {quoteFresh && quote.eta && <span className="ml-1 text-xs text-black/40">· {quote.eta.toLowerCase()}</span>}
                    </span>
                    <span>
                      {quoteFresh
                        ? naira(quote.fee)
                        : quoteState === "loading"
                          ? "Calculating…"
                          : "Add address"}
                    </span>
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
                  placeholder={hasPhysicalItem ? "Full name (first and last) *" : "Full name *"}
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
                  placeholder={hasPhysicalItem ? "Phone number * (for the delivery rider)" : "Phone number (optional)"}
                  className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3 text-sm outline-none placeholder:text-black/35"
                />
                {hasPhysicalItem && (
                  <>
                    <AddressAutocomplete
                      value={shippingAddress}
                      onChange={setShippingAddress}
                      onPick={setPickedPlace}
                      picked={pickedPlace}
                      placeholder="Delivery address - start typing and pick from the list *"
                      className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3 text-sm outline-none placeholder:text-black/35"
                    />
                    {courierItems.length > 0 && quoteState === "error" && (
                      <p className="-mt-1 text-xs font-semibold text-red-600">{quoteError}</p>
                    )}
                    {courierItems.length > 0 && quoteFresh && (
                      <p className="-mt-1 text-xs text-black/50">
                        Delivered to your door{quote.eta ? `, ${quote.eta.toLowerCase()} after the author sends it` : ""}. We&apos;ll email you at every step.
                      </p>
                    )}
                    {ackRequired && (
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3">
                      <input
                        type="checkbox"
                        checked={deliveryCostAck}
                        onChange={(e) => setDeliveryCostAck(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#EFC700]"
                      />
                      <span className="text-xs leading-relaxed text-black/60">
                        I understand delivery cost for physical copies is paid by me (the
                        receiver) separately, and isn&apos;t included in the total above.
                      </span>
                    </label>
                    )}
                  </>
                )}
                {books.some((book) => book.affiliateEnabled && book.format === "Ebook") ? (
                  <div className="rounded-xl border border-[#EFC700]/30 bg-[#EFC700]/[0.08] px-3.5 py-3">
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={becomeDistributor}
                        onChange={(e) => setBecomeDistributor(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#EFC700]"
                      />
                      <span className="text-xs leading-relaxed text-black/65">
                        <strong className="block text-black/80">Become a distributor</strong>
                        Ebook only, for now. Get a personal link after payment and earn {Math.min(...books.filter((book) => book.affiliateEnabled && book.format === "Ebook").map((book) => Number(book.affiliatePercentage)))}% or more of each author&apos;s net share when people buy through it.
                      </span>
                    </label>
                    {becomeDistributor && !user && (
                      <div className="mt-3 border-t border-black/10 pt-3">
                        <p className="mb-2 text-center text-[0.7rem] font-semibold text-black/55">
                          A free ValuePlus account is required so we can credit your earnings.
                        </p>
                        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={renderGoogleButton} />
                        <div ref={googleButtonRef} className="flex min-h-11 justify-center" />
                      </div>
                    )}
                    {becomeDistributor && user && (
                      <p className="mt-3 border-t border-black/10 pt-3 text-center text-[0.72rem] font-bold text-green-700">
                        Distributor account ready: {user.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3">
                    <p className="text-xs leading-relaxed text-black/55">
                      <strong className="block text-black/70">Distributor programme unavailable</strong>
                      The author has not enabled affiliate distribution for this title yet.
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                loading={submitting}
                disabled={(ackRequired && !deliveryCostAck) || deliveryPending || (becomeDistributor && !user)}
                className="mt-5 w-full"
              >
                {submitting ? "Completing checkout…" : total === 0 ? "Get free copy" : `Pay ${naira(total)}`}
              </Button>
            </>
          )}
        </div>
      </div>

      <Footer />
      <LoadingModal open={googleLoading || submitting} steps={loadingSteps} />
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
