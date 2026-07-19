// src/app/app/MomentumBars.tsx

"use client";

import GlassCard from "./GlassCard";
import SectionLabel from "../../components/SectionLabel";

type Mode = "learner" | "publisher";

const STAGES = [
  "Start",
  "Learn",
  "Practice",
  "Publish",
  "Sell",
  "Scale",
  "Royalty",
  "Freedom",
];

const LEARNER_STAGE_INDEX = 3;
const PUBLISHER_STAGE_INDEX = 5;

export default function MomentumBars({ mode }: { mode: Mode }) {
  const activeIndex =
    mode === "learner" ? LEARNER_STAGE_INDEX : PUBLISHER_STAGE_INDEX;
  const label = mode === "learner" ? "Learning momentum" : "Earnings momentum";

  return (
    <GlassCard
      className="p-4"
      style={{
        background:
          "linear-gradient(180deg, #12182f 0%, #0b1024 55%, #060913 100%)",
      }}
    >
      <SectionLabel>{label}</SectionLabel>

      <p className="mb-3 text-lg font-black leading-none text-white">
        {STAGES[activeIndex]}
      </p>

      <div className="flex h-24 items-end gap-1.5">
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${
                i === activeIndex
                  ? "bg-[rgb(var(--vp-accent-rgb))] shadow-[0_0_12px_rgba(var(--vp-accent-rgb),0.4)]"
                  : "bg-white/8"
              }`}
              style={{ height: `${18 + i * 9}%` }}
            />
            <span
              className={`text-[0.4rem] font-black uppercase ${
                i === activeIndex
                  ? "text-[rgb(var(--vp-accent-rgb))]"
                  : "text-white/25"
              }`}
            >
              {stage.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
