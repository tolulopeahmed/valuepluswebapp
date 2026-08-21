"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Mode = "learner" | "publisher";

// The four top-level tab destinations (matches MainTab.tsx / Sidebar.tsx)
// — anything else (like /app/publish/new, a sub-flow you only reach via
// a specific action) gets a back arrow instead of the hamburger, since
// the main nav menu isn't really what you want mid-flow.
const MAIN_ROUTES = ["/app", "/app/learn", "/app/publish", "/app/earn", "/app/more"];

// Same event GetQuote (components/landing/GetQuote.tsx) already
// broadcasts on the public site, and the public Navbar already listens
// for — the Add New Title page (app/publish/new) reuses GetQuote as-is,
// so this header can show the exact same "estimated total" pill once
// the user scrolls its running-total card out of view.
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

function useQuoteEstimate() {
  const [estimate, setEstimate] =
    useState<QuoteEstimateDetail>(defaultQuoteEstimate);

  useEffect(() => {
    let rafId: number | null = null;

    const apply = (next: QuoteEstimateDetail) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setEstimate(next));
    };

    const onQuoteEstimate = (event: Event) => {
      const detail = (event as CustomEvent<QuoteEstimateDetail>).detail;
      apply({
        formattedTotal: detail?.formattedTotal || "₦0",
        hasSelection: Boolean(detail?.hasSelection),
        estimateInView:
          typeof detail?.estimateInView === "boolean"
            ? detail.estimateInView
            : true,
      });
    };

    window.addEventListener("valueplus:quote-estimate", onQuoteEstimate);

    const existing = (window as QuoteWindow).__valuePlusQuoteEstimate;
    if (existing) apply(existing);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("valueplus:quote-estimate", onQuoteEstimate);
    };
  }, []);

  return estimate;
}

function Icon({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  menu: "M3 12h18M3 6h18M3 18h18",
  back: "M19 12H5 M12 19l-7-7 7-7",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
};

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const isPublisher = mode === "publisher";
  return (
    <div className="relative flex items-center rounded-full border border-white/[0.1] bg-white/[0.05] p-1">
      <div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-[rgb(239,199,0)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)]"
        style={{
          transform: isPublisher
            ? "translateX(calc(100% + 4px))"
            : "translateX(0)",
        }}
      />
      <button
        onClick={() => onChange("learner")}
        className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.06em] transition-colors ${!isPublisher ? "text-[#171100]" : "text-white/50"}`}
      >
        📚 Learner
      </button>
      <button
        onClick={() => onChange("publisher")}
        className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.06em] transition-colors ${isPublisher ? "text-[#171100]" : "text-white/50"}`}
      >
        📖 Author
      </button>
    </div>
  );
}

export default function Header({
  streak,
  notificationCount = 0,
  mode,
  onModeChange,
  onMenuPress,
  onBellPress,
}: {
  streak: number;
  notificationCount?: number;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onMenuPress: () => void;
  onBellPress: () => void;
}) {
  const quoteEstimate = useQuoteEstimate();
  const router = useRouter();
  const pathname = usePathname();
  const isSubPage = !MAIN_ROUTES.includes(pathname || "/app");

  // Same condition the public Navbar uses: only swap in the total once
  // there's an actual selection and its own estimate card has scrolled
  // out of view — otherwise this just stays "ValuePlus" as always.
  const showQuoteEstimate =
    quoteEstimate.hasSelection && !quoteEstimate.estimateInView;

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 px-4 pb-2 pt-3 md:left-64 md:px-8 md:pb-3 md:pt-4"
      style={{
        background: "black",
        backdropFilter: "blur(16px) saturate(1.4)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={isSubPage ? () => router.back() : onMenuPress}
            aria-label={isSubPage ? "Go back" : "Open menu"}
            // The hamburger only makes sense on mobile (md:hidden) — desktop
            // already has the persistent Sidebar for that. The back arrow
            // on a sub-page is different: desktop has no other way back
            // (Sidebar doesn't track sub-page history), so it stays visible
            // there too instead of being hidden alongside the hamburger.
            className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white/60 transition-colors hover:text-white active:scale-95 ${isSubPage ? "" : "md:hidden"}`}
          >
            <Icon path={isSubPage ? ICONS.back : ICONS.menu} size={15} />
          </button>

          {showQuoteEstimate ? (
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              <span
                className="text-[0.48rem] font-black uppercase leading-tight tracking-[0.16em] text-white/45"
                style={{ textAlign: "right" }}
              >
                Estimated
                <br />
                total
              </span>
              <span className="rounded-full bg-[#16a34a] px-3 py-1.5 text-[0.85rem] font-black leading-none tracking-[-0.03em] text-white shadow-[0_10px_26px_rgba(22,163,74,0.34)]">
                {quoteEstimate.formattedTotal}
              </span>
            </div>
          ) : (
            <Link
              href="/"
              className="truncate text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/40 md:hidden"
            >
              ValuePlus
            </Link>
          )}
        </div>

        <button
          onClick={onBellPress}
          className="relative grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.05] text-white/60 transition-colors hover:text-white active:scale-95"
          aria-label="Notifications"
        >
          <Icon path={ICONS.bell} size={15} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[0.5rem] font-black text-white">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
