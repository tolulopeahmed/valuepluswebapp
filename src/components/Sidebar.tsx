"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LogoutConfirmModal from "./LogoutConfirmModal";
import ManageAccountModal from "./ManageAccountModal";

type Mode = "learner" | "publisher";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const ACCENT_RGB: Record<Mode, string> = {
  learner: "239,199,0",
  // Matches the brighter publisher tone used app-wide (layout.tsx, MainTab).
  publisher: "255,145,64",
};

// Admin WhatsApp line (09024312689) in wa.me international format:
// drop the leading 0, prepend Nigeria's country code 234.
const ADMIN_WHATSAPP_URL = "https://wa.me/2349024312689";

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

// The generic Icon above is stroke-only; the WhatsApp mark is a solid
// glyph, so it needs its own fill-based renderer. Inherits currentColor.
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const ICONS = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  // Same glyph as MainTab's heroicons BookOpenIcon (24/outline), so the
  // Learn tab renders identically in both places.
  learn:
    "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
  // Same glyph as MainTab's heroicons ArrowUpTrayIcon (24/outline), so the
  // Publish tab renders identically in both places.
  publish:
    "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5",
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

export default function Sidebar({
  open,
  onClose,
  mode,
  onModeChange,
}: SidebarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showManageAccount, setShowManageAccount] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    onClose();
    await logout();
    router.push("/login");
  };

  // Same four destinations as the mobile bottom tab bar (MainTab.tsx) —
  // "Settings" here is just this sidebar's label for the /app/more route;
  // the tab bar keeps calling it "More". Publisher mode swaps Learn for
  // Publish, same as MainTab.
  const MAIN_ITEMS = [
    { key: "home", label: "Home", path: "/app", icon: ICONS.home },
    mode === "publisher"
      ? {
          key: "learn",
          label: "Publish",
          path: "/app/publish",
          icon: ICONS.publish,
        }
      : {
          key: "learn",
          label: "Learn",
          path: "/app/learn",
          icon: ICONS.learn,
        },
    { key: "earn", label: "Earn", path: "/app/earn", icon: ICONS.withdraw },
    {
      key: "settings",
      label: "Settings",
      path: "/app/more",
      icon: ICONS.settings,
    },
  ];

  const getActiveKeyFromPath = (path: string) => {
    if (path === "/app") return "home";
    if (path.startsWith("/app/learn") || path.startsWith("/app/publish"))
      return "learn";
    if (path.startsWith("/app/earn")) return "earn";
    if (path.startsWith("/app/more")) return "settings";
    return "home";
  };

  const activeKey = getActiveKeyFromPath(pathname || "/app");

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  // Frosty pill background/border/text/toggle all read from
  // var(--vp-accent-rgb), which is set locally on the <aside> below —
  // Sidebar stays self-contained even if used outside the home page.
  const pillStyle: CSSProperties = {
    background:
      "radial-gradient(circle at 18% 15%, rgba(var(--vp-accent-rgb),0.30), transparent 62%), rgba(255,255,255,0.06)",
    borderColor: "rgba(var(--vp-accent-rgb),0.35)",
  };

  // Solid-accent selection language, borrowed straight from the mode
  // toggle's knob: filled rgb(var(--vp-accent-rgb)) plate, near-black
  // (#171100) foreground, and the same soft accent glow. Keeps the
  // sidebar reading as one system with the toggle.
  const activeItemStyle: CSSProperties = {
    background: "rgb(var(--vp-accent-rgb))",
    boxShadow: "0 8px 20px rgba(var(--vp-accent-rgb),0.30)",
  };

  // Faint accent halo for unselected items on hover — this is the tint
  // the active state used to carry, now demoted to a hover cue.
  const HOVER_TINT = "rgba(var(--vp-accent-rgb),0.11)";

  // Deep navy base — matches the app shell's background (~rgb(10,14,27),
  // same family as the ProfileAvatar fallback gradient #3a4763 → #232e47)
  // instead of the old brown/copper tone. Accent glow still swaps gold
  // (Learner) / copper (Publisher) via --vp-accent-rgb.
  const asideStyle: CSSVars = {
    background:
      "radial-gradient(circle at 12% 0%, rgba(var(--vp-accent-rgb),0.26), transparent 46%), radial-gradient(circle at 100% 100%, rgba(58,71,99,0.38), transparent 42%), linear-gradient(155deg, #1b2440 0%, #121a30 48%, #0a0e1b 100%)",
    borderRight: "1px solid rgba(var(--vp-accent-rgb),0.2)",
    boxShadow: "18px 0 40px rgba(0,0,0,0.45)",
    "--vp-accent-rgb": ACCENT_RGB[mode],
  };

  return (
    <>
      {/* Scoped motion. Staggered entrance for nav rows + a soft glow
          settle for the active plate. All disabled under
          prefers-reduced-motion so it degrades to a static sidebar. */}
      <style>{`
        @keyframes vpNavRowIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes vpActiveSettle {
          0%   { box-shadow: 0 0 0 rgba(var(--vp-accent-rgb),0); }
          60%  { box-shadow: 0 10px 26px rgba(var(--vp-accent-rgb),0.42); }
          100% { box-shadow: 0 8px 20px rgba(var(--vp-accent-rgb),0.30); }
        }
        .vp-nav-row {
          opacity: 0;
          animation: vpNavRowIn 0.42s cubic-bezier(0.2,0.9,0.2,1) forwards;
        }
        .vp-nav-row-active {
          animation:
            vpNavRowIn 0.42s cubic-bezier(0.2,0.9,0.2,1) forwards,
            vpActiveSettle 0.5s ease 0.42s both;
        }
        .vp-nav-icon {
          transition: transform 0.22s cubic-bezier(0.2,0.9,0.2,1);
        }
        .vp-nav-row:hover .vp-nav-icon,
        .vp-nav-row-active:hover .vp-nav-icon {
          transform: translateX(2px);
        }
        @media (prefers-reduced-motion: reduce) {
          .vp-nav-row,
          .vp-nav-row-active {
            opacity: 1;
            animation: none;
          }
          .vp-nav-icon { transition: none; }
          .vp-nav-row:hover .vp-nav-icon,
          .vp-nav-row-active:hover .vp-nav-icon { transform: none; }
        }
      `}</style>

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
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(82vw,20rem)] flex-col font-['PP_Telegraf'] transition-transform duration-380 ease-[cubic-bezier(0.2,0.95,0.2,1)] md:sticky md:z-0 md:w-64 md:shrink-0 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={asideStyle}
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
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/65 transition-colors hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <Icon path={ICONS.close} size={16} />
          </button>
        </div>

        {/* Combined mode label + toggle, single glass pill. Color follows
            var(--vp-accent-rgb) — gold in Learner mode, copper in
            Publisher mode. */}
        <div className="px-5 pt-3">
          <div
            className="flex items-center justify-between gap-3 rounded-full border px-3 py-1.5 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.2,1)]"
            style={pillStyle}
          >
            <p
              className="pl-1 text-[0.58rem] font-black uppercase tracking-[0.16em] transition-colors duration-500"
              style={{ color: "rgb(var(--vp-accent-rgb))" }}
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
              className="relative h-6 w-11 shrink-0 rounded-full border border-white/12 bg-black/20 transition-colors active:scale-95"
              title={mode === "learner" ? "Learner mode" : "Publisher mode"}
            >
              <span
                className="absolute top-0.5 grid h-5 w-5 place-items-center rounded-full text-[#171100] transition-transform duration-200"
                style={{
                  background: "rgb(var(--vp-accent-rgb))",
                  boxShadow: "0 0 10px rgba(var(--vp-accent-rgb),0.45)",
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
            {MAIN_ITEMS.map((item, i) => {
              const isActive = item.key === activeKey;

              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.path)}
                  className={`vp-nav-row ${
                    isActive ? "vp-nav-row-active" : ""
                  } flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[0.9rem] font-black uppercase tracking-[0.08em] transition-[color,background,transform] duration-200 active:scale-[0.98] ${
                    isActive
                      ? "text-[#171100]"
                      : "text-white/70 hover:text-white"
                  }`}
                  style={{
                    // globals.css resets `button { font: inherit }` outside
                    // any @layer, so it beats Tailwind's layered .font-black
                    // utility regardless of specificity — force the weight
                    // here instead of fighting the cascade.
                    fontWeight: 900,
                    animationDelay: `${i * 60}ms`,
                    ...(isActive ? activeItemStyle : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = HOVER_TINT;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span className="vp-nav-icon grid place-items-center">
                    <Icon path={item.icon} size={18} />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mx-3 my-8 h-px bg-white/12" />

          <div className="flex flex-col gap-1.5">
            <a
              href={ADMIN_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="vp-nav-row flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[0.9rem] font-normal text-white/62 transition-[color,background] duration-200 hover:text-white active:scale-[0.98]"
              style={{ animationDelay: "240ms" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = HOVER_TINT;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="vp-nav-icon grid place-items-center">
                <WhatsAppIcon size={18} />
              </span>
              Chat Admin
            </a>

            <div className="vp-nav-row" style={{ animationDelay: "300ms" }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[0.9rem] font-normal text-red-300/85 transition-[color,background] duration-200 hover:bg-red-500/10 hover:text-red-200 active:scale-[0.98]"
              >
                <span className="grid place-items-center transition-transform duration-200 group-hover:translate-x-0.5">
                  <Icon path={ICONS.logout} size={18} />
                </span>
                Log Out
              </button>
            </div>
          </div>
        </nav>

        <div className="px-5 pb-7">
          <button
            type="button"
            onClick={() => setShowManageAccount(true)}
            className="group flex w-full items-center justify-center gap-3 rounded-[0.95rem] border border-white/10 bg-white/8 px-4 py-3 text-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-200 hover:bg-white/12 hover:text-white active:scale-[0.98]"
          >
            <span className="transition-transform duration-300 group-hover:rotate-45">
              <Icon path={ICONS.settings} size={19} />
            </span>
            <span className="text-sm font-semibold">Manage Account</span>
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />

      <ManageAccountModal
        open={showManageAccount}
        onClose={() => setShowManageAccount(false)}
      />
    </>
  );
}
