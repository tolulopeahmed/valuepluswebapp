"use client";

import { useState } from "react";
import {
  Landmark,
  ShieldCheck,
  UserPlus,
  Flame,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  useBankAccount,
  useBankAccounts,
  useReferrals,
  useWalletBalance,
} from "../hooks/useWallet";
import { useKYCProfile, type KYCStatus } from "../hooks/useKYC";

type Mode = "learner" | "publisher";
type BadgeTone = "neutral" | "warning" | "danger";

const KYC_QUICK_ACTION_BADGE: Record<Exclude<KYCStatus, "approved">, string> = {
  not_started: "NOT STARTED",
  pending: "PENDING",
  rejected: "REJECTED",
};

// Same tone Settings' StatusChip uses for this same status, so "Update
// KYC" reads consistently whether it's seen here or on the Settings row.
const KYC_QUICK_ACTION_TONE: Record<Exclude<KYCStatus, "approved">, BadgeTone> = {
  not_started: "neutral",
  pending: "warning",
  rejected: "danger",
};

const BADGE_TONE_STYLE: Record<BadgeTone, { background: string; borderColor: string; color: string }> = {
  neutral: {
    background: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.8)",
  },
  warning: {
    background: "rgba(var(--vp-accent-rgb),0.14)",
    borderColor: "rgba(var(--vp-accent-rgb),0.35)",
    color: "rgb(var(--vp-accent-rgb))",
  },
  danger: {
    background: "rgba(248,113,113,0.14)",
    borderColor: "rgba(248,113,113,0.35)",
    color: "#f87171",
  },
};

