"use client";

import { useState } from "react";
import {
  Landmark,
  Trophy,
  UserPlus,
  MessageCircle,
  Flame,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Mode = "learner" | "publisher";

interface QuickAction {
  id: string;
  label: string;
  Icon: LucideIcon;
  badge?: string;
}

const LEARNER_ACTIONS: QuickAction[] = [
  { id: "refer", label: "Refer & Earn", Icon: UserPlus, badge: "₦10,000" },
  { id: "bank", label: "Add bank account", Icon: Landmark, badge: "GTBANK" },
  { id: "kyc", label: "Update KYC", Icon: Trophy, badge: "NOT YET STARTED" },
  { id: "streaks", label: "Streaks", Icon: Flame },
  { id: "message-admin", label: "Message Admin", Icon: MessageCircle },
];

// Placeholder set — publisher pass comes later. Kept structurally
// identical so swapping content in is a one-line change.
const PUBLISHER_ACTIONS: QuickAction[] = [
  {
    id: "royalty",
    label: "Withdraw royalties",
    Icon: UserPlus,
    badge: "₦186,000",
  },
  { id: "bank", label: "Add bank account", Icon: Landmark, badge: "GTBANK" },
  { id: "kyc", label: "Update KYC", Icon: Trophy, badge: "NOT YET STARTED" },
  { id: "streaks", label: "Streaks", Icon: Flame },
  { id: "message-admin", label: "Message Admin", Icon: MessageCircle },
];

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
      className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left backdrop-blur-sm transition-colors duration-200 active:bg-white/8"
      style={{
        background:
          "linear-gradient(135deg, rgba(var(--vp-accent-rgb),0.14), rgba(var(--vp-accent-rgb),0.05))",
        borderColor: "rgba(var(--vp-accent-rgb),0.25)",
      }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center"
        style={{ color: "rgb(var(--vp-accent-rgb))" }}
      >
        <action.Icon size={19} strokeWidth={1.7} />
      </span>

      <span className="min-w-0 flex-1 truncate text-[0.85rem] font-bold text-white">
        {action.label}
      </span>

      {action.badge ? (
        <span className="shrink-0 whitespace-nowrap rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wide text-white/80">
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
  const actions = mode === "learner" ? LEARNER_ACTIONS : PUBLISHER_ACTIONS;

  const visible = expanded ? actions : actions.slice(0, VISIBLE_COUNT);
  const hiddenCount = actions.length - VISIBLE_COUNT;

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {visible.map((action, i) => (
          <div key={action.id} onClick={() => onNavigate(action.id)}>
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
