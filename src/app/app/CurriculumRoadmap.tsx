// app/(app)/components/CurriculumRoadmap.tsx

"use client";

import { Fragment, useEffect, useState } from "react";
import { Check, Lock } from "lucide-react";
import SectionLabel from "../../components/SectionLabel";

export interface RoadmapItem {
  id: string | number;
  label: string;
  status: "done" | "current" | "upcoming";
  /** 0–100, how far into this course the learner is. Drives how far the
   * connecting line fills/brightens before reaching the next node.
   * Defaults to 100 for "done" and 0 for "current"/"upcoming". */
  progress?: number;
}

function segmentFill(item: RoadmapItem) {
  if (typeof item.progress === "number") {
    return Math.min(100, Math.max(0, item.progress));
  }
  return item.status === "done" ? 100 : 0;
}

const DONE_GREEN = "74,222,128";
const CONNECTOR_TRACK_BG = "rgba(255,255,255,0.12)";

// Starts every connector at 0% and animates it up to the learner's real
// progress on mount, so the line visibly "fills in" to wherever they
// actually are (e.g. 40%) instead of appearing pre-filled.
function RoadmapConnector({ item, delay }: { item: RoadmapItem; delay: number }) {
  const target = segmentFill(item);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(target), delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return (
    <div
      className="relative mt-3.75 h-0.75 w-10 shrink-0 overflow-hidden rounded-full md:w-16"
      style={{ background: CONNECTOR_TRACK_BG }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-[900ms] ease-out"
        style={{
          width: `${width}%`,
          background: `rgb(${DONE_GREEN})`,
          boxShadow:
            item.status === "done" ? `0 0 8px rgba(${DONE_GREEN},0.9)` : "none",
        }}
      >
        {item.status === "current" && (
          <div className="vp-roadmap-shimmer absolute inset-0" />
        )}
      </div>
    </div>
  );
}
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
      // scale (not a larger h/w) so it reads bigger without shifting the
      // layout box the connector lines are aligned against.
      <div
        className="vp-pulse-ring flex h-8 w-8 shrink-0 scale-125 items-center justify-center rounded-full text-[0.68rem] font-black transition-transform duration-300"
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

      {/* overflow-x-auto forces overflow-y to "auto" too (a CSS overflow
          quirk — you can't mix visible with a non-visible axis), which
          clips the current node's scale/glow at the top edge. -mt-6
          cancels the -pt-6 buffer below so the label-to-row gap still
          looks like the original mb-2, while the buffer itself keeps
          the clip boundary clear of the node's painted overflow. */}
      <div className="-mt-6 scrollbar-none overflow-x-auto pb-1 pt-6 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max items-start">
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
                // Fills based on *this* node's own progress — a segment
                // shows how far the course it's leaving has been completed,
                // so both segments after two "done" courses read fully lit,
                // and only the segment leaving the current course shows its
                // partial (e.g. 40%) progress.
                <RoadmapConnector item={item} delay={i * 90} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
