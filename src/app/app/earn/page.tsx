"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  Gift,
  Share2,
  Wallet,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import SectionLabel from "../../../components/SectionLabel";
import Button from "../../../components/buttons/buttons";
import Modal from "../../../components/Modal";
import GlassCard from "../GlassCard";
import { useAppShell } from "../AppShellContext";
import { BOOKS } from "../PublisherBooks";

type EarningStatus = "confirmed" | "pending";
type EarningSource = "referral" | "book-sale";

interface Earning {
  id: string;
  source: EarningSource;
  title: string;
  subtitle: string;
  date: string;
  status: EarningStatus;
  amount: number;
  Icon: LucideIcon;
}

interface EarningGroup {
  month: string;
  items: Earning[];
}

// Swap this for the real earnings endpoint once it's wired up — shape is
// deliberately flat so a fetched payload can map to it 1:1. Total earned
// and pending are derived from this list below, never hand-entered, so
// the hero card can never drift out of sync with the transactions list.
const EARNINGS: EarningGroup[] = [
  {
    month: "July 2026",
    items: [
      {
        id: "e1",
        source: "book-sale",
        title: "Book Sale",
        subtitle: "Confluence: A Life Story",
        date: "Jul 15, 2026 · 10:20 AM",
        status: "confirmed",
        amount: 12500,
        Icon: BookOpen,
      },
      {
        id: "e2",
        source: "referral",
        title: "Referral Reward",
        subtitle: "Chidi O. joined via your link",
        date: "Jul 12, 2026 · 1:53 PM",
        status: "confirmed",
        amount: 5000,
        Icon: Users,
      },
      {
        id: "e3",
        source: "book-sale",
        title: "Book Sale",
        subtitle: "Design: Inside and Cover",
        date: "Jul 10, 2026 · 4:05 PM",
        status: "pending",
        amount: 18000,
        Icon: BookOpen,
      },
    ],
  },
  {
    month: "June 2026",
    items: [
      {
        id: "e4",
        source: "referral",
        title: "Referral Reward",
        subtitle: "Amaka B. joined via your link",
        date: "Jun 28, 2026 · 9:15 AM",
        status: "confirmed",
        amount: 5000,
        Icon: Users,
      },
      {
        id: "e5",
        source: "book-sale",
        title: "Book Sale",
        subtitle: "Foundations: A–Z of Publishing",
        date: "Jun 22, 2026 · 6:40 PM",
        status: "confirmed",
        amount: 9500,
        Icon: BookOpen,
      },
    ],
  },
];

const ALL_EARNINGS = EARNINGS.flatMap((g) => g.items);
const TOTAL_EARNED = ALL_EARNINGS.filter(
  (e) => e.status === "confirmed",
).reduce((sum, e) => sum + e.amount, 0);

const STATUS_STYLES: Record<
  EarningStatus,
  { bg: string; border: string; text: string }
> = {
  confirmed: {
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.35)",
    text: "#34D399",
  },
  pending: {
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.14)",
    text: "rgba(255,255,255,0.55)",
  },
};

// Renders ₦ and the decimal tail smaller than the whole-number amount, in
// `em` units so one component works at hero size and at row size alike.
function NairaAmount({
  value,
  className = "",
  bold = true,
}: {
  value: number;
  className?: string;
  bold?: boolean;
}) {
  const [whole, decimal] = value.toFixed(2).split(".");
  const symbolWeight = bold ? "font-black" : "font-normal";
  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className={`mr-0.5 text-[0.5em] ${symbolWeight}`}>₦</span>
      <span>{Number(whole).toLocaleString()}</span>
      <span className={`text-[0.5em] ${symbolWeight}`}>.{decimal}</span>
    </span>
  );
}

// ── Hero: total earned up top; bottom row holds the referral/book counts
// on the left and a raised QuickSave-style Withdraw pill pinned to the
// bottom-right with proper inset padding, like the MyFund reference.
// Same content as the homepage's publisher EarningsCard (HeroCards.tsx)
// — icon+label cluster top-left, big regular-weight Proxima Nova amount,
// a "N Titles" line bottom-left (BOOKS.length, same count as the Publish
// page), same button color/radius — not just the same look, the same
// container end to end. ──
function EarningsHero({ onWithdraw }: { onWithdraw?: () => void }) {
  return (
    <GlassCard accent className="flex min-h-[9.5rem] flex-col p-3.5">
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
        <NairaAmount value={TOTAL_EARNED} />
      </p>

      {/* Bottom row — stats left, Withdraw pill right, both sitting on
          the card's own padding so the inset feels deliberate like the
          reference's QuickSave corner. */}
      <div className="mt-2 flex items-end justify-between gap-3">
        <SectionLabel style={{ marginBottom: 0 }}>
          {BOOKS.length} {BOOKS.length === 1 ? "Title" : "Titles"}
        </SectionLabel>

        <Button
          variant="primary"
          size="sm"
          onClick={onWithdraw}
          className="shrink-0 items-center gap-1.5 whitespace-nowrap px-5 py-2.5 text-[0.85rem] font-bold"
          style={{
            // Solid accent fill, same as Resume/Withdraw on the learner
            // home cards — .btn-primary's own background/color/shadow
            // already do that, so no color override here anymore. Just
            // the sizing: this button is short (2.1rem), so var(--r-md)
            // — sized for the taller default .btn-sm — would sit near
            // half its height and still read as a pill; var(--r-sm)
            // keeps the same proportional look at this smaller scale.
            minHeight: "2.1rem",
            padding: "0.5rem 1rem",
            borderRadius: "var(--r-sm)",
          }}
        >
          <DollarSign size={15} strokeWidth={2.5} />
          Withdraw
        </Button>
      </div>
    </GlassCard>
  );
}

