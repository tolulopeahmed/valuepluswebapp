"use client";

import { useState } from "react";
import SectionLabel from "../../../components/SectionLabel";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import MarqueeName from "../../../components/MarqueeName";
import LessonDetailModal, {
  type LessonDetail,
} from "../../../components/LessonDetailsModal";
import { Check, Lock } from "lucide-react";
import { useLearnerCurriculum, type ModuleItem } from "../CurriculumModules";
import { completeLesson } from "../../../hooks/useAcademy";
import { notify } from "../../../lib/snackbar";

function lessonStatus(m: ModuleItem, currentId: number | null) {
  if (m.progress === 100) return "done" as const;
  if (m.id === currentId) return "current" as const;
  return "upcoming" as const;
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
  modules,
  currentId,
  earnedXp,
  totalXp,
  onSelect,
}: {
  modules: ModuleItem[];
  currentId: number | null;
  earnedXp: number;
  totalXp: number;
  onSelect: (lesson: LessonDetail) => void;
}) {
  return (
    <GlassCard accent className="p-4 md:p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <SectionLabel>All lessons</SectionLabel>
        <span className="text-[0.6rem] font-black text-white/45">
          {earnedXp.toLocaleString()} / {totalXp.toLocaleString()} XP
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {modules.map((m, i) => {
          const status = lessonStatus(m, currentId);
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
                  total: modules.length,
                  moduleLabel: m.module,
                  title: m.title,
                  description: m.description,
                  actionTip: m.actionTip,
                  xp: m.xp,
                  status,
                  lessonId: m.lessonId,
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

                <MarqueeName
                  text={m.title}
                  className="mt-0.5"
                  textClassName={`text-[1.1rem] font-black ${
                    status === "upcoming" ? "text-white/45" : "text-white"
                  }`}
                  fadeColor="#2D375A"
                />

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
  const {
    modules,
    current,
    loading,
    refetch: refetchCurriculum,
  } = useLearnerCurriculum();

  const currentId = current?.id ?? null;
  const totalXp = modules.reduce((s, m) => s + m.xp, 0);
  const earnedXp = modules.reduce(
    (s, m) => s + Math.round((m.xp * m.progress) / 100),
    0,
  );
  const completedCount = modules.filter((m) => m.progress === 100).length;

  const resumeLesson = async (lessonId: string) => {
    if (!lessonId) return;
    try {
      const result = await completeLesson(lessonId);
      await refetchCurriculum();
      if (result.xp_earned > 0) {
        notify(`Lesson complete! +${result.xp_earned} XP`, "success");
      }
    } catch {
      notify("Could not save your progress. Please try again.", "error");
    }
  };

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

      {loading ? (
        <div className="vp-card-in py-10 text-center text-[0.8rem] text-white/40">
          Loading your curriculum…
        </div>
      ) : (
        <>
          {/* All Lessons Section */}
          <div className="vp-card-in" style={{ animationDelay: "60ms" }}>
            <AllLessonsSection
              modules={modules}
              currentId={currentId}
              earnedXp={earnedXp}
              totalXp={totalXp}
              onSelect={setSelectedLesson}
            />
          </div>

          {/* Progress Summary Row — styled like QuickActions' buttons */}
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="vp-card-in" style={{ animationDelay: "100ms" }}>
              <SummaryPill label="Completed">
                <p className="text-2xl font-black text-white">
                  {completedCount}
                  <span className="text-base font-normal text-white/40">
                    {" "}
                    / {modules.length}
                  </span>
                </p>
              </SummaryPill>
            </div>

            <div className="vp-card-in" style={{ animationDelay: "140ms" }}>
              <SummaryPill label="Total XP">
                <p className="text-2xl font-black text-white">
                  {earnedXp.toLocaleString()}
                  <span className="text-base font-normal text-white/40">
                    {" "}
                    / {totalXp.toLocaleString()}
                  </span>
                </p>
              </SummaryPill>
            </div>

            <div className="vp-card-in" style={{ animationDelay: "180ms" }}>
              <SummaryPill label="Current Module">
                <p className="text-sm font-black text-white truncate">
                  {current?.title ?? "—"}
                </p>
                <p
                  className={`text-xs text-white/40 ${
                    !current || current.progress === 0 ? "uppercase tracking-wide" : ""
                  }`}
                >
                  {!current || current.progress === 0
                    ? "Yet to start"
                    : `${current.progress}% complete`}
                </p>
              </SummaryPill>
            </div>
          </div>
        </>
      )}

      <LessonDetailModal
        open={selectedLesson !== null}
        onClose={() => setSelectedLesson(null)}
        onResume={() => {
          if (selectedLesson) resumeLesson(selectedLesson.lessonId);
        }}
        lesson={selectedLesson}
      />
    </div>
  );
}
