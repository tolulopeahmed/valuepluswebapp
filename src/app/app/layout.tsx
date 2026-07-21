// src/app/app/layout.tsx

"use client";

import { useEffect, type CSSProperties } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import MainTab from "../../components/MainTab";
import { AppShellProvider, useAppShell, type Mode } from "./AppShellContext";
import { USER } from "./MockUser";
import { VP_PAGE_BG } from "./GlassCard";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

// The brighter publisher tone that used to be button-only now backs the
// whole app's publisher accent — kept as the single source of truth here;
// Sidebar.tsx and MainTab.tsx mirror this exact value.
const ACCENT_RGB: Record<Mode, string> = {
  learner: "245,197,24",
  publisher: "255,145,64",
};

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { mode, setMode, sidebarOpen, setSidebarOpen } = useAppShell();

  useEffect(() => {
    const prevBg = document.body.style.background;
    document.body.style.background = VP_PAGE_BG;
    return () => {
      document.body.style.background = prevBg;
    };
  }, []);

  const rootStyle: CSSVars = {
    background: `radial-gradient(circle at 50% -10%, rgba(var(--vp-accent-rgb),0.05), transparent 40%), linear-gradient(180deg, #12163a 0%, ${VP_PAGE_BG} 45%, #090b22 100%)`,
    fontFamily: "'Product Sans', 'Proxima Nova', sans-serif",
    "--vp-accent-rgb": ACCENT_RGB[mode],
    // --vp-accent backs .btn-primary/.btn-accent's solid fill (globals.css)
    // — it used to be a single global gold, so buttons never actually
    // changed color in Publisher mode. Scoping it here, inside the app
    // shell only, fixes that without touching the public site's buttons.
    "--vp-accent": `rgb(${ACCENT_RGB[mode]})`,
  };

  return (
    <div
      className="relative min-h-svh overflow-x-hidden md:flex"
      style={rootStyle}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={mode}
        onModeChange={setMode}
        firstName={USER.firstName}
        xp={USER.xp}
        level={USER.level}
      />

      <div className="min-w-0 flex-1">
        <Header
          streak={USER.streak}
          notificationCount={2}
          mode={mode}
          onModeChange={setMode}
          onMenuPress={() => setSidebarOpen(true)}
          onBellPress={() => {}}
        />

        {/* Header is now `fixed`, so it no longer reserves space in
            normal flow — pt here covers the header's own height (not
            just the gap after it) so content doesn't start underneath it. */}
        <main className="px-4 pb-28 pt-[5.25rem] md:px-8 md:pb-10 md:pt-[6.5rem]">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 md:gap-6">
            {children}
          </div>
        </main>
      </div>

      {/* MainTab already has md:hidden baked in, so desktop only ever sees Header */}
      <MainTab />

      <style jsx global>{`
        @keyframes vpFadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .vp-card-in {
          animation: vpFadeInUp 0.5s cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }

        @keyframes vpPulseRing {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(var(--vp-accent-rgb), 0.55);
          }
          50% {
            box-shadow: 0 0 0 13px rgba(var(--vp-accent-rgb), 0);
          }
        }

        .vp-pulse-ring {
          animation: vpPulseRing 1.8s ease-in-out infinite;
        }

        @keyframes vpRoadmapShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .vp-roadmap-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.85),
            transparent
          );
          animation: vpRoadmapShimmer 1.6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .vp-card-in,
          .vp-pulse-ring,
          .vp-roadmap-shimmer {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppShellProvider>
  );
}
