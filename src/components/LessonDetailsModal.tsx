"use client";

import { Check, Zap } from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";

export type LessonStatus = "done" | "current" | "upcoming";

export interface LessonDetail {
  index: number;
  total: number;
  moduleLabel: string;
  title: string;
  description: string;
  actionTip: string;
  xp: number;
  status: LessonStatus;
  lessonId: string;
}

const ACCENT_GOLD = "rgb(239,199,0)";
const ACCENT_ROSE = "rgb(214,132,139)";
const ACCENT_GREEN = "rgb(74,222,128)";
const ACCENT_GREY = "rgb(148,148,158)";

type StatusButtonStyle = { background: string; color: string; shadow: string };

const STATUS_BUTTON_STYLES: Record<LessonStatus, StatusButtonStyle> = {
  done: {
    background: ACCENT_GREEN,
    color: "#0b1a0f",
    shadow: "0 0 14px rgba(74,222,128,0.35)",
  },
  current: {
    background: ACCENT_GOLD,
    color: "#171100",
    shadow: "0 0 14px rgba(239,199,0,0.35)",
  },
  upcoming: {
    background: ACCENT_GREY,
    color: "#1a1a1f",
    shadow: "none",
  },
};

interface LessonDetailModalProps {
  open: boolean;
  onClose: () => void;
  onResume?: () => void;
  lesson: LessonDetail | null;
}

export default function LessonDetailModal({
  open,
  onClose,
  onResume,
  lesson,
}: LessonDetailModalProps) {
  if (!lesson) return null;

  const accent =
    lesson.status === "upcoming" ? "rgba(255,255,255,0.3)" : ACCENT_GOLD;

  const buttonStyle = STATUS_BUTTON_STYLES[lesson.status];

  return (
    <Modal open={open} onClose={onClose}>
      <style>{`
        @keyframes vp-modal-here-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239,199,0,0.4);
          }
          50% {
            box-shadow: 0 0 10px 2px rgba(239,199,0,0.5);
          }
        }
        .vp-modal-here-glow {
          animation: vp-modal-here-glow 1.8s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-end gap-2">
        <span
          className="text-6xl font-black leading-none"
          style={{ color: accent }}
        >
          {lesson.index}
        </span>
        <span className="pb-1.5 text-sm font-bold text-white/35">
          / {lesson.total}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {lesson.status === "current" && (
          <span
            className="vp-modal-here-glow inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em]"
            style={{
              background: "rgba(239,199,0,0.16)",
              color: ACCENT_GOLD,
              border: "1px solid rgba(239,199,0,0.35)",
            }}
          >
            You are here
          </span>
        )}

        {lesson.status === "done" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(74,222,128,0.14)] px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] text-[#4ade80]">
            <Check size={11} strokeWidth={3} />
            Completed
          </span>
        )}

        {lesson.status === "upcoming" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] text-white/40">
            Locked
          </span>
        )}

        <span className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-white/35">
          {lesson.moduleLabel} · {lesson.xp} XP
        </span>
      </div>

      <h3 className="mt-4 text-2xl font-black leading-tight text-white">
        {lesson.title}
      </h3>

      <div className="my-5 h-px bg-white/10" />

      <p className="text-[0.85rem] leading-relaxed text-white/62">
        {lesson.description}
      </p>

      <div
        className="mt-5 rounded-2xl border-l-4 p-4"
        style={{
          borderColor: ACCENT_ROSE,
          background: "rgba(214,132,139,0.08)",
        }}
      >
        <p
          className="flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-[0.14em]"
          style={{ color: ACCENT_ROSE }}
        >
          <Zap size={12} strokeWidth={2.5} />
          Action tip
        </p>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-white/68">
          {lesson.actionTip}
        </p>
      </div>

      <Button
        variant="primary"
        size="md"
        className="mt-6 w-full"
        style={{
          background: buttonStyle.background,
          color: buttonStyle.color,
          boxShadow: buttonStyle.shadow,
        }}
        onClick={() => {
          if (lesson.status === "current") onResume?.();
          onClose();
        }}
      >
        {/* "current" always means not-yet-done here — lesson completion
            is binary (no partial-progress tracking), so the next lesson
            up is always genuinely unstarted, never actually resumable. */}
        {lesson.status === "current" ? "Start lesson" : "Close"}
      </Button>
    </Modal>
  );
}
