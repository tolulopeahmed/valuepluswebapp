"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Shrinks its content (via transform: scale, not font-size steps) just
// enough to fit its container's width — for spots where wrapping or
// clipping isn't acceptable and the text has to stay on one line and
// stay fully visible, even on narrow screens. scrollWidth is unaffected
// by transforms, so measuring the *unscaled* content against the
// container's actual width gives the exact ratio needed; re-measuring on
// resize keeps it correct as the container's own width changes.
export default function AutoFitText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const next = Math.min(1, container.clientWidth / content.scrollWidth);
      setScale((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
    });
  }, []);

  useEffect(() => {
    measure();

    const container = containerRef.current;
    const content = contentRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;

    if (resizeObserver) {
      if (container) resizeObserver.observe(container);
      if (content) resizeObserver.observe(content);
    }

    window.addEventListener("resize", measure);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, children]);

  return (
    <span
      ref={containerRef}
      className={`block max-w-full overflow-hidden ${className}`}
    >
      <span
        ref={contentRef}
        className="inline-flex origin-left items-center whitespace-nowrap"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </span>
    </span>
  );
}
