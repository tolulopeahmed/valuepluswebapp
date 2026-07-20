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

const DONE_GREEN = "74,222,128";
const LOCKED_SLATE = "63,68,86";

function StepNode({ status, index }: { status: string; index: number }) {
  if (status === "done") {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: `rgb(${DONE_GREEN})` }}
      >
        <Check size={15} strokeWidth={3} className="text-[#0b1a0f]" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className="vp-pulse-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-black"
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
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/45"
      style={{ background: `rgb(${LOCKED_SLATE})` }}
    >
      <Lock size={12} strokeWidth={2.25} />
    </div>
  );
}

export function ProgressRoadmap({
  items,
  onSelect,
}: {
  items: RoadmapItem[];
  onSelect?: (id: string | number) => void;
}) {
  return (
    <div>
      <SectionLabel>Roadmap</SectionLabel>

      <div className="flex items-start">
        {items.map((item, i) => (
          <Fragment key={item.id}>
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              className="flex w-16 shrink-0 flex-col items-center gap-2 rounded-lg transition-transform active:scale-95 md:w-24"
            >
              <StepNode status={item.status} index={i} />
              <span
                className={`text-center text-[0.42rem] font-black uppercase leading-[1.15] tracking-wide break-words md:text-[0.48rem] ${
                  item.status === "upcoming"
                    ? "text-white/25"
                    : item.status === "current"
                      ? "text-[rgb(var(--vp-accent-rgb))]"
                      : "text-white/50"
                }`}
              >
                {item.label}
              </span>
            </button>

            {i < items.length - 1 && (
              <div
                className="mt-4 h-2px flex-1 rounded-full transition-colors duration-500"
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
