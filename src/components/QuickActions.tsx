"use client";

import { useState } from "react";
import {
  Landmark,
  ShieldCheck,
  UserPlus,
  MessageCircle,
  Flame,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  useBankAccount,
  useLocalBankAccounts,
  useReferrals,
} from "../hooks/useWallet";
import { useKYCProfile, type KYCStatus } from "../hooks/useKYC";
import { useMyBooks } from "../hooks/useMyBooks";

const KYC_QUICK_ACTION_BADGE: Record<Exclude<KYCStatus, "approved">, string> = {
  not_started: "NOT STARTED",
  pending: "PENDING",
  rejected: "REJECTED",
};

type Mode = "learner" | "publisher";

interface QuickAction {
  id: string;
  label: string;
  Icon: LucideIcon;
  badge?: string;
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
  const { accounts: bankAccounts } = useLocalBankAccounts();
  const { referrals } = useReferrals();
  const { profile: kycProfile } = useKYCProfile();
  const { books } = useMyBooks();

  const isBankLinked = bankAccounts.length > 0 || isLinked;

  // Once a bank account exists, there's nothing left to "add" — this row
  // drops out of Quick Actions entirely rather than switching to a
  // "linked" badge; Settings' "My Bank Accounts" row already shows that
  // status permanently.
  const bankAction: QuickAction[] = isBankLinked
    ? []
    : [{ id: "bank", label: "Add bank account", Icon: Landmark, badge: "NOT ADDED" }];

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
          },
        ];

  if (mode === "publisher") {
    const totalEarned = books.reduce((sum, b) => sum + Number(b.earned), 0);
    return [
      {
        id: "royalty",
        label: "Withdraw royalties",
        Icon: UserPlus,
        badge: naira(totalEarned),
      },
      ...bankAction,
      ...kycAction,
      { id: "streaks", label: "Streaks", Icon: Flame },
      { id: "message-admin", label: "Message Admin", Icon: MessageCircle },
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
    { id: "message-admin", label: "Message Admin", Icon: MessageCircle },
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
        <span className="shrink-0 whitespace-nowrap rounded-lg border border-white/10 bg-white/10 px-2.5 py-0.5 text-[0.6rem] font-black uppercase tracking-wide text-white/80">
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
          <div key={action.id} className="min-w-0" onClick={() => onNavigate(action.id)}>
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
