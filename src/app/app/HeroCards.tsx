"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Users, Wallet } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionLabel from "../../components/SectionLabel";
import MarqueeName from "../../components/MarqueeName";
import HeroSlider, { type HeroSlide } from "./HeroSlider";
import Button from "../../components/buttons/buttons";

type Mode = "learner" | "publisher";

export interface CurrentModuleData {
  module: string;
  title: string;
  progress: number;
  duration: string;
  xpEarned: number;
}

export interface ReferralStatsData {
  totalEarned: number;
  referralCount: number;
  perReferral: number;
}

export interface PublisherStatsData {
  totalEarned: number;
  // Total title count, including drafts — same count as the Publish
  // page's "N Titles" label (BOOKS.length there).
  titleCount: number;
}

// Renders a naira amount the way MyFund does: small ₦ symbol, small
// decimal places, big whole-number amount in between. Symbol/decimal
// sizes are in `em` so they scale automatically with whatever font-size
// the wrapping element uses — same component works at 55px and at 30px
// without any per-usage tuning.
function NairaAmount({
  value,
  className = "",
  bold = true,
}: {
  value: number;
  className?: string;
  bold?: boolean;
}) {
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, decimal] = formatted.split(".");
  const symbolWeight = bold ? "font-black" : "font-normal";

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className={`mr-1 text-[0.4em] ${symbolWeight}`}>₦</span>
      <span>{whole}</span>
      <span className={`text-[0.4em] ${symbolWeight}`}>.{decimal}</span>
    </span>
  );
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

// ── Learner slide 2: referral rewards (new) ──────────────────────
// Mirrors the module card's layout rhythm — eyebrow, big stat, supporting
// line, then a bottom row that ends in the CTA — so the two slides feel
// like the same family as you swipe between them. Withdraw sits bottom
// right, matching where Resume sits on slide 1.
function ReferralRewardsCard({
  data,
  onWithdraw,
}: {
  data: ReferralStatsData;
  onWithdraw?: () => void;
}) {
  return (
    <GlassCard accent className="flex h-full min-h-[9.5rem] flex-col p-3.5">
      <div className="flex items-center justify-between">
        <SectionLabel>Referral rewards</SectionLabel>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "rgba(var(--vp-accent-rgb),0.14)",
            color: "rgb(var(--vp-accent-rgb))",
          }}
        >
          <Users size={14} strokeWidth={2} />
        </span>
      </div>

      <p
        className="mt-1 font-bold leading-none text-white"
        style={{ fontFamily: "Proxima Nova", fontSize: 44 }}
      >
        <NairaAmount value={data.totalEarned} />
      </p>

      <div className="mt-2.5 flex flex-1 items-end justify-between gap-3">
        <div className="flex -space-x-2">
          {/* {Array.from({ length: avatarCount }).map((_, i) => (
            <span
              key={i}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[0.55rem] font-black text-white"
              style={{
                borderColor: "#2D375A",
                background: "linear-gradient(145deg, #3a4763, #232e47)",
              }}
            >
              {String.fromCharCode(65 + i)}
            </span>
          ))} */}
          <p
            className="mt-1.5 tracking-wide text-[0.9rem] text-white/90"
            style={{ fontFamily: "PP Telegraf" }}
          >
            {data.referralCount} REFERRALS
          </p>
        </div>

        <SlideCta label="Withdraw" onClick={onWithdraw} compact />
      </div>
    </GlassCard>
  );
}

// ── Publisher slide 1: total earnings ────────────────────────────
// Layout modeled on a MyFund "My Accounts" savings card: icon+label
// cluster top-left, a big amount dominating the card, then a supporting
// line bottom-left with a compact secondary CTA bottom-right — same
// brand colors/components as every other card here (GlassCard,
// SlideCta, NairaAmount), just this specific arrangement. Wider than
// tall, so no percentage pill and no extra min-height forcing it down.
function EarningsCard({
  data,
  onWithdraw,
}: {
  data: PublisherStatsData;
  onWithdraw?: () => void;
}) {
  return (
    <GlassCard accent className="flex h-full min-h-[9.5rem] flex-col p-3.5">
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "rgba(var(--vp-accent-rgb),0.14)",
            color: "rgb(var(--vp-accent-rgb))",
          }}
        >
          <Wallet size={14} strokeWidth={2} />
        </span>
        <SectionLabel style={{ marginBottom: 0 }}>Total earned</SectionLabel>
      </div>

      <p
        className="mt-1 text-5xl font-bold leading-none text-white md:text-4xl"
        style={{ fontFamily: "Proxima Nova" }}
      >
        <NairaAmount value={data.totalEarned} />
      </p>

      <div className="mt-2 flex items-end justify-between">
        <SectionLabel style={{ marginBottom: 0 }}>
          {data.titleCount} {data.titleCount === 1 ? "Title" : "Titles"}
        </SectionLabel>

        {/* Solid accent fill, same as Resume/Withdraw on the learner
            cards above — no variant/style override, just the SlideCta
            default (compact only, for the height match). */}
        <SlideCta label="Withdraw" onClick={onWithdraw} compact />
      </div>
    </GlassCard>
  );
}

// ── Container ─────────────────────────────────────────────────────
// The single thing HomeScreen renders. Swap `mode` and the whole deck
// swaps with it — add a new learner or publisher slide by pushing one
// more entry into the relevant array below, nothing else changes.
export default function HeroCards({
  mode,
  currentModule,
  referralStats,
  publisherStats,
  onResume,
  onWithdrawReferral,
  onWithdrawEarnings,
}: {
  mode: Mode;
  currentModule: CurrentModuleData;
  referralStats: ReferralStatsData;
  publisherStats: PublisherStatsData;
  onResume?: () => void;
  onWithdrawReferral?: () => void;
  onWithdrawEarnings?: () => void;
}) {
  const learnerSlides: HeroSlide[] = [
    {
      key: "module-progress",
      content: <ModuleProgressCard data={currentModule} onResume={onResume} />,
    },
    {
      key: "referral-rewards",
      content: (
        <ReferralRewardsCard
          data={referralStats}
          onWithdraw={onWithdrawReferral}
        />
      ),
    },
  ];

  const publisherSlides: HeroSlide[] = [
    {
      key: "earnings",
      content: (
        <EarningsCard data={publisherStats} onWithdraw={onWithdrawEarnings} />
      ),
    },
  ];

  return (
    <HeroSlider slides={mode === "learner" ? learnerSlides : publisherSlides} />
  );
}