// ── Refer & Earn CTA — sits between the hero and the transactions list.
// In Publisher mode it becomes a "Share Page Link" CTA (sharing their
// bookshelf/product links matters more than referrals there). ──
function ReferAndEarnButton() {
  const { mode } = useAppShell();
  const isPublisher = mode === "publisher";

  return (
    <div className="flex justify-center">
      <Button variant="primary" size="md">
        {isPublisher ? (
          <Share2 size={16} strokeWidth={2.25} />
        ) : (
          <Gift size={16} strokeWidth={2.25} />
        )}
        {isPublisher ? "Share Page Link" : <>Refer &amp; Earn</>}
      </Button>
    </div>
  );
}

function EarningRow({
  earning,
  onOpen,
}: {
  earning: Earning;
  onOpen: (e: Earning) => void;
}) {
  const status = STATUS_STYLES[earning.status];

  return (
    <button
      type="button"
      onClick={() => onOpen(earning)}
      className="flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors duration-200 active:bg-white/[0.07]"
      style={{
        background: "#1E1E1E",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.16)",
          borderColor: "rgba(var(--vp-accent-rgb),0.3)",
        }}
      >
        <earning.Icon
          size={18}
          strokeWidth={1.8}
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p
          className="truncate text-[1.05rem] font-bold leading-tight text-white/75"
          style={{ marginBottom: -3 }}
        >
          {earning.title}
        </p>
        <p className="mt-1 truncate text-[0.6rem] text-white/40">
          {earning.subtitle}
        </p>
        <span
          className="mt-1 inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[0.44rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {earning.status}
        </span>
      </div>

      <div className="flex shrink-0 items-center">
        <NairaAmount
          value={earning.amount}
          className="text-right text-[1.1rem] font-black leading-none"
        />
      </div>
    </button>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        last ? "" : "border-b border-white/6"
      }`}
    >
      <span className="text-[0.62rem] uppercase tracking-wide text-white/40">
        {label}
      </span>
      <span className="text-[0.78rem] font-semibold text-white/85">
        {value}
      </span>
    </div>
  );
}

function EarningDetailsModal({
  earning,
  onClose,
}: {
  earning: Earning | null;
  onClose: () => void;
}) {
  if (!earning) return null;
  const status = STATUS_STYLES[earning.status];

  return (
    <Modal open={!!earning} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
          style={{ background: status.bg, borderColor: status.border }}
        >
          <earning.Icon
            size={22}
            strokeWidth={1.8}
            style={{ color: status.text }}
          />
        </div>

        <NairaAmount
          value={earning.amount}
          className="text-4xl font-black leading-none text-white"
        />

        <p className="mt-3 text-[0.95rem] font-semibold text-white/90">
          {earning.title}
        </p>
        <p className="mt-1 text-[0.72rem] text-white/45">{earning.subtitle}</p>

        <span
          className="mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {earning.status}
        </span>

        <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/3 px-4">
          <DetailRow
            label="Source"
            value={earning.source === "referral" ? "Referral" : "Book sale"}
          />
          <DetailRow label="Date" value={earning.date} />
          <DetailRow
            label="Reference ID"
            value={`ERN-${earning.id.replace(/\D/g, "").padStart(6, "0")}`}
            last
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl py-3 text-sm font-bold"
          style={{
            background: "rgb(var(--vp-accent-rgb))",
            color: "#171100",
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

// ── All earnings — every referral reward and book sale, grouped by month ─
function AllEarningsSection({ onSelect }: { onSelect: (e: Earning) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>All earnings</SectionLabel>

      <div className="flex flex-col gap-3 rounded-3xl border border-white/6 bg-white/3 p-2.5">
        {EARNINGS.map((group) => (
          <div key={group.month} className="flex flex-col gap-1.5">
            <p
              className="px-1 pb-0.5 text-[0.78rem] font-bold"
              style={{ color: "rgb(var(--vp-accent-rgb))" }}
            >
              {group.month}
            </p>
            <div className="flex flex-col gap-1.5">
              {group.items.map((earning) => (
                <EarningRow
                  key={earning.id}
                  earning={earning}
                  onOpen={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EarnPage() {
  const [selected, setSelected] = useState<Earning | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="vp-card-in">
        <Title className="block">Earn</Title>
        <Subtitle>Earn rewards sharing ValuePlus with friends</Subtitle>
      </div>

      <div className="vp-card-in" style={{ animationDelay: "60ms" }}>
        <EarningsHero onWithdraw={() => console.log("Withdraw clicked")} />
      </div>

      <div className="vp-card-in" style={{ animationDelay: "100ms" }}>
        <ReferAndEarnButton />
      </div>

      <div className="vp-card-in" style={{ animationDelay: "140ms" }}>
        <AllEarningsSection onSelect={setSelected} />
      </div>

      <EarningDetailsModal
        earning={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
