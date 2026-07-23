"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import GlassCard from "./GlassCard";
import SectionLabel from "../../components/SectionLabel";
import MarqueeName from "../../components/MarqueeName";
import Button from "../../components/buttons/buttons";

export interface CurrentModuleData {
  module: string;
  title: string;
  progress: number;
  duration: string;
  xpEarned: number;
}

// Shared pill-button styling so every slide's CTA (Resume / Withdraw)
// looks and behaves identically — same gold fill, same tap spring.
function SlideCta({
  label,
  onClick,
  variant = "primary",
  compact = false,
  style,
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  compact?: boolean;
  style?: CSSProperties;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="shrink-0"
    >
      <Button
        size="sm"
        variant={variant}
        onClick={onClick}
        // No rounded-* override — falls back to .btn-base's own
        // var(--r-md), the same radius every other primary/secondary
        // button in the app uses, instead of a one-off pill shape.
        className="w-auto items-center gap-1.5 whitespace-nowrap text-xs font-black uppercase tracking-wide"
        style={{
          // .btn-sm's own padding/min-height live in globals.css outside
          // any @layer, so they beat Tailwind's layered px/py utilities
          // regardless of specificity — inline style is the only thing
          // that reliably overrides it for the compact variant. Radius
          // also needs its own override here: var(--r-md) (0.95rem) was
          // sized for the taller default .btn-sm (2.75rem) — on this
          // much shorter 2.1rem button the same radius is close to half
          // the height, so it still reads as a pill. var(--r-sm)
          // (0.65rem) keeps the same proportional "rounded corner, not
          // pill" look at this smaller scale.
          ...(compact
            ? {
                minHeight: "2.1rem",
                padding: "0.5rem 1rem",
                borderRadius: "var(--r-sm)",
              }
            : {}),
          ...(variant === "primary"
            ? {
                backgroundColor: "rgb(var(--vp-accent-rgb))",
                color: "#171100",
                boxShadow: "0 10px 24px rgba(var(--vp-accent-rgb),0.35)",
              }
            : {}),
          ...style,
        }}
      >
        {label}
      </Button>
    </motion.div>
  );
}

// ── Learner slide 1: current module progress ────────────────────
function ModuleProgressCard({
  data,
  onResume,
}: {
  data: CurrentModuleData;
  onResume?: () => void;
}) {
  return (
    <GlassCard accent className="flex h-full min-h-[9.5rem] flex-col p-3.5">
      <SectionLabel>{data.module}</SectionLabel>

      <MarqueeName
        text={data.title}
        className="mt-1 block max-w-full"
        textClassName="font-black leading-tight text-white"
        fadeColor="#2D375A"
        style={{ fontSize: 35, fontFamily: "PP Telegraf" }}
      />

      <div className="mt-2.5 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[rgb(var(--vp-accent-rgb))] shadow-[0_0_10px_rgba(var(--vp-accent-rgb),0.5)] transition-all duration-700"
              style={{ width: `${data.progress}%` }}
            />
          </div>

          <p
            className="mt-1.5 truncate text-[0.9rem] font-black text-white/45"
            style={{
              fontFamily: "PP Telegraf",
              color: "rgb(var(--vp-accent-rgb))",
            }}
          >
            {data.progress}% complete
          </p>
        </div>

        <SlideCta label="Resume" onClick={onResume} compact />
      </div>
    </GlassCard>
  );
}

// ── Container ─────────────────────────────────────────────────────
// The single thing HomeScreen renders — learner-only now. This used to
// swap between two slides (module progress + referral rewards) via
// HeroSlider, but "total earned" already duplicates the Earn tab's whole
// reason for existing (same as Publisher's now-removed EarningsCard), so
// that slide — and the slider it needed just to hold two cards — is gone.
// Just the module-progress card, direct.
export default function HeroCards({
  currentModule,
  onResume,
}: {
  currentModule: CurrentModuleData;
  onResume?: () => void;
}) {
  return <ModuleProgressCard data={currentModule} onResume={onResume} />;
}
