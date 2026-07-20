"use client";

import { useId } from "react";
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

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
      style={{
        background: "linear-gradient(180deg, #121a30 0%, #0a0e1b 100%)",
        boxShadow: "0 -12px 32px -12px rgba(0,0,0,0.55)",
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
                      className="absolute inset-0 -z-10 rounded-2xl"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 30%, rgba(239,199,0,0.18), transparent 70%)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
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
                      duration: shouldReduceMotion ? 0 : 0.45,
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
