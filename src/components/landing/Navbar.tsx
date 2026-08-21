"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Button from "@/components/buttons/buttons";
import { getCartCount, subscribeToCartChanges } from "@/lib/cart";

const menuItems = [
  { label: "Books", href: "/books" },
  { label: "Learn Publishing", href: "/pricing" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Get Quote", href: "/getQuote" },
];

type QuoteEstimateDetail = {
  formattedTotal: string;
  hasSelection: boolean;
  estimateInView: boolean;
};

type QuoteWindow = Window & {
  __valuePlusQuoteEstimate?: QuoteEstimateDetail;
};

const defaultQuoteEstimate: QuoteEstimateDetail = {
  formattedTotal: "₦0",
  hasSelection: false,
  estimateInView: true,
};

// Person/login icon — clean minimal silhouette, universally understood
function LoginIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

// Cart icon + item-count badge — same glass-pill treatment as
// LoginIcon's own <Link> above (identical size/border/background), so
// the two always sit as a matched pair whichever cluster they're in.
function CartIconLink({ className }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCartCount());
    return subscribeToCartChanges(() => setCount(getCartCount()));
  }, []);

  return (
    <Link
      href="/cart"
      aria-label="View cart"
      className={`relative z-[3100] inline-flex h-[2.55rem] w-[2.55rem] min-w-[2.55rem] items-center justify-center rounded-[0.95rem] border border-white/14 text-white/80 backdrop-blur-[16px] ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04)), rgba(255,255,255,0.045)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.11)",
        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <ShoppingCart className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
      {count > 0 && (
        <span
          className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.55rem] font-black text-[#171100]"
          style={{ background: "rgb(var(--vp-accent-rgb))" }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quoteEstimate, setQuoteEstimate] =
    useState<QuoteEstimateDetail>(defaultQuoteEstimate);

  useEffect(() => {
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const applyQuoteEstimate = (nextEstimate: QuoteEstimateDetail) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setQuoteEstimate(nextEstimate);
      });
    };

    const onQuoteEstimate = (event: Event) => {
      const customEvent = event as CustomEvent<QuoteEstimateDetail>;
      applyQuoteEstimate({
        formattedTotal: customEvent.detail?.formattedTotal || "₦0",
        hasSelection: Boolean(customEvent.detail?.hasSelection),
        estimateInView:
          typeof customEvent.detail?.estimateInView === "boolean"
            ? customEvent.detail.estimateInView
            : true,
      });
    };

    window.addEventListener("valueplus:quote-estimate", onQuoteEstimate);

    const existingEstimate = (window as QuoteWindow).__valuePlusQuoteEstimate;
    if (existingEstimate) applyQuoteEstimate(existingEstimate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("valueplus:quote-estimate", onQuoteEstimate);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.documentElement.classList.add("mobile-menu-is-open");
      document.body.classList.add("mobile-menu-is-open");
    } else {
      document.documentElement.classList.remove("mobile-menu-is-open");
      document.body.classList.remove("mobile-menu-is-open");
    }

    return () => {
      document.documentElement.classList.remove("mobile-menu-is-open");
      document.body.classList.remove("mobile-menu-is-open");
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const showMobileQuoteEstimate =
    quoteEstimate.hasSelection &&
    !quoteEstimate.estimateInView &&
    !mobileMenuOpen;

  return (
    <>
      <input
        id="mobile-menu-toggle"
        type="checkbox"
        className="mobile-menu-checkbox"
        checked={mobileMenuOpen}
        onChange={(event) => setMobileMenuOpen(event.currentTarget.checked)}
      />

      <header className="fixed left-0 right-0 top-0 z-[3000]">
        <nav
          className={`w-full transition-all duration-500 ${
            scrolled ? "nav-scrolled" : "nav-top"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
            {/* Logo / mobile quote pill */}
            <div className="flex min-w-0 flex-1 items-center md:flex-none">
              <Link
                href="/"
                className={`items-center gap-3 ${
                  showMobileQuoteEstimate ? "hidden md:flex" : "flex"
                }`}
              >
                <Image
                  src="/images/logos/valueplus-logo-white2.png"
                  alt="ValuePlus"
                  width={150}
                  height={44}
                  priority
                  className="h-8 w-auto object-contain md:h-9"
                />
              </Link>

              {showMobileQuoteEstimate && (
                <div className="flex min-w-0 items-center gap-2 md:hidden">
                  <span
                    className="text-[0.5rem] font-black uppercase tracking-[0.18em] text-white/45"
                    style={{ textAlign: "right" }}
                  >
                    Estimated <br />
                    total
                  </span>
                  <span className="rounded-full bg-[#16a34a] px-4 py-2 text-[1.08rem] font-black leading-none tracking-[-0.055em] text-white shadow-[0_14px_35px_rgba(22,163,74,0.34)]">
                    {quoteEstimate.formattedTotal}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-7 text-[0.7rem] font-black uppercase tracking-widest text-white/60 md:flex">
              {menuItems.map((item) => (
                <Link key={item.label} className="nav-link" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden items-center gap-3 md:flex">
              <CartIconLink />
              <Button href="/login" variant="secondary" size="sm">
                Log in
              </Button>
              <Button href="/login?mode=signup" variant="primary" size="sm">
                Create free account
              </Button>
            </div>

            {/* Mobile right cluster: cart icon + login icon + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <CartIconLink />

              {/*
               * Login icon button — sits right next to the hamburger.
               * Styled to match the hamburger button visually (same size,
               * same glass background, same border radius).
               */}
              <Link
                href="/login"
                aria-label="Log in"
                className="relative z-[3100] inline-flex h-[2.55rem] w-[2.55rem] min-w-[2.55rem] items-center justify-center rounded-[0.95rem] border border-white/14 text-white/80 backdrop-blur-[16px]"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04)), rgba(255,255,255,0.045)",
                  boxShadow:
                    "0 10px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.11)",
                  WebkitBackdropFilter: "blur(16px) saturate(1.4)",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <LoginIcon className="h-[1.1rem] w-[1.1rem]" />
              </Link>

              {/* Hamburger */}
              <label
                htmlFor="mobile-menu-toggle"
                aria-label="Open menu"
                className="mobile-menu-button"
              >
                <span className="mobile-menu-line" />
                <span className="mobile-menu-line" />
                <span className="mobile-menu-line" />
              </label>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile backdrop */}
      <label
        htmlFor="mobile-menu-toggle"
        aria-label="Close mobile menu"
        className="mobile-menu-backdrop"
      />

      {/* Mobile sidebar */}
      <aside id="mobile-sidebar" className="mobile-sidebar">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logos/valueplus-logo-white2.png"
              alt="ValuePlus"
              width={145}
              height={42}
              className="h-8 w-auto object-contain"
            />
          </Link>

          <label
            htmlFor="mobile-menu-toggle"
            aria-label="Close menu"
            className="mobile-menu-close"
          >
            ×
          </label>
        </div>

        <div className="mt-9">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="mobile-menu-link"
              >
                <span>{item.label}</span>
                <b>›</b>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-24 space-y-3">
          <Button
            href="/login"
            variant="secondary"
            size="md"
            className="w-full"
            onClick={closeMenu}
          >
            Log in
          </Button>
          <Button
            href="/login?mode=signup"
            variant="primary"
            size="md"
            className="w-full"
            onClick={closeMenu}
          >
            Create free account
          </Button>
        </div>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
            BECOME A PUBLISHER
          </p>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Learn the A—Z of Publishing in Just 6 Modules and publish your first
            book.
          </p>
        </div>
      </aside>
    </>
  );
}
