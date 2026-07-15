"use client";

import { Landmark, Trophy, UserPlus, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

type Mode = "learner" | "publisher";

interface QuickAction {
  id: string;
  label: string;
  Icon: LucideIcon;
  badge: string;
  badgeVariant: "neutral" | "warning" | "success";
}

const LEARNER_ACTIONS: QuickAction[] = [
  {
    id: "bank",
    label: "Add bank account",
    Icon: Landmark,
    badge: "GTBANK",
    badgeVariant: "neutral",
  },
  {
    id: "kyc",
    label: "Update KYC",
    Icon: Trophy,
    badge: "NOT YET STARTED",
    badgeVariant: "warning",
  },
  {
    id: "refer",
    label: "Refer & Earn",
    Icon: UserPlus,
    badge: "₦10,000",
    badgeVariant: "success",
  },
];

// Placeholder set — publisher pass comes later. Kept structurally
// identical so swapping content in is a one-line change.
const PUBLISHER_ACTIONS: QuickAction[] = [
  {
    id: "bank",
    label: "Add bank account",
    Icon: Landmark,
    badge: "GTBANK",
    badgeVariant: "neutral",
  },
  {
    id: "kyc",
    label: "Update KYC",
    Icon: Trophy,
    badge: "NOT YET STARTED",
    badgeVariant: "warning",
  },
  {
    id: "royalty",
    label: "Withdraw royalties",
    Icon: UserPlus,
    badge: "₦186,000",
    badgeVariant: "success",
  },
];

const BADGE_STYLES: Record<QuickAction["badgeVariant"], string> = {
  neutral: "bg-white/[0.08] text-white/55",
  warning: "bg-[#D3743E] text-white",
  success: "bg-[#CFE8D1] text-[#1F5C34]",
};

export default function QuickActions({
  mode,
  onNavigate,
}: {
  mode: Mode;
  onNavigate: (dest: string) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const actions = mode === "learner" ? LEARNER_ACTIONS : PUBLISHER_ACTIONS;

  return (
    <div className="flex flex-col gap-2.5">
      {actions.map((action, i) => (
        <motion.button
          key={action.id}
          type="button"
          onClick={() => onNavigate(action.id)}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: shouldReduceMotion ? 0 : 0.05 * i,
            duration: 0.35,
          }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.045] px-3.5 py-3 text-left backdrop-blur-sm transition-colors duration-200 active:bg-white/[0.07]"
        >
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "rgba(var(--vp-accent-rgb),0.14)",
              color: "rgb(var(--vp-accent-rgb))",
            }}
          >
            <action.Icon size={18} strokeWidth={1.8} />
          </span>

          <span className="min-w-0 flex-1 truncate text-[0.85rem] font-bold text-white">
            {action.label}
          </span>

          <span
            className={`flex-shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wide ${
              BADGE_STYLES[action.badgeVariant]
            }`}
          >
            {action.badge}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
