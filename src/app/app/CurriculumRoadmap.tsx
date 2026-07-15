// app/(app)/components/CurriculumRoadmap.tsx

"use client";

import { Fragment } from "react";
import { Check, Lock } from "lucide-react";
import SectionLabel from "../../components/SectionLabel";

export interface RoadmapItem {
  id: string | number;
  label: string;
  status: "done" | "current" | "upcoming";
}

const DONE_GREEN = "87,148,95";
const LOCKED_SLATE = "63,68,86";

function StepNode({ status, index }: { status: string; index: number }) {
  if (status === "done") {
    return (
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: `rgb(${DONE_GREEN})` }}
      >
        <Check size={15} strokeWidth={3} className="text-[#0b1a0f]" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className="vp-pulse-ring flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[0.68rem] font-black"
        style={{
          background: "rgb(var(--vp-accent-rgb))",
          color: "#171100",
        }}
      >
        {index + 1}
      </div>
    );
  }

  return (
    <div
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/45"
      style={{ background: `rgb(${LOCKED_SLATE})` }}
    >
      <Lock size={12} strokeWidth={2.25} />
    </div>
  );
}

export function ProgressRoadmap({ items }: { items: RoadmapItem[] }) {
  return (
    <div>
      <SectionLabel>Roadmap</SectionLabel>

      <div className="flex items-start">
        {items.map((item, i) => (
          <Fragment key={item.id}>
            <div className="flex w-14 flex-shrink-0 flex-col items-center gap-2 md:w-20">
              <StepNode status={item.status} index={i} />
              <span
                className={`text-center text-[0.44rem] font-black uppercase leading-tight tracking-wider md:text-[0.5rem] ${
                  item.status === "upcoming"
                    ? "text-white/25"
                    : item.status === "current"
                      ? "text-[rgb(var(--vp-accent-rgb))]"
                      : "text-white/50"
                }`}
              >
                {item.label}
              </span>
            </div>

            {i < items.length - 1 && (
              <div
                className="mt-4 h-[2px] flex-1 rounded-full transition-colors duration-500"
                style={{
                  background:
                    item.status === "done"
                      ? `rgb(${DONE_GREEN})`
                      : "rgba(255,255,255,0.1)",
                }}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
