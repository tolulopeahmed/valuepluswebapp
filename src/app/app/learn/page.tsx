"use client";

import { useState } from "react";
import SectionLabel from "../../../components/SectionLabel";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import LessonDetailModal, {
  type LessonDetail,
  type LessonStatus,
} from "../../../components/LessonDetailsModal";
import { Check, Lock } from "lucide-react";

// Re-using the same MODULES data
const MODULES = [
  {
    id: 1,
    module: "Module 01",
    title: "Foundations: A–Z of Publishing",
    description:
      "Tools of the Trade: understanding the publishing process, from manuscript to market.",
    actionTip:
      "Revisit your notes on the manuscript-to-market pipeline before moving on — everything else builds on this.",
    xp: 120,
    duration: "12 min",
    progress: 100,
  },
  {
    id: 2,
    module: "Module 02",
    title: "Design: Inside and Cover",
    description:
      "Cover design, inside design, formatting and layout, and everything that makes a book reader-ready.",
    actionTip:
      "Sketch three cover directions before opening any design tool — constraints spark better covers than a blank canvas.",
    xp: 200,
    duration: "18 min",
    progress: 100,
  },
  {
    id: 3,
    module: "Module 03",
    title: "Proofreading and Editing",
    description:
      "Getting the book error-free and updating it to ensure high engagement and readability.",
    actionTip:
      "Read your manuscript aloud — your ear will catch awkward phrasing your eyes skim right past.",
    xp: 150,
    duration: "15 min",
    progress: 40,
  },
  {
    id: 4,
    module: "Module 04",
    title: "Printing: Presswork",
    description:
      "From back-cover printing and lamination to inside printing, perfect-binding, sewing, trimming and packaging.",
    actionTip:
      "Order a single physical proof before committing to a full print run — screens lie about paper weight and color.",
    xp: 180,
    duration: "20 min",
    progress: 0,
  },
  {
    id: 5,
    module: "Module 05",
    title: "Distribution: KDP, Selar, etc.",
    description:
      "Upload, metadata, pricing strategy, and getting your book into readers' hands.",
    actionTip:
      "Write your book's metadata and keywords before uploading — retrofitting SEO after launch costs you early sales.",
    xp: 220,
    duration: "18 min",
    progress: 0,
  },
  {
    id: 6,
    module: "Module 06",
    title: "Capstone: Publish First Book",
    description:
      "Write a book about an important area of your life that you've succeeded in and publish it for others to achieve the same.",
    actionTip:
      "Set a firm publish date now — a deadline turns a capstone project into a finished book.",
    xp: 200,
    duration: "25 min",
    progress: 0,
  },
];

const CURRENT_MODULE =
  MODULES.find((m) => m.progress > 0 && m.progress < 100) ?? MODULES[0];

const CURRENT_MODULE_XP_EARNED = Math.round(
  (CURRENT_MODULE.xp * CURRENT_MODULE.progress) / 100,
);

const MODULE_EARNED_XP = MODULES.reduce((sum, m) => {
  if (m.progress === 100) return sum + m.xp;
  if (m.id === CURRENT_MODULE.id) return sum + CURRENT_MODULE_XP_EARNED;
  return sum;
}, 0);

const MODULE_TOTAL_XP = MODULES.reduce((s, m) => s + m.xp, 0);

function lessonStatus(progress: number, isCurrentId: boolean): LessonStatus {
  if (progress === 100) return "done";
  if (isCurrentId) return "current";
  return "upcoming";
}

// GlassCard — brought in line with the real app/app/GlassCard.tsx: the
// background gradient is constant (same one behind the "My Progress"
// hero card), only the border reacts to `accent`.
const VP_CARD_BG = "#2D375A";

