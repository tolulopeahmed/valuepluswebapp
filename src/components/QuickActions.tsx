"use client";

import { useState } from "react";

function Icon({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  play: "M5 3l14 9-14 9V3z",
  trophy:
    "M8 21h8 M12 17v4 M17 4H7v5a5 5 0 0 0 10 0V4z M17 5.5h2.5a2.5 2.5 0 0 1 0 5H17 M7 5.5H4.5a2.5 2.5 0 0 0 0 5H7",
  refer:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  fire: "M12 2c0 0-5 4-5 9a5 5 0 0 0 10 0c0-5-5-9-5-9z",
  withdraw: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  help: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01",
  chevronR: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
};

type Tone = "default" | "gold" | "green";
type Mode = "learner" | "publisher";

interface ActionItem {
  icon: string;
  label: string;
  value?: string;
  tone?: Tone;
  onClick?: () => void;
}

function QuickActionRow({
  icon,
  label,
  value,
  tone = "default",
  onClick,
}: ActionItem) {
  const valueClass =
    tone === "gold"
      ? "text-[rgb(239,199,0)]"
      : tone === "green"
        ? "text-[#4ade80]"
        : "text-white/40";
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.06]"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/60">
        <Icon path={icon} size={15} />
      </span>
      <span className="flex-1 text-[0.78rem] font-black text-white/85">
        {label}
      </span>
      {value && (
        <span className={`text-[0.62rem] font-black ${valueClass}`}>
          {value}
        </span>
      )}
      <Icon path={ICONS.chevronR} size={13} />
    </button>
  );
}

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function QuickActions({
  mode,
  onNavigate,
}: {
  mode: Mode;
  onNavigate?: (dest: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const go = (dest: string) => () => onNavigate?.(dest);

  const learnerActions: ActionItem[] = [
    {
      icon: ICONS.play,
      label: "Continue where you left off",
      value: "Module 3",
      tone: "gold",
      onClick: go("resume-lesson"),
    },
    {
      icon: ICONS.trophy,
      label: "View certificates",
      onClick: go("certificates"),
    },
    { icon: ICONS.refer, label: "Study community", onClick: go("community") },
    {
      icon: ICONS.fire,
      label: "Streak freeze",
      value: "1 left",
      onClick: go("streak-freeze"),
    },
  ];

  const publisherActions: ActionItem[] = [
    {
      icon: ICONS.withdraw,
      label: "Request payout",
      value: naira(103247),
      tone: "gold",
      onClick: go("withdraw"),
    },
    { icon: ICONS.book, label: "Start a new book", onClick: go("new-book") },
    {
      icon: ICONS.refer,
      label: "Refer & earn",
      value: "₦500 each",
      tone: "green",
      onClick: go("refer"),
    },
    {
      icon: ICONS.help,
      label: "Talk to publishing support",
      onClick: go("support"),
    },
  ];

  const actions = mode === "learner" ? learnerActions : publisherActions;
  const visible = actions.slice(0, 3);
  const hidden = actions.slice(3);
  const hasHidden = hidden.length > 0;

  return (
    <div className="flex flex-col gap-2">
      {visible.map((a, i) => (
        <QuickActionRow key={i} {...a} />
      ))}

      {hasHidden && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: expanded ? `${hidden.length * 60}px` : "0px" }}
        >
          <div className="flex flex-col gap-2 pt-2">
            {hidden.map((a, i) => (
              <QuickActionRow key={i} {...a} />
            ))}
          </div>
        </div>
      )}

      {hasHidden && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center justify-center gap-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.1em] text-white/40 transition-colors hover:text-white/70"
        >
          <span className="h-px flex-1 bg-white/10" />
          <span
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          >
            <Icon path={ICONS.chevronDown} size={13} />
          </span>
          {expanded ? "Show less" : `${hidden.length} more`}
          <span className="h-px flex-1 bg-white/10" />
        </button>
      )}
    </div>
  );
}
