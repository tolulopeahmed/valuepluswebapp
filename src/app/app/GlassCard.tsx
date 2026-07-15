"use client";

import type { CSSProperties, ReactNode } from "react";

export const VP_PAGE_BG = "#080d22";
export const VP_CARD_BG = "#2D375A";

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
          : "border-white/[0.06]"
      } ${className}`}
      style={{
        background: `linear-gradient(180deg, #2F3A5E 0%, ${VP_CARD_BG} 55%, #29325A 100%)`,
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}
