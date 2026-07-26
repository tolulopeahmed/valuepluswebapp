"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { setSnackbarListener, type SnackbarType } from "@/lib/snackbar";

interface Toast {
  id: number;
  text: string;
  type: SnackbarType;
  leaving: boolean;
}

const DISPLAY_MS = 4000;
const EXIT_MS = 280;

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      setTimeout(() => remove(id), EXIT_MS);
    },
    [remove],
  );

  useEffect(() => {
    setSnackbarListener((text, type) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, text, type, leaving: false }]);
      setTimeout(() => dismiss(id), DISPLAY_MS);
    });
    return () => setSnackbarListener(null);
  }, [dismiss]);

  return (
    <>
      {children}

      <div className="pointer-events-none fixed bottom-4 left-4 z-[999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className={`vp-snackbar pointer-events-auto flex cursor-pointer items-start gap-2.5 rounded-xl border px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-md ${
              t.leaving ? "vp-snackbar-out" : "vp-snackbar-in"
            }`}
            style={{
              // Brighter, more saturated than the old near-black
              // #123524/#3a1414 — the green/red reads at a glance now
              // instead of the toast looking like a generic dark card.
              background: t.type === "success" ? "#1c7a44" : "#a83232",
              borderColor:
                t.type === "success" ? "rgba(134,239,172,0.55)" : "rgba(252,165,165,0.55)",
            }}
          >
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
              style={{
                background: t.type === "success" ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.22)",
                color: "#ffffff",
              }}
            >
              {t.type === "success" ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <AlertTriangle size={11} strokeWidth={3} />
              )}
            </span>
            <p className="text-[0.82rem] font-medium leading-snug text-white">{t.text}</p>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes vpSnackIn {
          from {
            opacity: 0;
            transform: translateX(-120%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes vpSnackOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-120%);
          }
        }
        .vp-snackbar-in {
          animation: vpSnackIn 0.32s cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        .vp-snackbar-out {
          animation: vpSnackOut 0.28s cubic-bezier(0.4, 0, 1, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .vp-snackbar-in,
          .vp-snackbar-out {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
