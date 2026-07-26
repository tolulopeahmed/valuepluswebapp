"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Sibling of AutoFitText for block-level, potentially multi-line text —
// AutoFitText forces a single non-wrapping line, which doesn't fit a
// book-cover title that's meant to wrap across a few lines.
//
// Owns its own line-clamp (via an explicit maxHeight budget, not
// Tailwind's line-clamp-N / -webkit-line-clamp) rather than relying on
// the caller's className for it — -webkit-box's overflow semantics turn
// out to be unreliable for detecting *width* overflow from a single
// unbreakable word, which is exactly the case this exists to catch.
//
// Font size is set as a fraction of the *container's* width
// (maxRatio/minRatio), so it stays proportional whether this renders on
// a 44px list thumbnail or a 160px modal cover, then stepped down from
// maxRatio until the rendered text fits both the container's width and
// the maxLines budget. Measured with word-breaking off, so a long
// unbroken word (e.g. "CONVERSION") keeps shrinking toward a size that
// fits it on one line instead of stopping the moment an ugly mid-word
// break happens to resolve the overflow at a bigger size — break-word
// only comes back as a last-resort safety net on the final rendered size.
export default function ShrinkToFitText({
  children,
  className = "",
  maxRatio,
  minRatio,
  maxLines = 3,
  lineHeight = 1.05,
}: {
  children: React.ReactNode;
  className?: string;
  maxRatio: number;
  minRatio: number;
  maxLines?: number;
  lineHeight?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const frameRef = useRef<number | null>(null);
  // Both derived together and applied only through the declarative style
  // prop below — fontSize was previously also poked at imperatively via
  // el.style during measurement, but maxHeight never was, so React's own
  // re-render (triggered by the state update) would patch fontSize back
  // in while silently never having set maxHeight at all, leaving the
  // clamp inactive. Keeping both in one state object and never touching
  // el.style outside the measurement pass itself avoids that split.
  const [settled, setSettled] = useState<{ fontSize: number; maxHeight: number } | null>(
    null,
  );

  const measure = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const el = ref.current;
      const container = el?.parentElement;
      if (!el || !container) return;

      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      // Measured with wrapping allowed but *no* forced mid-word
      // breaking — this way scrollWidth genuinely reflects "does the
      // longest unbroken run (a whole word) actually fit," so a long
      // single word keeps shrinking instead of stopping the instant a
      // mid-word break resolves the overflow at a bigger, uglier size.
      el.style.overflowWrap = "normal";
      el.style.wordBreak = "normal";

      const floor = containerWidth * minRatio;
      const step = Math.max(0.5, containerWidth * 0.006);
      let size = containerWidth * maxRatio;
      let guard = 0;

      while (guard < 80) {
        el.style.fontSize = `${size}px`;
        const maxHeight = size * lineHeight * maxLines;
        const fits = el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= maxHeight + 1;
        if (fits || size <= floor) break;
        size = Math.max(floor, size - step);
        guard += 1;
      }

      setSettled({ fontSize: size, maxHeight: size * lineHeight * maxLines });
    });
  }, [maxRatio, minRatio, maxLines, lineHeight]);

  useEffect(() => {
    measure();

    const el = ref.current;
    const container = el?.parentElement;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (resizeObserver && container) resizeObserver.observe(container);
    window.addEventListener("resize", measure);

    // The very first measurement can race real webfont loading (these
    // titles render in a bold/black weight) — a fallback font's glyph
    // widths are rarely identical, so re-measuring once the real font is
    // actually active catches anything the first pass got wrong.
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }

    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, children]);

  return (
    <p
      ref={ref}
      className={className}
      style={{
        fontSize: settled?.fontSize,
        maxHeight: settled?.maxHeight,
        lineHeight,
        overflow: "hidden",
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      {children}
    </p>
  );
}
