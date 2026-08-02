"use client";

// Explicit back navigation for the storefront pages — unlike /app/* pages,
// which already get one automatically from the dashboard shell's own
// Header (see components/Header.tsx's isSubPage logic), the public
// site's Navbar has no such affordance: it's the same generic nav on
// every page, marketing pages included, where a back button wouldn't
// make sense. These are deep-funnel pages a visitor reaches from
// elsewhere (a shared book link, the cart, ...), so they get their own.
//
// Defaults to router.back() (works for anywhere a visitor arrived
// from); pass `href` when the destination is actually deterministic
// (checkout always came from the cart) rather than relying on browser
// history, which breaks on a bookmarked/shared/refreshed URL.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
  href,
  label = "Back",
  className = "",
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const classes = `inline-flex items-center gap-1.5 text-[0.8rem] font-bold text-white/55 transition-colors hover:text-white active:scale-[0.98] ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        <ArrowLeft size={16} strokeWidth={2.5} />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={classes}>
      <ArrowLeft size={16} strokeWidth={2.5} />
      {label}
    </button>
  );
}
