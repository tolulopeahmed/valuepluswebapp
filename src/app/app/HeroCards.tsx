"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Users, Wallet, TrendingUp } from "lucide-react";
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
  weeklyDelta: number;
}

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

// Renders a naira amount the way MyFund does: small ₦ symbol, small
// decimal places, big whole-number amount in between. Symbol/decimal
// sizes are in `em` so they scale automatically with whatever font-size
// the wrapping element uses — same component works at 55px and at 30px
// without any per-usage tuning.
function NairaAmount({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, decimal] = formatted.split(".");

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className="mr-1 text-[0.4em] font-black">₦</span>
      <span>{whole}</span>
      <span className="text-[0.4em] font-black">.{decimal}</span>
    </span>
  );
}

// Shared pill-button styling so every slide's CTA (Resume / Withdraw)
// looks and behaves identically — same gold fill, same tap spring.
function SlideCta({ label, onClick }: { label: string; onClick?: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="shrink-0"
    >
      <Button
        size="sm"
        variant="primary"
        onClick={onClick}
        className="w-auto items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wide"
        style={{
          backgroundColor: "rgb(var(--vp-accent-rgb))",
          color: "#171100",
          boxShadow: "0 10px 24px rgba(var(--vp-accent-rgb),0.35)",
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
    <GlassCard accent className="flex h-full flex-col p-5">
      <SectionLabel>{data.module}</SectionLabel>

      <MarqueeName
        text={data.title}
        className="mt-1 block max-w-full"
        textClassName="font-black leading-tight text-white"
        fadeColor="#2D375A"
        style={{ fontSize: 35, fontFamily: "PP Telegraf" }}
      />

      <p className="mt-1 text-[0.68rem] text-white/60">
        +{data.xpEarned} XP earned · {data.duration}
      </p>

      <div className="mt-4 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[rgb(var(--vp-accent-rgb))] shadow-[0_0_10px_rgba(var(--vp-accent-rgb),0.5)] transition-all duration-700"
              style={{ width: `${data.progress}%` }}
            />
          </div>

          <p
            className="mt-1.5 truncate text-[0.9rem] font-black text-white/45"
            style={{ fontFamily: "PP Telegraf", color: "#ffb546" }}
          >
            {data.progress}% complete
          </p>
        </div>

        <SlideCta label="Resume" onClick={onResume} />
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
    <GlassCard accent className="flex h-full flex-col p-5">
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
        className="mt-1 leading-none text-white"
        style={{ fontFamily: "Proxima Nova", fontSize: 55 }}
      >
        <NairaAmount value={data.totalEarned} />
      </p>

      <div className="mt-4 flex flex-1 items-end justify-between gap-3">
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

        <SlideCta label="Withdraw" onClick={onWithdraw} />
      </div>
    </GlassCard>
  );
}

// ── Publisher slide 1: total earnings ────────────────────────────
// Kept from the previous pass — publisher slides get their own design
// review later, but the container is already built to take more of them.
function EarningsCard({
  data,
  onWithdraw,
}: {
  data: PublisherStatsData;
  onWithdraw?: () => void;
}) {
  return (
    <GlassCard accent className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <SectionLabel>Total earned</SectionLabel>
        <span className="text-[rgb(var(--vp-accent-rgb))]">
          <Wallet size={16} strokeWidth={2} />
        </span>
      </div>

      <p className="mt-2 text-4xl font-black leading-none text-white md:text-3xl">
        <NairaAmount value={data.totalEarned} />
      </p>

      <div className="mt-4 flex flex-1 items-end justify-between">
        <p className="flex items-center gap-1 text-[0.68rem] text-[#4ade80]">
          <TrendingUp size={11} strokeWidth={2} />+{naira(data.weeklyDelta)}{" "}
          this week
        </p>

        <SlideCta label="Withdraw" onClick={onWithdraw} />
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