// lucide has no WhatsApp glyph — same local fill-based SVG duplicated in
// Sidebar.tsx/Settings.tsx/Transactions.tsx for the same reason.
function WhatsAppIcon({ size = 17 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16.02 4C9.4 4 4 9.33 4 15.9c0 2.1.56 4.15 1.62 5.95L4 28l6.32-1.58A12.17 12.17 0 0 0 16.02 28C22.65 28 28 22.67 28 16.1 28 9.53 22.65 4 16.02 4Zm0 21.86c-1.78 0-3.52-.47-5.03-1.36l-.36-.21-3.75.94 1-3.62-.24-.38a9.86 9.86 0 0 1-1.5-5.23c0-5.38 4.43-9.76 9.88-9.76 5.45 0 9.88 4.38 9.88 9.76s-4.43 9.86-9.88 9.86Z" />
      <path d="M21.42 18.55c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.09 3.17 5.07 4.45.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

interface QuickAction {
  id: string;
  label: string;
  Icon: LucideIcon | typeof WhatsAppIcon;
  badge?: string;
  badgeTone?: BadgeTone;
}

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

// Real per-user badges (referral earnings, publisher royalties) instead
// of the fixed ₦10,000/₦186,000 this used to show for every account — a
// fresh account now genuinely reads ₦0 here too, matching the Earn page.
function useQuickActions(mode: Mode): QuickAction[] {
  const { isLinked } = useBankAccount();
  // Same local accounts list Bank Accounts/Settings read — no create/
  // delete/list endpoint exists yet, so this is how "at least one bank
  // account added" is known here too, not just the real (still-empty)
  // backend account.
  const { accounts: bankAccounts } = useBankAccounts();
  const { referrals } = useReferrals();
  const { profile: kycProfile } = useKYCProfile();
  // The real wallet balance (see useWalletBalance's own docstring) — the
  // "Withdraw Earnings" badge used to sum books.earned, which had no
  // relationship to the actual Transaction ledger at all (same stale
  // number the Earn page's hero used to show before that got fixed too).
  const { balance: walletBalance } = useWalletBalance();

  const isBankLinked = bankAccounts.length > 0 || isLinked;

  // Once a bank account exists, there's nothing left to "add" — this row
  // drops out of Quick Actions entirely rather than switching to a
  // "linked" badge; Settings' "My Bank Accounts" row already shows that
  // status permanently.
  const bankAction: QuickAction[] = isBankLinked
    ? []
    : [
        {
          id: "bank",
          label: "Add Bank Account",
          Icon: Landmark,
          badge: "NOT ADDED",
        },
      ];

  // Same idea as the bank row — once KYC is approved there's nothing
  // left to nudge the user about here, so it drops out entirely rather
  // than showing an "approved" badge; Settings' row stays green/verified
  // permanently instead.
  const kycStatus = kycProfile?.status ?? "not_started";
  const kycAction: QuickAction[] =
    kycStatus === "approved"
      ? []
      : [
          {
            id: "kyc",
            label: "Update KYC",
            Icon: ShieldCheck,
            badge: KYC_QUICK_ACTION_BADGE[kycStatus],
            badgeTone: KYC_QUICK_ACTION_TONE[kycStatus],
          },
        ];

  if (mode === "publisher") {
    return [
      {
        id: "royalty",
        label: "Withdraw Earnings",
        Icon: UserPlus,
        badge: naira(walletBalance),
      },
      ...bankAction,
      ...kycAction,
      // No Streaks row here — streaks/XP are a learner-progress concept,
      // not relevant to the publisher dashboard.
      { id: "message-admin", label: "Message Admin", Icon: WhatsAppIcon },
    ];
  }

  return [
    {
      id: "refer",
      label: "Refer & Earn",
      Icon: UserPlus,
      badge: naira(Number(referrals?.total_earned ?? 0)),
    },
    ...bankAction,
    ...kycAction,
    { id: "streaks", label: "Streaks", Icon: Flame },
    { id: "message-admin", label: "Message Admin", Icon: WhatsAppIcon },
  ];
}

// Always show the "real" actions; Streaks, Message Admin (and anything else
// beyond this count) stay tucked behind the "N more" toggle.
const VISIBLE_COUNT = 3;

function ActionRow({ action, index }: { action: QuickAction; index: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{
        delay: shouldReduceMotion ? 0 : 0.04 * index,
        duration: 0.3,
      }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      className="flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left backdrop-blur-sm transition-colors duration-200 active:bg-white/8"
      style={{
        background:
          "linear-gradient(135deg, rgba(var(--vp-accent-rgb),0.14), rgba(var(--vp-accent-rgb),0.05))",
        borderColor: "rgba(var(--vp-accent-rgb),0.25)",
      }}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        style={{ color: "rgb(var(--vp-accent-rgb))" }}
      >
        <action.Icon size={17} strokeWidth={1.7} />
      </span>

      <span className="min-w-0 flex-1 truncate text-[0.85rem] font-bold text-white">
        {action.label}
      </span>

      {action.badge ? (
        <span
          className="shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-0.5 text-[0.6rem] font-black uppercase tracking-wide"
          style={BADGE_TONE_STYLE[action.badgeTone ?? "neutral"]}
        >
          {action.badge}
        </span>
      ) : (
        <span className="shrink-0 text-white/30">
          <ChevronRight size={16} strokeWidth={2} />
        </span>
      )}
    </motion.button>
  );
}

export default function QuickActions({
  mode,
  onNavigate,
}: {
  mode: Mode;
  onNavigate: (dest: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const actions = useQuickActions(mode);

  const visible = expanded ? actions : actions.slice(0, VISIBLE_COUNT);
  const hiddenCount = actions.length - VISIBLE_COUNT;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <AnimatePresence initial={false}>
        {visible.map((action, i) => (
          <div
            key={action.id}
            className="min-w-0"
            onClick={() => onNavigate(action.id)}
          >
            <ActionRow action={action} index={i} />
          </div>
        ))}
      </AnimatePresence>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex flex-col items-center gap-1.5 py-2 text-white/40 transition-colors hover:text-white/60"
        >
          <div className="flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-white/12" />
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown size={16} strokeWidth={2} />
            </motion.span>
            <span className="h-px flex-1 bg-white/12" />
          </div>

          <span className="text-[0.72rem] font-semibold">
            {expanded ? "Show less" : `${hiddenCount} more`}
          </span>
        </button>
      )}
    </div>
  );
}
