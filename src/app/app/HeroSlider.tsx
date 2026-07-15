"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface HeroSlide {
  key: string;
  content: React.ReactNode;
}

// Generic, mode-agnostic slide track. Auto-advances on mobile only,
// pauses for 15s after a manual swipe/dot-tap, and only shows pagination
// dots once there's more than one slide. Both behaviors switch on
// automatically the moment a caller passes a longer `slides` array — no
// changes needed here to support a 2nd, 3rd, or 4th slide.
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pausedUntil = useRef(0);
  const showDots = slides.length > 1;

  const scrollToIndex = useCallback((idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, []);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(slides.length - 1, Math.max(0, idx)));
  };

  useEffect(() => {
    if (!showDots) return;

    const iv = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      const el = trackRef.current;
      if (!el || window.innerWidth >= 768) return;

      const next =
        (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length;

      scrollToIndex(next);
    }, 10000);

    return () => clearInterval(iv);
  }, [slides.length, scrollToIndex, showDots]);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => {
          pausedUntil.current = Date.now() + 15000;
        }}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-2 md:items-stretch md:overflow-visible lg:grid-cols-4"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            className="vp-card-in w-full flex-shrink-0 snap-center md:w-auto"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {showDots && (
        <div className="mt-2 flex justify-center gap-1.5 md:hidden">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              onClick={() => {
                pausedUntil.current = Date.now() + 15000;
                scrollToIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-4 bg-[rgb(var(--vp-accent-rgb))]"
                  : "w-1.5 bg-white/15"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
