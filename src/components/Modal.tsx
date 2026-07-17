"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

// Nothing external ever changes here — this is purely a way to ask "has
// this component hydrated on the client yet?" without the setState-in-effect
// pattern. React renders the server snapshot (false) on the server and
// during the first client render (so hydration matches), then swaps to the
// client snapshot (true) right after, no manual setState involved.
const noopSubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export default function Modal({
  open,
  onClose,
  children,
  className = "",
}: ModalProps) {
  // Portal target isn't available during SSR — this stays false until
  // hydration finishes so we only ever try document.body on the client.
  const mounted = useIsMounted();

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

  if (!open || !mounted) return null;

  // Rendered into document.body via a portal — not just a component with a
  // high z-index. Any ancestor with a `transform` (including the vp-card-in
  // entrance animation, even once it settles at translateY(0)) becomes a
  // containing block for `position: fixed` descendants, which would shrink
  // this backdrop down to that ancestor's box instead of the viewport. The
  // portal sidesteps that entirely by not being nested inside it.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-4">
      {/* Dark, blurred scrim behind the panel — standard modal behavior,
          just tuned to a navy tint so it sits with the rest of the brand
          instead of a neutral black. */}
      <div
        onClick={onClose}
        className="vp-modal-backdrop-in absolute inset-0"
        style={{
          background: "rgba(6,8,18,0.75)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Full-bleed on mobile (no side margin, top-only rounding); capped
          width and fully rounded once we hit md. Dark navy panel with a
          soft gold glow in the top-left corner — same accent language as
          the rest of the app, applied to the modal chrome. */}
      <div
        className={`vp-modal-panel-in relative w-full overflow-hidden rounded-t-3xl border md:w-full md:max-w-md md:rounded-3xl ${className}`}
        style={{
          borderColor: "rgba(239,199,0,0.22)",
          background:
            "radial-gradient(120% 55% at 15% 0%, rgba(239,199,0,0.16), transparent 62%), linear-gradient(180deg, #1B2340 0%, #10152A 45%, #0A0E1B 100%)",
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
    </div>,
    document.body,
  );
}
