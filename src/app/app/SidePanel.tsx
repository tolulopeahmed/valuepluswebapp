// src/app/app/SidePanel.tsx

"use client";

import GlassCard from "./GlassCard";
import SectionLabel from "../../components/SectionLabel";
import {
  LEADERBOARD,
  RECENT_SALES,
  type LeaderboardEntry,
} from "./PublisherBooks";

type Mode = "learner" | "publisher";

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
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
};

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function SidePanel({ mode }: { mode: Mode }) {
  if (mode === "learner") {
    return (
      <GlassCard className="p-4">
        <SectionLabel>Leaderboard</SectionLabel>

        <div className="flex flex-col gap-2.5">
          {LEADERBOARD.map((entry: LeaderboardEntry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${
                entry.isYou ? "bg-[rgba(var(--vp-accent-rgb),0.08)]" : ""
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-black ${
                  entry.rank === 1
                    ? "bg-[rgb(var(--vp-accent-rgb))] text-[#171100]"
                    : "bg-white/8 text-white/50"
                }`}
              >
                {entry.rank}
              </span>

              <span
                className={`flex-1 truncate text-[0.72rem] font-black ${
                  entry.isYou
                    ? "text-[rgb(var(--vp-accent-rgb))]"
                    : "text-white/75"
                }`}
              >
                {entry.name}
              </span>

              <span className="text-[0.62rem] font-black text-white/40">
                {entry.xp.toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <SectionLabel>Recent sales</SectionLabel>

      <div className="flex flex-col gap-2.5">
        {RECENT_SALES.map((sale, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-2.5 py-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(74,222,128,0.12)] text-[#4ade80]">
              <Icon path={ICONS.book} size={14} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.72rem] font-black text-white/85">
                {sale.title}
              </p>
              <p className="text-[0.55rem] text-white/30">
                {sale.buyer} · {sale.time}
              </p>
            </div>

            <span className="text-[0.62rem] font-black text-[#4ade80]">
              +{naira(sale.amount)}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
