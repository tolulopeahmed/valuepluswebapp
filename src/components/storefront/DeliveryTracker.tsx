"use client";

// The reader's tracking for a single copy the author ships, delivered by a
// courier ValuePlus books (never branded as anyone else). Laid out like a
// courier tracking page: estimated delivery date, a vertical step list,
// then the tracking history. Mirrors apps.storefront.deliveries.reader_view.

import { Check, MapPin, MessageCircle, Phone, XCircle } from "lucide-react";
import DeliveryStepBar from "./DeliveryStepBar";

export interface DeliveryView {
  id: string;
  status: "preparing" | "booked" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  status_label: string;
  steps: { status: string; label: string; done: boolean; at: string | null }[];
  events: { at: string; title: string; place: string }[];
  cancelled: boolean;
  by_author: boolean;
  destination: string;
  deliver_by: string | null;
  delivered_at: string | null;
  rider_phone: string;
  eta: string;
  delivery_fee: string;
  updated_at: string;
}

const ADMIN_WHATSAPP_URL = "https://wa.me/2349024312689";

const STEP_HINT: Record<string, string> = {
  preparing: "The author is packing your copy",
  booked: "A rider is coming to collect it",
  picked_up: "The rider has your book",
  in_transit: "On its way - the rider will call when they arrive",
  delivered: "Enjoy the read!",
};

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function DeliveryTracker({ delivery }: { delivery: DeliveryView }) {
  const current = delivery.steps.findIndex((s) => s.status === delivery.status);
  const headline = delivery.cancelled
    ? "Delivery cancelled"
    : delivery.status === "delivered" && delivery.delivered_at
      ? dayLabel(delivery.delivered_at)
      : delivery.deliver_by
        ? dayLabel(delivery.deliver_by)
        : delivery.eta || "We'll confirm soon";

  return (
    <div className="mt-3 grid gap-3">
      <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
        <p className={`text-xs font-bold ${delivery.cancelled ? "text-red-500" : "text-[#c2410c]"}`}>
          {delivery.cancelled ? "Status" : delivery.status === "delivered" ? "Delivered on" : "Estimated delivery date"}
        </p>
        <p className="mt-0.5 text-2xl font-black tracking-tight text-[#14181f]">{headline}</p>
        {delivery.destination && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-black/60">
            <MapPin size={14} /> To {delivery.destination}
          </p>
        )}

        {delivery.cancelled ? (
          <p className="mt-3 flex items-start gap-2 text-xs text-black/60">
            <XCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
            This delivery was cancelled. ValuePlus will contact you about a refund.
          </p>
        ) : (
          <>
          <div className="mt-4">
            <DeliveryStepBar status={delivery.status} />
          </div>
          <ol className="mt-4 border-t border-black/10 pt-4">
            {delivery.steps.map((step, i) => {
              const isCurrent = i === current;
              const last = i === delivery.steps.length - 1;
              return (
                <li key={step.status} className="relative flex gap-3 pb-4 last:pb-0">
                  {!last && (
                    <span
                      className="absolute left-[10px] top-6 h-[calc(100%-20px)] w-0.5"
                      style={{ background: delivery.steps[i + 1].done ? "#16a34a" : "rgba(0,0,0,0.1)" }}
                    />
                  )}
                  <span
                    className="relative z-10 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2"
                    style={{
                      borderColor: step.done ? (isCurrent ? "#EFC700" : "#16a34a") : "rgba(0,0,0,0.15)",
                      background: step.done ? (isCurrent ? "#EFC700" : "#16a34a") : "#fff",
                    }}
                  >
                    {step.done && !isCurrent && <Check size={12} strokeWidth={3} className="text-white" />}
                    {isCurrent && <span className="h-2 w-2 rounded-full bg-[#171100]" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${isCurrent ? "font-black text-[#14181f]" : step.done ? "font-semibold text-black/75" : "text-black/35"}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-black/55">
                        {delivery.by_author && step.status === "in_transit" ? "The author is bringing it to you" : STEP_HINT[step.status]}
                      </p>
                    )}
                    {step.done && step.at && <p className="text-[0.7rem] text-black/40">{timeLabel(step.at)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {delivery.rider_phone && (
            <a href={`tel:${delivery.rider_phone}`} className="flex h-10 items-center gap-1.5 rounded-full bg-[#171100] px-4 text-xs font-bold text-[#EFC700]">
              <Phone size={14} /> Call rider
            </a>
          )}
          <a
            href={ADMIN_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-1.5 rounded-full border border-black/15 px-4 text-xs font-bold text-[#14181f]"
          >
            <MessageCircle size={14} /> Chat with ValuePlus
          </a>
        </div>
      </div>

      {delivery.events.length > 0 && (
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="mb-3 text-sm font-black text-[#14181f]">Tracking history</p>
          <ol>
            {delivery.events.map((event, i) => {
              const last = i === delivery.events.length - 1;
              return (
                <li key={`${event.at}-${event.title}`} className="relative grid grid-cols-[88px_14px_1fr] gap-2.5 pb-3.5 last:pb-0">
                  <span className="text-[0.7rem] leading-5 text-black/45">{timeLabel(event.at)}</span>
                  <span className="relative flex justify-center">
                    <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-[#c2410c]" : "bg-black/15"}`} />
                    {!last && <span className="absolute top-5 h-[calc(100%-4px)] w-0.5 bg-black/10" />}
                  </span>
                  <span>
                    <span className={`block text-sm ${i === 0 ? "font-bold text-[#14181f]" : "text-black/65"}`}>{event.title}</span>
                    {event.place && <span className="block text-xs text-black/45">{event.place}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
