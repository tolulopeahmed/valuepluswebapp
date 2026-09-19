"use client";

import Image from "next/image";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

export interface LoadingStep {
  label: string;
  done: boolean;
}

const noopSubscribe = () => () => {};

export default function LoadingModal({
  open,
  steps = [],
}: {
  open: boolean;
  steps?: LoadingStep[];
}) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,10,38,0.84)] px-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Please wait"
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <p className="mb-5 text-sm font-black text-white">
          Please wait<span className="vp-loading-dots" aria-hidden="true" />
        </p>

        <div className="relative mb-6 grid h-20 w-20 place-items-center">
          <div className="vp-loading-ring absolute inset-0 rounded-full border-[3px] border-white/15 border-r-[rgb(239,199,0)] border-t-[rgb(239,199,0)]" />
          <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.06] shadow-[0_0_28px_rgba(239,199,0,0.14)]">
            <Image
              src="/images/logos/valueplus-mark.png"
              alt="ValuePlus"
              width={42}
              height={42}
              className="h-8 w-10 object-contain"
            />
          </div>
        </div>

        {steps.length > 0 && (
          <div className="flex max-h-52 w-full flex-col items-center gap-3 overflow-y-auto">
            {steps.map((step, index) => (
              <div key={`${step.label}-${index}`} className="flex items-center gap-3 text-left">
                {step.done ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#20d67b]">
                    <Check size={12} strokeWidth={3.5} className="text-[#07150d]" />
                  </span>
                ) : (
                  <span className="vp-loading-mini h-5 w-5 shrink-0 rounded-full border-2 border-white/20 border-t-white/70" />
                )}
                <span className="text-[0.82rem] text-white/85">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes vpLoadingSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes vpLoadingDots {
          0% { content: ""; }
          25% { content: "."; }
          50% { content: ".."; }
          75%, 100% { content: "..."; }
        }
        .vp-loading-ring { animation: vpLoadingSpin 1.25s linear infinite; }
        .vp-loading-mini { animation: vpLoadingSpin 0.8s linear infinite; }
        .vp-loading-dots::after {
          content: "";
          animation: vpLoadingDots 1.8s steps(1, end) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .vp-loading-ring, .vp-loading-mini { animation-duration: 2.5s; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
