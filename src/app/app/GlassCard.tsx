"use client";

import type { CSSProperties, ReactNode } from "react";

export const VP_CARD_BG = "#2D375A";

// Same family as the login page's own card backdrop (see the
// rgba(29,155,240,...) over #0d1a2b in src/app/login/page.tsx) — not the
// login page's outer margin gradient, which is nearly black and only
// reads as blue in the thin sliver around that card. Tuned down from
// that card's exact values (.16/.05 tint, #0d1a2b base) since the same
// fill reads noticeably brighter stretched across a full page than it
// does behind a small ~26rem card. "Bluer but darker": the earlier
// #081019 base was too neutral grey to read as blue at low lightness —
// swapped for a base where blue is the clearly dominant channel even at
// a lower overall lightness, so it reads bluer without getting brighter.
export const VP_APP_BG =
  "linear-gradient(160deg, rgba(29,155,240,.17), rgba(29,155,240,.06) 45%, rgba(255,255,255,.01) 100%), #040a26";

export default function GlassCard({
  children,
  className = "",
  accent = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.15rem] border transition-all duration-300 ${
        accent
          ? "border-[rgba(var(--vp-accent-rgb),0.18)]"
          : "border-white/0.06"
      } ${className}`}
      style={{
        background: `linear-gradient(180deg, #2F3A5E 0%, ${VP_CARD_BG} 55%, #29325A 100%)`,
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}
