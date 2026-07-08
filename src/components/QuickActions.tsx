"use client";

import { useState } from "react";
import Button from "./buttons/buttons";

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
        : "text-white/48";

  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      onClick={onClick}
      className="quick-action-btn group !h-auto !min-h-0 !w-full !justify-start !rounded-xl !px-0 !py-0 text-left"
    >
      <span className="quick-action-inner">
        <span className="quick-action-icon">
          <Icon path={icon} size={15} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.78rem] font-black normal-case tracking-normal text-white/88">
            {label}
          </span>
        </span>

        {value && (
          <span
            className={`flex-shrink-0 text-[0.62rem] font-black normal-case tracking-normal ${valueClass}`}
          >
            {value}
          </span>
        )}

        <span className="quick-action-chevron">
          <Icon path={ICONS.chevronR} size={13} />
        </span>
      </span>
    </Button>
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
    {
      icon: ICONS.refer,
      label: "Study community",
      onClick: go("community"),
    },
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
    {
      icon: ICONS.book,
      label: "Start a new book",
      onClick: go("new-book"),
    },
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
        <div
          key={a.label}
          className="quick-action-in"
          style={{ animationDelay: `${i * 55}ms` }}
        >
          <QuickActionRow {...a} />
        </div>
      ))}

      {hasHidden && (
        <div
          className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)]"
          style={{ maxHeight: expanded ? `${hidden.length * 72}px` : "0px" }}
        >
          <div className="flex flex-col gap-2 pt-2">
            {hidden.map((a, i) => (
              <div
                key={a.label}
                className="quick-action-in"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <QuickActionRow {...a} />
              </div>
            ))}
          </div>
        </div>
      )}

      {hasHidden && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="quick-action-more group mt-1 flex items-center justify-center gap-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.1em] text-white/45 transition-colors hover:text-white/75 active:scale-95"
        >
          <span className="h-px flex-1 bg-white/10 transition-colors group-hover:bg-white/18" />

          <span
            className={`grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/[0.05] transition-all duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <Icon path={ICONS.chevronDown} size={13} />
          </span>

          {expanded ? "Show less" : `${hidden.length} more`}

          <span className="h-px flex-1 bg-white/10 transition-colors group-hover:bg-white/18" />
        </button>
      )}

      <style jsx global>{`
        .quick-action-btn {
          position: relative;
          overflow: hidden;
          border-color: rgba(255, 255, 255, 0.12) !important;
          background:
            radial-gradient(
              circle at 16% 0%,
              rgba(239, 199, 0, 0.13),
              transparent 48%
            ),
            rgba(255, 255, 255, 0.07) !important;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 10px 24px rgba(0, 0, 0, 0.16) !important;
          backdrop-filter: blur(18px) saturate(1.32);
          -webkit-backdrop-filter: blur(18px) saturate(1.32);
          transition:
            transform 220ms ease,
            border-color 220ms ease,
            background 220ms ease,
            box-shadow 220ms ease;
        }

        .quick-action-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(239, 199, 0, 0.3) !important;
          background:
            radial-gradient(
              circle at 16% 0%,
              rgba(239, 199, 0, 0.2),
              transparent 50%
            ),
            rgba(255, 255, 255, 0.105) !important;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.16),
            0 14px 30px rgba(0, 0, 0, 0.2) !important;
        }

        .quick-action-btn:active {
          transform: scale(0.975);
        }

        .quick-action-btn .btn-content {
          width: 100%;
        }

        .quick-action-inner {
          position: relative;
          z-index: 2;
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.75rem;
          padding: 0.78rem 0.88rem;
        }

        .quick-action-icon {
          display: grid;
          height: 2rem;
          width: 2rem;
          flex-shrink: 0;
          place-items: center;
          border-radius: 0.78rem;
          border: 1px solid rgba(239, 199, 0, 0.14);
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.1),
              rgba(255, 255, 255, 0.04)
            ),
            rgba(239, 199, 0, 0.1);
          color: rgb(239, 199, 0);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 8px 18px rgba(0, 0, 0, 0.12);
          transition:
            transform 220ms ease,
            background 220ms ease,
            border-color 220ms ease;
        }

        .quick-action-btn:hover .quick-action-icon {
          transform: scale(1.08) rotate(-2deg);
          border-color: rgba(239, 199, 0, 0.24);
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.16),
              rgba(255, 255, 255, 0.05)
            ),
            rgba(239, 199, 0, 0.17);
        }

        .quick-action-chevron {
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.34);
          transition:
            transform 220ms ease,
            color 220ms ease;
        }

        .quick-action-btn:hover .quick-action-chevron {
          transform: translateX(2px);
          color: rgba(239, 199, 0, 0.86);
        }

        .quick-action-in {
          animation: quickActionFadeIn 0.45s cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }

        @keyframes quickActionFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .quick-action-btn,
          .quick-action-icon,
          .quick-action-chevron,
          .quick-action-in {
            animation: none;
            transition: none;
          }

          .quick-action-btn:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
