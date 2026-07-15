"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

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
  const [mode, setMode] = useState<Mode>("learner");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShellContext.Provider
      value={{ mode, setMode, sidebarOpen, setSidebarOpen }}
    >
      {children}
    </AppShellContext.Provider>
  );
}
