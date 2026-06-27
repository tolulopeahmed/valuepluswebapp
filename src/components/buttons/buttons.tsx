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
  ...rest
}: Props) {
  const cls = buildClassName(variant, size, className);

  if (href !== undefined) {
    return (
      <a
        href={href}
        className={cls}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <span className="btn-shimmer" aria-hidden="true" />
        <span className="btn-content">{children}</span>
      </a>
    );
  }

  return (
    <button
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      <span className="btn-shimmer" aria-hidden="true" />
      <span className="btn-content">{children}</span>
    </button>
  );
}
