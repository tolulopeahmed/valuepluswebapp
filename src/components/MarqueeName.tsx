"use client";

import { useRef, useState, useEffect, type CSSProperties } from "react";

interface MarqueeStyle extends CSSProperties {
  "--marquee-distance"?: string;
}

export default function MarqueeName({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const check = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;
      const diff = t.scrollWidth - c.clientWidth;
      setOverflow(diff > 4);
      setDistance(diff + 24);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  const spanStyle: MarqueeStyle | undefined = overflow
    ? {
        animation: `marquee-scroll 6s ease-in-out infinite`,
        "--marquee-distance": `-${distance}px`,
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ maxWidth: "100%" }}
    >
      <span
        ref={textRef}
        className="inline-block whitespace-nowrap"
        style={spanStyle}
      >
        {text}
      </span>
      {overflow && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{
            background: "linear-gradient(to right, transparent, #070b12)",
          }}
        />
      )}
      <style jsx>{`
        @keyframes marquee-scroll {
          0%,
          15% {
            transform: translateX(0);
          }
          50%,
          65% {
            transform: translateX(var(--marquee-distance));
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
