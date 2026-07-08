"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  className = "",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
      <div
        onClick={onClose}
        className="vp-modal-backdrop-in absolute inset-0"
        style={{ background: "rgba(4,3,1,0.72)", backdropFilter: "blur(10px)" }}
      />

      <div
        className={`vp-modal-panel-in relative w-full max-w-md overflow-hidden rounded-t-3xl border md:rounded-3xl ${className}`}
        style={{
          borderColor: "rgba(239,199,0,0.24)",
          background:
            "radial-gradient(120% 55% at 15% 0%, rgba(239,199,0,0.24), transparent 62%), linear-gradient(180deg, #2c2410 0%, #1a160c 45%, #100d08 100%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/25 text-white/60 transition-colors hover:text-white"
        >
          <X size={15} />
        </button>

        <div className="max-h-[80vh] overflow-y-auto p-6 md:p-7">
          {children}
        </div>
      </div>

      <style jsx global>{`
        @keyframes vpBackdropIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes vpModalPanelIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .vp-modal-backdrop-in {
          animation: vpBackdropIn 0.25s ease-out both;
        }
        .vp-modal-panel-in {
          animation: vpModalPanelIn 0.32s cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .vp-modal-backdrop-in,
          .vp-modal-panel-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
