"use client";

import { useId, useState } from "react";
import {
  motion,
  useReducedMotion,
  LayoutGroup,
  AnimatePresence,
} from "framer-motion";
import type { CSSProperties, ComponentType } from "react";
import {
  HomeIcon,
  BookOpenIcon,
  ArrowUpTrayIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";
import { DollarSign } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAppShell, type Mode } from "../app/app/AppShellContext";

// Framer Motion tweens `color` by parsing literal rgb()/hex values, so it
// can't animate a raw `var(--vp-accent-rgb)` reference — these mirror the
// same mode → RGB mapping layout.tsx sets on that CSS variable, kept as
// plain strings here so the active-tab color transition still animates.
const ACCENT_RGB: Record<Mode, string> = {
  learner: "245,197,24",
  publisher: "255,145,64",
};

type TabId = "home" | "learn" | "earn" | "more";

// Compatible with Heroicons and lucide-react icons.
type IconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}>;

interface Tab {
  id: TabId;
  label: string;
  path: string;
  Outline: IconComponent;
  Solid?: IconComponent;
}

export default function MainTab() {
  const router = useRouter();
  const pathname = usePathname();
  const layoutGroupId = useId();
  const shouldReduceMotion = useReducedMotion();
  const { mode } = useAppShell();
  const accentRgb = ACCENT_RGB[mode];
  const accent = `rgb(${accentRgb})`;

  // Publisher mode swaps Learn for Publish — same tab slot, but it points
  // at the book-management page instead of the course roadmap, with its
  // own upload-flavored icon instead of Learn's book icon.
  const TABS: Tab[] = [
    {
      id: "home",
      label: "Home",
      path: "/app",
      Outline: HomeIcon,
      Solid: HomeIconSolid,
    },
    mode === "publisher"
      ? {
          id: "learn",
          label: "Publish",
          path: "/app/publish",
          Outline: ArrowUpTrayIcon,
        }
      : {
          id: "learn",
          label: "Learn",
          path: "/app/learn",
          Outline: BookOpenIcon,
        },
    {
      id: "earn",
      label: "Earn",
      path: "/app/earn",
      Outline: DollarSign,
    },
    {
      id: "more",
      label: "More",
      path: "/app/more",
      Outline: EllipsisHorizontalIcon,
    },
  ];

  const getActiveTabFromPath = (path: string): TabId => {
    if (path === "/app") return "home";
    if (path.startsWith("/app/learn") || path.startsWith("/app/publish"))
      return "learn";
    if (path.startsWith("/app/earn")) return "earn";
    if (path.startsWith("/app/more")) return "more";
    return "home";
  };

  const handleTabClick = (tab: Tab) => {
    router.push(tab.path);
  };

  const currentActive = getActiveTabFromPath(pathname || "/app");

  // Bumped whenever a tab is pressed so the glass pill can replay its
  // shimmer sweep — keyed by tab id + a fresh timestamp per press.
  const [pressSignal, setPressSignal] = useState<{
    id: TabId;
    token: number;
  } | null>(null);

  return (
    <nav
      // Bar radius (2.25rem) = pill radius (1.75rem) + edge gap (0.5rem),
      // so the bar's top corners run concentric with the end pills'
      // corners when Home or More is active.
      className="fixed inset-x-0 bottom-0 z-40 overflow-hidden rounded-t-[2.25rem] border-t border-white/10 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
      style={{
        background: "black",
        boxShadow:
          "0 -12px 32px -12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <LayoutGroup id={layoutGroupId}>
        {/*
          With 4 tabs, each li takes a full quarter of the bar (flex-1)
          and the button fills its li (w-full), so the glass pill —
          absolutely inset to the button — stretches wide across the
          tab's whole slot. px-2 (0.5rem) pins the end pills exactly
          0.5rem from the bar's corners; gap-1 keeps neighboring pills
          from touching.
        */}
        <ul className="flex items-stretch gap-1 px-2">
          {TABS.map((tab, i) => {
            const isActive = currentActive === tab.id;
            const Icon = isActive && tab.Solid ? tab.Solid : tab.Outline;

            return (
              <motion.li
                key={tab.id}
                className="relative flex flex-1 list-none"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.04 * i,
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  onTapStart={() =>
                    setPressSignal({ id: tab.id, token: Date.now() })
                  }
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  // w-full lets the pill (absolute inset-0) span the whole
                  // quarter-width slot; extra bottom padding reserves room
                  // for the dot INSIDE the pill, with icon + label + dot
                  // centered as one stack.
                  className="relative flex w-full flex-col items-center justify-center gap-1 px-2 pb-4 pt-2.5"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={tab.label}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-glow"
                      // Wide glass sheet filling the tab's slot. 1.75rem
                      // radius + the 0.5rem edge gap = the bar's 2.25rem
                      // top radius, so the arcs nest at both ends.
                      className="absolute inset-0 -z-10 overflow-hidden rounded-[1.75rem]"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.09) 100%)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        backdropFilter: "blur(18px) saturate(1.6)",
                        WebkitBackdropFilter: "blur(18px) saturate(1.6)",
                        boxShadow:
                          "0 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -8px 14px rgba(0,0,0,0.28)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 34,
                      }}
                    >
                      {/* Static diagonal sheen — a soft light streak across the glass */}
                      <span
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.16) 48%, transparent 65%)",
                        }}
                      />

                      {/* Press shimmer — replays a brighter sweep on tap */}
                      <AnimatePresence>
                        {pressSignal?.id === tab.id && (
                          <motion.span
                            key={pressSignal.token}
                            className="pointer-events-none absolute inset-y-0 w-1/2"
                            initial={{ x: "-140%", opacity: 0 }}
                            animate={{ x: "220%", opacity: [0, 0.6, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            style={{
                              background:
                                "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.55) 50%, transparent 80%)",
                              filter: "blur(2px)",
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.span>
                  )}

                  <motion.span
                    key={`${tab.id}-${isActive}`}
                    initial={
                      shouldReduceMotion ? false : { scale: isActive ? 0.7 : 1 }
                    }
                    animate={{
                      scale: isActive ? [0.7, 1.25, 1] : 1,
                      y: isActive ? -1 : 0,
                      rotate:
                        isActive && !shouldReduceMotion ? [0, -8, 6, 0] : 0,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.28,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="relative"
                  >
                    <Icon
                      className="h-[22px] w-[22px] transition-colors duration-200"
                      style={{
                        color: isActive ? accent : "rgba(255,255,255,0.4)",
                        filter: isActive
                          ? `drop-shadow(0 0 6px rgba(${accentRgb},0.5))`
                          : "none",
                      }}
                      strokeWidth={isActive && tab.Solid ? 0 : 1.8}
                    />
                  </motion.span>

                  <motion.span
                    animate={{
                      color: isActive ? accent : "rgba(255,255,255,0.4)",
                      fontWeight: isActive ? 700 : 600,
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-[0.65rem] uppercase tracking-[0.08em] leading-none"
                  >
                    {tab.label}
                  </motion.span>

                  {/* Active dot — inside the pill, centered near its bottom edge */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="tab-dot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                        style={{
                          background: accent,
                          boxShadow: `0 0 6px rgba(${accentRgb},0.7)`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}
