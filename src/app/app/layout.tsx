// src/app/app/layout.tsx

"use client";

import { useEffect, type CSSProperties } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import MainTab from "../../components/MainTab";
import { AppShellProvider, useAppShell, type Mode } from "./AppShellContext";
import { useAuth } from "../../contexts/AuthContext";
import { useStudentProfile, deriveLevel } from "../../hooks/useAcademy";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { MyBooksProvider } from "../../hooks/useMyBooks";
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
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { profile } = useStudentProfile();
  const { level } = deriveLevel(profile?.total_xp ?? 0);
  const { count: unreadNotificationCount } = useUnreadNotificationCount();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Switching mode from the sidebar/header toggle used to only re-theme
  // the accent color — if you were sitting on /app/learn and flipped to
  // Publisher, the page itself stayed put showing learner content while
  // the nav around it now said "Publish". /app/learn and /app/publish
  // are each other's mode-specific counterpart, so a switch while on
  // either one now also navigates to its counterpart. Mode-agnostic
  // pages (/app, /app/earn, /app/more) just re-theme as before.
  const handleModeChange = (next: Mode) => {
    setMode(next);

    if (next === "publisher" && pathname === "/app/learn") {
      router.push("/app/publish");
    } else if (next === "learner" && pathname === "/app/publish") {
      router.push("/app/learn");
    }
  };

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

  // While the initial token/session check runs, or once we know there's
  // no session (redirect above is in flight), don't flash the real shell.
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="grid min-h-svh place-items-center" style={{ background: VP_PAGE_BG }}>
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-svh overflow-x-hidden md:flex"
      style={rootStyle}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={mode}
        onModeChange={handleModeChange}
        firstName={user.first_name}
        xp={profile?.total_xp ?? 0}
        level={level}
      />

      <div className="min-w-0 flex-1">
        <Header
          streak={profile?.current_streak_days ?? 0}
          notificationCount={unreadNotificationCount}
          mode={mode}
          onModeChange={handleModeChange}
          onMenuPress={() => setSidebarOpen(true)}
          onBellPress={() => router.push("/app/transactions")}
        />

        {/* Header is now `fixed`, so it no longer reserves space in
            normal flow — pt here covers the header's own height (not
            just the gap after it) so content doesn't start underneath it. */}
        <main className="px-4 pb-28 pt-[3.75rem] md:px-8 md:pb-10 md:pt-[4.25rem]">
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
      <MyBooksProvider>
        <AppShellInner>{children}</AppShellInner>
      </MyBooksProvider>
    </AppShellProvider>
  );
}
