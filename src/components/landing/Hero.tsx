"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Button from "../buttons/buttons";
import MarqueeName from "../MarqueeName";

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const heroChecks = [
  "No Degree or Experience Required.",
  "Learn the A—Z of Publishing.",
  "Publish Your First Book.",
];

const stats = [
  { value: 178, suffix: "", label: "Learners/Authors" },
  { value: 1954, suffix: "", label: "Completed Titles" },
  { value: 12, suffix: "", label: "Publishing Years" },
  { value: 1, suffix: "", label: "Account for Everything" },
];

const confetti = Array.from({ length: 28 }, (_, i) => i + 1);

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(value);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const target = countRef.current;
    if (!target) return;

    let animationFrame = 0;
    let fallbackTimer = 0;

    const runAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      setCount(0);

      fallbackTimer = window.setTimeout(() => {
        setCount(value);
      }, 1800);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        setCount(value);
        return;
      }

      const duration = 1300;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setCount(Math.round(value * eased));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animate);
        } else {
          window.clearTimeout(fallbackTimer);
          setCount(value);
        }
      };

      animationFrame = window.requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "80px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(fallbackTimer);
    };
  }, [value]);

  return (
    <span ref={countRef} className="stat-count-number">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <div className="verified-badge reveal-up">
      <span className="verified-badge-icon">
        <svg
          viewBox="0 0 24 24"
          width="37"
          height="37"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <path
            className="verified-bg-spin"
            fill="#1d9bf0"
            d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
          />
          <path
            fill="white"
            d="M9.5 16.5 6 13l1.42-1.42 2.08 2.09 7.08-7.09L18 8l-8.5 8.5z"
          />
        </svg>
      </span>
      <span className="verified-badge-text">The A—Z of Publishing</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-24 md:pb-20 md:pt-36">
      <div className="hero-concentric-glow" />

      {/* Drifting ambient orbs — give glass panels depth to refract */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="hero-glass-orb" />
        <div className="hero-glass-orb hero-glass-orb--cool" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-4 lg:grid-cols-[1.05fr_.95fr]">
        {/* ── Left ── */}
        <div className="relative z-10">
          <VerifiedBadge />

          <h1 className="display-heading reveal-up max-w-xl text-[clamp(2.75rem,8vw,4.5rem)] font-black leading-[0.9] tracking-[-0.04em] text-white">
            Learn Publishing;
            {/* On narrow screens this line is often wider than the viewport
                at its min font size — left to wrap naturally it breaks onto
                a 3rd line. MarqueeName measures itself and only kicks in
                when the text actually overflows its container, so it's a
                no-op wherever the line already fits (e.g. desktop). */}
            <MarqueeName
              text="Publish Your Book."
              className="mt-2"
              textClassName="text-vp-accent text-[clamp(2.75rem,8vw,4rem)] tracking-[-0.05em]"
            />
          </h1>

          <div className="reveal-up mt-5 space-y-2.5">
            {heroChecks.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-vp-accent/15 text-xs font-black text-vp-accent">
                  ✓
                </span>
                <p className="text-[0.95rem] leading-7 text-white/70">{item}</p>
              </div>
            ))}
          </div>

          <div className="reveal-up mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/pricing" variant="primary">
              Start Publishing Course
            </Button>
            <Button href="/getQuote" variant="secondary">
              I Have A Manuscript
            </Button>
          </div>

          <p className="reveal-up mt-4 text-[0.72rem] font-medium text-white/30">
            Pay in Naira or Dollars · Starts free · No card required
          </p>

          <div className="hero-stats-grid reveal-up mt-7">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <p>
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — portrait ── */}
        <div className="relative z-10 mx-auto w-full max-w-[34rem] lg:max-w-[42rem]">
          <div className="hero-portrait">
            <div className="hero-glow-rings" />
            <div className="confetti-field" aria-hidden="true">
              {confetti.map((i) => (
                <span key={i} className={`cf cf-${i}`} />
              ))}
            </div>
            <Image
              src="/images/logos/hero-author.png"
              alt="Published ValuePlus author holding her book"
              width={1000}
              height={1100}
              priority
              className="hero-author-image mt-[-2rem] w-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Path cards */}
      {/* Path cards */}
      <div className="relative z-20 mx-auto mt-1 max-w-7xl md:mt-28 lg:mt-32">
        <div className="hero-path-row">
          <a href="/pricing" className="path-card path-card-learn">
            <div className="path-icon">🎓</div>

            <div className="path-copy">
              <p>For Learners</p>
              <h3>Learn the A—Z of Publishing</h3>
              <span>
                Become a professional publisher in just 6 courses — publish your
                first book.
              </span>
            </div>

            <b>›</b>
          </a>

          <a href="/getQuote" className="path-card path-card-author">
            <div className="path-icon">🚀</div>

            <div className="path-copy">
              <p>For Authors</p>
              <h3>Get Your Book Published</h3>
              <span>
                Get your books published within a month — from manuscript to
                market.
              </span>
            </div>

            <b>›</b>
          </a>
        </div>
      </div>
    </section>
  );
}
