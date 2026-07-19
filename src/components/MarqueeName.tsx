"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

interface MarqueeStyle extends CSSProperties {
  "--marquee-distance"?: string;
  "--marquee-duration"?: string;
}

export default function MarqueeName({
  text,
  className = "",
  textClassName = "",
  fadeColor = "rgba(7,11,18,0.96)",
  style,
}: {
  text: string;
  className?: string;
  textClassName?: string;
  fadeColor?: string;
  style?: CSSProperties;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);

  const [marquee, setMarquee] = useState({
    overflow: false,
    distance: 0,
  });

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;

      const container = containerRef.current;
      const textEl = textRef.current;

      if (!container || !textEl) return;

      const diff = textEl.scrollWidth - container.clientWidth;

      const next = {
        overflow: diff > 4,
        distance: Math.max(0, diff + 28),
      };

      setMarquee((prev) => {
        if (
          prev.overflow === next.overflow &&
          prev.distance === next.distance
        ) {
          return prev;
        }

        return next;
      });
    });
  }, []);

  useEffect(() => {
    scheduleMeasure();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleMeasure)
        : null;

    const container = containerRef.current;
    const textEl = textRef.current;

    if (resizeObserver) {
      if (container) resizeObserver.observe(container);
      if (textEl) resizeObserver.observe(textEl);
    }

    window.addEventListener("resize", scheduleMeasure);

    if ("fonts" in document) {
      document.fonts?.ready?.then(scheduleMeasure).catch(() => undefined);
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [text, scheduleMeasure]);

  const duration = Math.min(10, Math.max(5.8, marquee.distance / 18));

  const spanStyle: MarqueeStyle = {
    ...style,
    ...(marquee.overflow
      ? {
          animation:
            "marquee-name-scroll var(--marquee-duration) ease-in-out 0.45s infinite",
          "--marquee-distance": `-${marquee.distance}px`,
          "--marquee-duration": `${duration}s`,
        }
      : {}),
  };

  return (
    <span
      ref={containerRef}
      className={`relative block max-w-full overflow-hidden ${className}`}
    >
      <span
        ref={textRef}
        className={`marquee-name-text inline-block whitespace-nowrap ${textClassName}`}
        style={spanStyle}
      >
        {text}
      </span>

      {marquee.overflow && (
        <span
          className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{
            background: `linear-gradient(to right, transparent, ${fadeColor})`,
          }}
        />
      )}

      <style jsx>{`
        @keyframes marquee-name-scroll {
          0%,
          12% {
            transform: translateX(0);
          }

          88%,
          100% {
            transform: translateX(var(--marquee-distance));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-name-text {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </span>
  );
}
