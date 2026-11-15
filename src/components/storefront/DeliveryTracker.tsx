"use client";

// The reader's view of a single copy the author ships, delivered by a
// courier ValuePlus books (never branded as anyone else). Mirrors
// apps.storefront.deliveries.reader_view server-side.

import { Check, Phone, Truck, XCircle } from "lucide-react";

export interface DeliveryView {
  id: string;
  status: "preparing" | "booked" | "in_transit" | "delivered" | "cancelled";
  status_label: string;
  steps: { status: string; label: string; done: boolean; at: string | null }[];
  cancelled: boolean;
  by_author: boolean;
  rider_phone: string;
  eta: string;
  delivery_fee: string;
  updated_at: string;
}

const STEP_HINT: Record<string, string> = {
  preparing: "The author is packing your copy",
  booked: "A rider is collecting it from the author",
  in_transit: "On its way to you - the rider will call when they arrive",
  delivered: "Delivered - enjoy the read!",
};

function when(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function DeliveryTracker({ delivery }: { delivery: DeliveryView }) {
  if (delivery.cancelled) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-xs text-black/60">
        <XCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
        <span>This delivery was cancelled. ValuePlus will contact you about a refund.</span>
      </div>
    );
  }
  const current = delivery.steps.filter((s) => s.done).length - 1;
  const hint = (status: string) =>
    delivery.by_author && status === "in_transit" ? "The author is bringing it to you" : STEP_HINT[status];

  return (
    <div className="mt-3 rounded-xl border border-black/10 bg-black/[0.02] p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <Truck size={15} className="text-[#171100]/70" />
        <p className="text-xs font-black uppercase tracking-wide text-black/50">Delivery</p>
        <span className="ml-auto text-xs font-bold text-[#171100]">{delivery.status_label}</span>
      </div>

      <ol className="flex flex-col">
        {delivery.steps.map((step, i) => {
          const isCurrent = i === current;
          return (
            <li key={step.status} className="relative flex gap-3 pb-3 last:pb-0">
              {i < delivery.steps.length - 1 && (
                <span
                  className="absolute left-[9px] top-5 h-[calc(100%-12px)] w-0.5"
                  style={{ background: step.done && delivery.steps[i + 1].done ? "#16a34a" : "rgba(0,0,0,0.1)" }}
                />
              )}
              <span
                className="relative z-10 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2"
                style={{ borderColor: step.done ? "#16a34a" : "rgba(0,0,0,0.15)", background: step.done ? "#16a34a" : "#fff" }}
              >
                {step.done && <Check size={11} strokeWidth={3} className="text-white" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${isCurrent ? "font-black text-[#14181f]" : step.done ? "font-semibold text-black/70" : "text-black/35"}`}>
                  {step.label}
                </p>
                {isCurrent && <p className="text-xs text-black/50">{hint(step.status)}</p>}
                {step.done && step.at && <p className="text-[0.68rem] text-black/35">{when(step.at)}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {delivery.rider_phone && (
        <a
          href={`tel:${delivery.rider_phone}`}
          className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#171100] text-xs font-bold text-[#EFC700]"
        >
          <Phone size={13} /> Call your rider
        </a>
      )}
      {delivery.eta && delivery.status !== "delivered" && (
        <p className="mt-2.5 text-xs text-black/50">Expected delivery: {delivery.eta.toLowerCase()} after pickup.</p>
      )}
    </div>
  );
}
