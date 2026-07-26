"use client";

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Variant = "primary" | "secondary" | "light";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  // Every button that triggers a backend call renders this same spinner
  // while the request is in flight, instead of each call site rolling
  // its own <span animate-spin> — one consistent "please wait" signal
  // app-wide, and new buttons get it for free.
  loading?: boolean;
}

// Button element
type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

// Anchor element
type AnchorProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type Props = ButtonProps | AnchorProps;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildClassName(
  variant: Variant = "primary",
  size: Size = "md",
  extra = "",
): string {
  const base = "btn btn-base";

  const v =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : "btn-light";

  const s = `btn-${size}`;

  return [base, v, s, extra].filter(Boolean).join(" ");
}
// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  href,
  loading = false,
  ...rest
}: Props) {
  const cls = buildClassName(variant, size, className);

  // primary/accent sit on the bright solid accent fill with near-black
  // text, same as the login page's existing spinner — everything else
  // (secondary/ghost/light) sits on a dark or saturated-color background
  // with white text, so it needs the inverse (light-on-transparent) ring.
  const spinnerClass =
    variant === "primary"
      ? "border-[rgba(23,17,0,0.3)] border-t-[#171100]"
      : "border-white/25 border-t-white/85";

  const spinner = loading ? (
    <span
      className={`h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 ${spinnerClass}`}
      aria-hidden="true"
    />
  ) : null;

  if (href !== undefined) {
    return (
      <a
        href={href}
        className={cls}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <span className="btn-shimmer" aria-hidden="true" />
        <span className="btn-content">
          {spinner}
          {children}
        </span>
      </a>
    );
  }

  return (
    <button
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      disabled={loading || (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled}
      className={cls}
    >
      <span className="btn-shimmer" aria-hidden="true" />
      <span className="btn-content">
        {spinner}
        {children}
      </span>
    </button>
  );
}
