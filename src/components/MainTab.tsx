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
  UserPlusIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";
import { DollarSign } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const GOLD = "rgb(239,199,0)";

type TabId = "home" | "learn" | "earn" | "withdraw" | "more";

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

const TABS: Tab[] = [
  {
    id: "home",
    label: "Home",
    path: "/app",
    Outline: HomeIcon,
    Solid: HomeIconSolid,
  },
  {
    id: "learn",
    label: "Learn",
    path: "/app/learn",
    Outline: BookOpenIcon,
  },
  {
    id: "earn",
    label: "Earn",
    path: "/app/earn",
    Outline: UserPlusIcon,
  },
  {
    id: "withdraw",
    label: "Withdraw",
    path: "/app/withdraw",
    Outline: DollarSign,
  },
  {
    id: "more",
    label: "More",
    path: "/app/more",
    Outline: EllipsisHorizontalIcon,
  },
];

export default function MainTab() {
  const router = useRouter();
  const pathname = usePathname();
  const layoutGroupId = useId();
  const shouldReduceMotion = useReducedMotion();

  const getActiveTabFromPath = (path: string): TabId => {
    if (path === "/app") return "home";
    if (path.startsWith("/app/learn")) return "learn";
    if (path.startsWith("/app/earn")) return "earn";
    if (path.startsWith("/app/withdraw")) return "withdraw";
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
      className="fixed inset-x-0 bottom-0 z-40 overflow-hidden rounded-t-[2rem] border-t border-white/10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
      style={{
        background: "rgba(6,8,16,0.6)",
        boxShadow:
          "0 -12px 32px -12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <LayoutGroup id={layoutGroupId}>
        <ul className="flex items-stretch justify-around">
          {TABS.map((tab, i) => {
            const isActive = currentActive === tab.id;
            const Icon = isActive && tab.Solid ? tab.Solid : tab.Outline;

            return (
              <motion.li
                key={tab.id}
                className="relative flex list-none"
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
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.88 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  className="relative flex flex-col items-center gap-1 px-3 py-1.5"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={tab.label}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-glow"
                      className="absolute left-[calc(50%-2.5rem)] top-[-1.25rem] -z-10 h-20 w-20 overflow-hidden rounded-full"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.09) 100%)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        backdropFilter: "blur(18px) saturate(1.6)",
                        WebkitBackdropFilter: "blur(18px) saturate(1.6)",
                        boxShadow:
                          "0 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -8px 14px rgba(0,0,0,0.28)",
                      }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                        color: isActive ? GOLD : "rgba(255,255,255,0.4)",
                        filter: isActive
                          ? "drop-shadow(0 0 6px rgba(239,199,0,0.5))"
                          : "none",
                      }}
                      strokeWidth={isActive && tab.Solid ? 0 : 1.8}
                    />
                  </motion.span>

                  <motion.span
                    animate={{
                      color: isActive ? GOLD : "rgba(255,255,255,0.4)",
                      fontWeight: isActive ? 700 : 600,
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-[0.65rem] uppercase tracking-[0.08em] leading-none"
                  >
                    {tab.label}
                  </motion.span>

                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="tab-dot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -bottom-0.5 h-1 w-1 rounded-full"
                        style={{
                          background: GOLD,
                          boxShadow: "0 0 6px rgba(239,199,0,0.7)",
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
