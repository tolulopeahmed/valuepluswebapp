"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
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
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  learn: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  refer:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  withdraw: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  close: "M18 6L6 18M6 6l12 12",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  progress: "M4 19V5 M4 19h16 M8 16v-5 M12 16V8 M16 16v-9",
  cash: "M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4 M4 6v12c0 1.1.9 2 2 2h14v-4 M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  chat: "M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 0 1 20.62 6l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  grad: "M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  firstName: string;
  xp: number;
  level: number;
}

const ACCENT_GOLD = "rgb(239,199,0)";
const ACCENT_ROSE = "rgb(214,132,139)";

export default function Sidebar({
  open,
  onClose,
  mode,
  onModeChange,
}: SidebarProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  const learnerItems = [
    { key: "dashboard", icon: ICONS.home, label: "Dashboard" },
    { key: "academy", icon: ICONS.learn, label: "Academy" },
    { key: "progress", icon: ICONS.progress, label: "My Progress" },
    { key: "referrals", icon: ICONS.refer, label: "Referrals" },
  ];

  const publisherItems = [
    { key: "dashboard", icon: ICONS.home, label: "Dashboard" },
    { key: "books", icon: ICONS.book, label: "My Books" },
    { key: "earnings", icon: ICONS.cash, label: "Earnings" },
    { key: "withdraw", icon: ICONS.withdraw, label: "Withdraw" },
  ];

  const items = mode === "learner" ? learnerItems : publisherItems;
  const activeKey = mode === "learner" ? "academy" : "books";

  const modeAccent = mode === "learner" ? ACCENT_GOLD : ACCENT_ROSE;

  // Frosty pill background shifts hue based on active mode.
  const pillStyle: CSSProperties =
    mode === "learner"
      ? {
          background:
            "radial-gradient(circle at 18% 15%, rgba(239,199,0,0.30), transparent 62%), rgba(255,255,255,0.06)",
          borderColor: "rgba(239,199,0,0.35)",
        }
      : {
          background:
            "radial-gradient(circle at 18% 15%, rgba(214,132,139,0.30), transparent 62%), rgba(255,255,255,0.06)",
          borderColor: "rgba(214,132,139,0.35)",
        };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
        }}
      />

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(82vw,20rem)] flex-col font-['PP_Telegraf'] transition-transform duration-[380ms] ease-[cubic-bezier(0.2,0.95,0.2,1)] md:sticky md:z-0 md:w-64 md:flex-shrink-0 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background:
            "radial-gradient(circle at 12% 0%, rgba(239,199,0,0.32), transparent 46%), radial-gradient(circle at 100% 100%, rgba(200,115,122,0.22), transparent 42%), linear-gradient(155deg, #352808 0%, #241a08 48%, #171106 100%)",
          borderRight: "1px solid rgba(239,199,0,0.2)",
          boxShadow: "18px 0 40px rgba(0,0,0,0.35)",
        }}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <div className="min-w-0">
            {!logoFailed ? (
              <Image
                src="/images/logos/valueplus-logo-white2.png"
                alt="ValuePlus Publishing"
                width={160}
                height={45}
                className="h-9 w-auto object-contain"
                priority
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <p className="text-sm font-black tracking-[0.08em] text-white">
                ValuePlus
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-white/65 transition-colors hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <Icon path={ICONS.close} size={16} />
          </button>
        </div>

        {/* Combined mode label + toggle, single glass pill */}
        <div className="px-5 pt-3">
          <div
            className="flex items-center justify-between gap-3 rounded-full border px-3 py-1.5 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.2,1)]"
            style={pillStyle}
          >
            <p
              className="pl-1 text-[0.58rem] font-black uppercase tracking-[0.16em] transition-colors duration-500"
              style={{ color: modeAccent }}
            >
              {mode === "learner" ? "Learner" : "Publisher"}
            </p>

            <button
              type="button"
              role="switch"
              aria-checked={mode === "publisher"}
              aria-label={
                mode === "learner"
                  ? "Switch to publisher view"
                  : "Switch to learner view"
              }
              onClick={() =>
                onModeChange(mode === "learner" ? "publisher" : "learner")
              }
              className="relative h-6 w-11 flex-shrink-0 rounded-full border border-white/12 bg-black/20 transition-colors active:scale-95"
              title={mode === "learner" ? "Learner mode" : "Publisher mode"}
            >
              <span
                className="absolute top-0.5 grid h-5 w-5 place-items-center rounded-full text-[#171100] shadow-[0_0_10px_rgba(239,199,0,0.45)] transition-transform duration-200"
                style={{
                  background: ACCENT_GOLD,
                  transform:
                    mode === "publisher"
                      ? "translateX(21px)"
                      : "translateX(2px)",
                }}
              >
                <Icon
                  path={mode === "learner" ? ICONS.grad : ICONS.book}
                  size={11}
                />
              </span>
            </button>
          </div>
        </div>

        <nav className="mt-12 flex-1 overflow-y-auto px-3 pb-4">
          <div className="flex flex-col gap-1.5">
            {items.map((item) => {
              const isActive = item.key === activeKey;

              return (
                <button
                  key={item.key}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[0.9rem] font-semibold transition-all active:scale-[0.98] ${
                    isActive
                      ? "text-[rgb(239,199,0)]"
                      : "text-white/70 hover:text-white"
                  }`}
                  style={{
                    background: isActive
                      ? "rgba(239,199,0,0.11)"
                      : "transparent",
                  }}
                >
                  <Icon path={item.icon} size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mx-3 my-8 h-px bg-white/12" />

          <div className="flex flex-col gap-1.5">
            <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[0.9rem] font-semibold text-white/62 transition-all hover:text-white active:scale-[0.98]">
              <Icon path={ICONS.chat} size={18} />
              Chat Admin
            </button>

            <Link href="/login">
              <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[0.9rem] font-semibold text-red-300/85 transition-all hover:text-red-200 active:scale-[0.98]">
                <Icon path={ICONS.logout} size={18} />
                Log Out
              </button>
            </Link>
          </div>
        </nav>

        <div className="px-5 pb-7">
          <button className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-4 py-3 text-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all hover:bg-white/[0.12] hover:text-white active:scale-[0.98]">
            <Icon path={ICONS.settings} size={19} />
            <span className="text-sm font-semibold">Manage Account</span>
          </button>
        </div>
      </aside>
    </>
  );
}
