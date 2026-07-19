"use client";

import { useId } from "react";
import { motion, useReducedMotion, LayoutGroup } from "framer-motion";
import {
  HomeIcon,
  BookOpenIcon,
  UserPlusIcon,
  WalletIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";
import { useRouter, usePathname } from "next/navigation";

const GOLD = "rgb(239,199,0)";

type TabId = "home" | "learn" | "refer" | "withdraw" | "more";

interface Tab {
  id: TabId;
  label: string;
  path: string;
  Outline: typeof HomeIcon;
  Solid?: typeof HomeIconSolid;
}

const TABS: Tab[] = [
  {
    id: "home",
    label: "Home",
    path: "/app",
    Outline: HomeIcon,
    Solid: HomeIconSolid,
  },
  { id: "learn", label: "Learn", path: "/app/learn", Outline: BookOpenIcon },
  { id: "refer", label: "Refer", path: "/app/refer", Outline: UserPlusIcon },
  {
    id: "withdraw",
    label: "Withdraw",
    path: "/app/withdraw",
    Outline: WalletIcon,
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

  // Determine active tab based on current path
  const getActiveTabFromPath = (path: string): TabId => {
    if (path === "/app") return "home";
    if (path.startsWith("/app/learn")) return "learn";
    if (path.startsWith("/app/refer")) return "refer";
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/6 bg-[black] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
      style={{ boxShadow: "0 -12px 32px -12px rgba(0,0,0,0.55)" }}
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
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
                          "radial-gradient(circle at 50% 30%, rgba(239,199,0,0.16), transparent 70%)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}

                  <motion.span
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="relative"
                  >
                    <Icon
                      className="h-22px w-22px transition-colors duration-200"
                      style={{
                        color: isActive ? GOLD : "rgba(255,255,255,0.4)",
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
                    className="text-[0.65rem] leading-none"
                  >
                    {tab.label}
                  </motion.span>

                  {isActive && (
                    <motion.span
                      layoutId="tab-dot"
                      className="absolute -bottom-0.5 h-1 w-1 rounded-full"
                      style={{ background: GOLD }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}
