"use client";

import Link from "next/link";

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
  menu: "M3 12h18M3 6h18M3 18h18",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
};

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const isPublisher = mode === "publisher";
  return (
    <div className="relative flex items-center rounded-full border border-white/[0.1] bg-white/[0.05] p-1">
      <div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-[rgb(239,199,0)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)]"
        style={{
          transform: isPublisher
            ? "translateX(calc(100% + 4px))"
            : "translateX(0)",
        }}
      />
      <button
        onClick={() => onChange("learner")}
        className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.06em] transition-colors ${!isPublisher ? "text-[#171100]" : "text-white/50"}`}
      >
        📚 Learner
      </button>
      <button
        onClick={() => onChange("publisher")}
        className={`relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.06em] transition-colors ${isPublisher ? "text-[#171100]" : "text-white/50"}`}
      >
        📖 Publisher
      </button>
    </div>
  );
}

export default function Header({
  streak,
  notificationCount = 0,
  mode,
  onModeChange,
  onMenuPress,
  onBellPress,
}: {
  streak: number;
  notificationCount?: number;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onMenuPress: () => void;
  onBellPress: () => void;
}) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 px-4 pb-3 pt-4 md:left-64 md:px-8 md:pb-4 md:pt-6"
      style={{
        background: "black",
        backdropFilter: "blur(16px) saturate(1.4)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onMenuPress}
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white/60 transition-colors hover:text-white active:scale-95 md:hidden"
          >
            <Icon path={ICONS.menu} size={15} />
          </button>
          <Link
            href="/"
            className="truncate text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/40 md:hidden"
          >
            ValuePlus
          </Link>
        </div>

        <button
          onClick={onBellPress}
          className="relative grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.05] text-white/60 transition-colors hover:text-white active:scale-95"
          aria-label="Notifications"
        >
          <Icon path={ICONS.bell} size={17} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[0.5rem] font-black text-white">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
