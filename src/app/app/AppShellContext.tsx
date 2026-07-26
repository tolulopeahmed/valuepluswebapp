"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../lib/api";

export type Mode = "learner" | "publisher";

interface AppShellContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error(
      "useAppShell must be used within AppShellProvider (i.e. inside src/app/app)",
    );
  }
  return ctx;
}

export function AppShellProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setModeState] = useState<Mode>("learner");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loads the user's saved dashboard preference exactly once, the first
  // time it becomes available (auth hydration finishes async) — guarded
  // by user id rather than a ref, same "adjust state during render"
  // pattern used for the prefill effect in GetQuote.tsx. Only runs once
  // per login, so it never fights a manual toggle later in the session.
  const [loadedModeForUserId, setLoadedModeForUserId] = useState<number | null>(
    null,
  );
  if (user && loadedModeForUserId !== user.id) {
    setLoadedModeForUserId(user.id);
    if (user.preferred_mode === "publisher") {
      setModeState("publisher");
    }
  }

  // Persists every toggle so it survives logout/login — best-effort;
  // the UI already updated optimistically above, this just keeps the
  // account's saved preference in sync in the background.
  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    apiFetch("/auth/me/", {
      method: "PATCH",
      body: JSON.stringify({ preferred_mode: m }),
    }).catch(() => {});
  }, []);

  return (
    <AppShellContext.Provider
      value={{ mode, setMode, sidebarOpen, setSidebarOpen }}
    >
      {children}
    </AppShellContext.Provider>
  );
}
