"use client";

import { useState } from "react";
import { Copy, Check, UserPlus } from "lucide-react";
import Title from "../../../../components/Title";
import Subtitle from "../../../../components/Subtitle";
import SectionLabel from "../../../../components/SectionLabel";
import ReferralDetailsModal from "../../../../components/ReferralDetailsModal";
import { notify } from "../../../../lib/snackbar";
import { useReferrals, type ReferralItem } from "../../../../hooks/useWallet";

const COMMISSION_PERCENT = 5;

function naira(value: string) {
  const n = Number(value);
  return `₦${Number.isNaN(n) ? 0 : n.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ReferralGroup {
  month: string;
  items: ReferralItem[];
}

// Newest-first already (see Referral.Meta.ordering server-side) — same
// "create a bucket the first time it's seen" grouping as Transactions.tsx,
// so both lists read consistently across the app.
function groupByMonth(items: ReferralItem[]): ReferralGroup[] {
  const groups = new Map<string, ReferralItem[]>();

  for (const item of items) {
    const month = new Date(item.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(item);
  }

  return Array.from(groups.entries()).map(([month, monthItems]) => ({
    month,
    items: monthItems,
  }));
}

function ReferralRow({
  item,
  onOpen,
}: {
  item: ReferralItem;
  onOpen: (item: ReferralItem) => void;
}) {
  const user = item.referred_user;
  const name = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "Deleted account";
  const initial = (user?.first_name.trim().charAt(0) || "?").toUpperCase();
  const isConfirmed = item.status === "confirmed";

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors duration-200 active:bg-white/[0.07]"
      style={{ background: "#1E1E1E", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {user?.avatar ? (
        // Referred users' avatars are already absolute ImageKit URLs —
        // next/image's own optimizer only accepts configured domains, and
        // this is a small enough thumbnail that skipping it costs nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt={name}
          className="h-11 w-11 shrink-0 rounded-full border object-cover"
          style={{ borderColor: "rgba(var(--vp-accent-rgb),0.3)" }}
        />
      ) : (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-black text-white"
          style={{
            borderColor: "rgba(var(--vp-accent-rgb),0.3)",
            background: "linear-gradient(145deg, #3a4763, #232e47)",
          }}
        >
          {initial}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="truncate text-[0.92rem] font-bold leading-tight text-white/85">
          {name}
        </p>
        <p className="mt-0.5 text-[0.62rem] text-white/40">
          {formatDate(item.created_at)}
        </p>
        <span
          className="mt-1 inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[0.44rem] font-black uppercase tracking-wide"
          style={
            isConfirmed
              ? {
                  background: "rgba(52,211,153,0.12)",
                  borderColor: "rgba(52,211,153,0.35)",
                  color: "#34D399",
                }
              : {
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.55)",
                }
          }
        >
          {item.status}
        </span>
      </div>

      <div className="shrink-0 text-right">
        <p
          className="text-[1rem] font-black leading-none"
          style={{ color: isConfirmed ? "#34D399" : "rgba(255,255,255,0.35)" }}
        >
          {isConfirmed ? naira(item.amount_earned) : "—"}
        </p>
      </div>
    </button>
  );
}

export default function ReferralsPage() {
  const { referrals, loading } = useReferrals();
  const [selected, setSelected] = useState<ReferralItem | null>(null);
  const [copied, setCopied] = useState(false);

  const groups = groupByMonth(referrals?.referrals ?? []);
  const email = referrals?.email ?? "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      notify("Referral email copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Could not copy — please copy it manually.", "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-6">
        <Title className="block">Refer &amp; Earn</Title>
        <Subtitle>
          Earn from every author who signs up with your email.
        </Subtitle>
      </div>

      {/* Hero — same accent-glow-on-dark card language as GlassCard/
          HeroCards elsewhere, not MyFund's purple/photo banner, since
          this needs to read as ValuePlus, not a reskinned copy. */}
      <div
        className="vp-card-in relative overflow-hidden rounded-3xl border p-6 text-center"
        style={{
          animationDelay: "40ms",
          borderColor: "rgba(var(--vp-accent-rgb),0.25)",
          background:
            "radial-gradient(120% 100% at 50% -10%, rgba(var(--vp-accent-rgb),0.22), transparent 60%), linear-gradient(180deg, #1B2340 0%, #10152A 100%)",
        }}
      >
        <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/45">
          Refer and earn
        </p>
        <p
          className="mt-1 text-5xl font-black leading-none"
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        >
          {COMMISSION_PERCENT}%
        </p>
        <p className="mx-auto mt-3 max-w-sm text-[0.78rem] leading-relaxed text-white/55">
          Earn {COMMISSION_PERCENT}% of the service cost for every author you
          refer, credited to your wallet the moment their payment is confirmed.
        </p>
      </div>

      {/* Share row */}
      <div
        className="vp-card-in mt-4 flex items-center gap-3 rounded-2xl border p-3.5"
        style={{
          animationDelay: "80ms",
          borderColor: "rgba(var(--vp-accent-rgb),0.2)",
          background: "rgba(var(--vp-accent-rgb),0.06)",
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "rgba(var(--vp-accent-rgb),0.16)",
            color: "rgb(var(--vp-accent-rgb))",
          }}
        >
          <UserPlus size={17} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.58rem] font-black uppercase tracking-wide text-white/40">
            Your referral email
          </p>
          <p className="truncate text-[0.88rem] font-bold text-white">
            {email || "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy referral email"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors active:bg-white/10"
          style={{ borderColor: "rgba(255,255,255,0.14)" }}
        >
          {copied ? (
            <Check size={16} className="text-[#34D399]" />
          ) : (
            <Copy size={15} className="text-white/70" />
          )}
        </button>
      </div>

      {/* My referrals list */}
      <div className="mt-6 flex flex-col gap-2">
        <SectionLabel>My Referrals ({referrals?.count ?? 0})</SectionLabel>

        {loading ? (
          <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
            Loading your referrals…
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-10 text-center text-[0.78rem] text-white/40">
            No referrals yet — share your email above to start earning.
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-3xl border border-white/6 bg-white/3 p-2.5">
            {groups.map((group) => (
              <div key={group.month} className="flex flex-col gap-1.5">
                <p
                  className="px-1 pb-0.5 text-[0.78rem] font-bold"
                  style={{ color: "rgb(var(--vp-accent-rgb))" }}
                >
                  {group.month}
                </p>
                <div className="flex flex-col gap-1.5">
                  {group.items.map((item) => (
                    <ReferralRow
                      key={item.id}
                      item={item}
                      onOpen={setSelected}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earned / pending summary */}
      {referrals && (
        <div
          className="vp-card-in mt-4 flex items-center justify-between rounded-2xl border px-5 py-4"
          style={{ borderColor: "rgba(var(--vp-accent-rgb),0.3)" }}
        >
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-wide text-white/40">
              Earned
            </p>
            <p
              className="mt-0.5 text-xl font-black"
              style={{ color: "#34D399" }}
            >
              {naira(referrals.total_earned)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.62rem] font-black uppercase tracking-wide text-white/40">
              Pending
            </p>
            <p className="mt-0.5 text-xl font-black text-white/50">
              {naira(referrals.pending_amount)}
            </p>
          </div>
        </div>
      )}

      <ReferralDetailsModal
        referral={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