function GlassCard({
  children,
  className = "",
  accent = false,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.15rem] border transition-all duration-300 ${
        accent
          ? "border-[rgba(var(--vp-accent-rgb),0.18)]"
          : "border-white/[0.06]"
      } ${className}`}
      style={{
        background: `linear-gradient(180deg, #2F3A5E 0%, ${VP_CARD_BG} 55%, #29325A 100%)`,
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}

// SummaryPill — styled to match QuickActions' ActionRow (same gradient,
// border, and backdrop-blur treatment) instead of the GlassCard look.
function SummaryPill({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl border px-4 py-3 backdrop-blur-sm"
      style={{
        background:
          "linear-gradient(135deg, rgba(var(--vp-accent-rgb),0.14), rgba(var(--vp-accent-rgb),0.05))",
        borderColor: "rgba(var(--vp-accent-rgb),0.25)",
      }}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

// AllLessonsSection component (moved from home page)
function AllLessonsSection({
  onSelect,
}: {
  onSelect: (lesson: LessonDetail) => void;
}) {
  return (
    <GlassCard accent className="p-4 md:p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <SectionLabel>All lessons</SectionLabel>
        <span className="text-[0.6rem] font-black text-white/45">
          {MODULE_EARNED_XP.toLocaleString()} /{" "}
          {MODULE_TOTAL_XP.toLocaleString()} XP
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {MODULES.map((m, i) => {
          const status = lessonStatus(m.progress, m.id === CURRENT_MODULE.id);
          const isCurrent = status === "current";

          const barColor =
            status === "done"
              ? "rgb(74,222,128)"
              : status === "current"
                ? "rgb(var(--vp-accent-rgb))"
                : "rgba(255,255,255,0.15)";

          return (
            <button
              key={m.id}
              onClick={() =>
                onSelect({
                  index: i + 1,
                  total: MODULES.length,
                  moduleLabel: m.module,
                  title: m.title,
                  description: m.description,
                  actionTip: m.actionTip,
                  xp: m.xp,
                  status,
                })
              }
              className={`group flex w-full items-start gap-3 rounded-xl px-2.5 py-3 text-left transition-all active:scale-[0.99] ${
                isCurrent ? "border" : "border border-transparent"
              }`}
              style={
                isCurrent
                  ? {
                      background: "rgba(var(--vp-accent-rgb),0.1)",
                      borderColor: "rgba(var(--vp-accent-rgb),0.35)",
                    }
                  : undefined
              }
            >
              <span
                className="mt-0.5 h-full min-h-[2.75rem] w-[3px] flex-shrink-0 self-stretch rounded-full transition-colors"
                style={{ background: barColor }}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[0.6rem] font-black uppercase tracking-[0.08em] ${
                      status === "upcoming" ? "text-white/35" : "text-white/55"
                    }`}
                  >
                    {m.module}
                  </span>

                  {isCurrent && (
                    <span
                      className="vp-here-glow inline-flex items-center rounded-full px-2 py-[1px] text-[0.44rem] font-black uppercase tracking-[0.1em]"
                      style={{
                        background: "rgba(var(--vp-accent-rgb),0.18)",
                        color: "rgb(var(--vp-accent-rgb))",
                      }}
                    >
                      You are here
                    </span>
                  )}
                </div>

                <p
                  className={`mt-0.5 truncate text-[0.85rem] font-black ${
                    status === "upcoming" ? "text-white/45" : "text-white"
                  }`}
                >
                  {m.title}
                </p>

                <p className="mt-0.5 text-[0.58rem] text-white/38">
                  {m.duration} · {m.xp} XP
                </p>
              </div>

              <span className="mt-1 flex-shrink-0">
                {status === "done" && (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#4ade80] text-[#0a0e1b] shadow-[0_0_10px_rgba(74,222,128,0.55)]">
                    <Check size={13} strokeWidth={4} />
                  </span>
                )}

                {status === "current" && (
                  <span
                    className="vp-pulse-ring grid h-6 w-6 place-items-center rounded-full border-2"
                    style={{
                      borderColor: "rgb(var(--vp-accent-rgb))",
                      background: "rgba(var(--vp-accent-rgb),0.14)",
                    }}
                  />
                )}

                {status === "upcoming" && (
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/30">
                    <Lock size={11} strokeWidth={2.25} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

// Main Learn Page Component
// No wrapper div, no background, no --vp-accent-rgb, no <style jsx global> —
// all of that is now owned by app/layout.tsx, which every /app/* route
// (including this one) renders inside of. The <style> block below only
// defines the local "you are here" glow animation used on this page —
// .vp-pulse-ring is intentionally NOT redefined here since layout.tsx
// already defines it globally; duplicating it risked one definition
// silently overriding the other.
export default function LearnPage() {
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(
    null,
  );

  return (
    <div className="mx-auto w-full max-w-4xl">
      <style>{`
        @keyframes vp-here-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(var(--vp-accent-rgb), 0.35);
          }
          50% {
            box-shadow: 0 0 8px 2px rgba(var(--vp-accent-rgb), 0.45);
          }
        }
        .vp-here-glow {
          animation: vp-here-glow 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Title Section */}
      <div className="vp-card-in mb-6">
        <Title className="block">Learn</Title>
        <Subtitle>Explore all lessons and track your progress</Subtitle>
      </div>

      {/* All Lessons Section */}
      <div className="vp-card-in" style={{ animationDelay: "60ms" }}>
        <AllLessonsSection onSelect={setSelectedLesson} />
      </div>

      {/* Progress Summary Row — styled like QuickActions' buttons */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="vp-card-in" style={{ animationDelay: "100ms" }}>
          <SummaryPill label="Completed">
            <p className="text-2xl font-black text-white">
              {MODULES.filter((m) => m.progress === 100).length}
              <span className="text-base font-normal text-white/40">
                {" "}
                / {MODULES.length}
              </span>
            </p>
          </SummaryPill>
        </div>

        <div className="vp-card-in" style={{ animationDelay: "140ms" }}>
          <SummaryPill label="Total XP">
            <p className="text-2xl font-black text-white">
              {MODULE_EARNED_XP.toLocaleString()}
              <span className="text-base font-normal text-white/40">
                {" "}
                / {MODULE_TOTAL_XP.toLocaleString()}
              </span>
            </p>
          </SummaryPill>
        </div>

        <div className="vp-card-in" style={{ animationDelay: "180ms" }}>
          <SummaryPill label="Current Module">
            <p className="text-sm font-black text-white truncate">
              {CURRENT_MODULE.title}
            </p>
            <p className="text-xs text-white/40">
              {CURRENT_MODULE.progress}% complete
            </p>
          </SummaryPill>
        </div>
      </div>

      <LessonDetailModal
        open={selectedLesson !== null}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
      />
    </div>
  );
}
