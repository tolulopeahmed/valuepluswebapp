"use client";

// One author delivery: what to pack, who it's for, and where it is. Used
// on the Deliveries page and on Home while an order still needs the
// author or is on its way.

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, MapPin, Package, Phone, Truck } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { notify } from "@/lib/snackbar";
import DeliveryStepBar from "@/components/storefront/DeliveryStepBar";

export type Status = "preparing" | "booked" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export interface Delivery {
  id: string;
  status: Status;
  status_label: string;
  is_open: boolean;
  provider: "courier" | "self";
  courier_name: string;
  courier_phone: string;
  rider_name: string;
  rider_phone: string;
  pickup_eta: string;
  delivery_eta: string;
  picked_up_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  items: { title: string; format: string; quantity: number }[];
  book_cover: string | null;
  order_reference: string;
  reader_name: string;
  reader_phone: string;
  shipping_address: string;
}


export const areaOf = (address: string) => {
  const parts = address.replace(/\n/g, ",").split(",").map((p) => p.trim()).filter((p) => p && !/^nigeria$/i.test(p));
  return parts.length > 1 ? parts.slice(-2).join(", ") : parts[0] ?? "";
};
export const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";

export default function DeliveryCard({ delivery, pickupAddress, onChanged }: { delivery: Delivery; pickupAddress: string; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const first = delivery.items[0];
  const copies = delivery.items.reduce((n, i) => n + i.quantity, 0);
  const isSelf = delivery.provider === "self";

  const run = async (action: "ready" | "self" | "cancel" | "cancel-pickup", body: object = {}) => {
    setBusy(true);
    try {
      // apiFetch shows the server's success message or error itself.
      await apiFetch(`/storefront/deliveries/${delivery.id}/${action}/`, { method: "POST", body: JSON.stringify(body) });
      onChanged();
    } catch (err) {
      if (!(err instanceof ApiError)) notify("Could not update the delivery. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const pill =
    delivery.status === "delivered" ? "bg-emerald-400/15 text-emerald-400"
    : delivery.status === "cancelled" ? "bg-red-500/15 text-red-400"
    : "bg-[rgb(var(--vp-accent-rgb))]/15 text-[rgb(var(--vp-accent-rgb))]";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex gap-3">
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
          {delivery.book_cover && <Image src={delivery.book_cover} alt="" fill sizes="48px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">
            {first?.title}{delivery.items.length > 1 ? ` + ${delivery.items.length - 1} more` : ""}
          </p>
          <p className="text-xs text-white/50">
            {copies} × {first?.format} · #{delivery.order_reference.slice(0, 8).toUpperCase()}
          </p>
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-black ${pill}`}>
            {delivery.status_label.toUpperCase()}
          </span>
        </div>
      </div>

      {delivery.status !== "cancelled" && (
        <div className="mt-3.5">
          <DeliveryStepBar status={delivery.status} tone="dark" />
        </div>
      )}

      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
        <p className="font-bold text-white">For {delivery.reader_name}</p>
        <p className="mt-1 flex items-start gap-1.5 whitespace-pre-line">
          <MapPin size={12} className="mt-0.5 shrink-0" /> {isSelf ? delivery.shipping_address : areaOf(delivery.shipping_address)}
        </p>
        {isSelf && delivery.is_open && delivery.reader_phone && (
          <a href={`tel:${delivery.reader_phone}`} className="mt-1 flex items-center gap-1.5 text-[rgb(var(--vp-accent-rgb))]">
            <Phone size={12} /> Call {delivery.reader_phone}
          </a>
        )}
      </div>

      {delivery.status === "preparing" && (
        <div className="mt-3 grid gap-2">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-white/65">
            <Package size={14} className="mt-0.5 shrink-0 text-[rgb(var(--vp-accent-rgb))]" />
            Pack the book, then tap below. A rider will collect it from {pickupAddress ? areaOf(pickupAddress) : "your pickup address"}.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => run("ready")}
            className="rounded-xl bg-[rgb(var(--vp-accent-rgb))] px-4 py-3 text-sm font-black text-[#171100] disabled:opacity-50"
          >
            {busy ? "Booking a rider…" : "Packed - ready for pickup"}
          </button>
          <div className="flex justify-between text-[0.7rem] text-white/40">
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm(`Deliver it to ${delivery.reader_name} yourself? We'll tell them it's on its way.`) && run("self", { step: "in_transit" })}
              className="underline underline-offset-2"
            >
              I&apos;ll deliver it myself
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm("Cancel this order? We'll refund the reader.") && run("cancel", { reason: "Author couldn't fulfil" })}
              className="underline underline-offset-2"
            >
              Can&apos;t fulfil it
            </button>
          </div>
        </div>
      )}

      {delivery.status === "booked" && (
        <div className="mt-3 grid gap-2">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-white/65">
            <Truck size={14} className="mt-0.5 shrink-0 text-[rgb(var(--vp-accent-rgb))]" />
            Rider booked{delivery.courier_name ? ` (${delivery.courier_name})` : ""}. Pickup {delivery.pickup_eta ? delivery.pickup_eta.toLowerCase() : "soon"} - keep the package ready.
          </p>
          {(delivery.rider_phone || delivery.courier_phone) && (
            <a href={`tel:${delivery.rider_phone || delivery.courier_phone}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/15 py-2.5 text-sm font-bold text-white">
              <Phone size={14} /> Call {delivery.rider_name || "the courier"}
            </a>
          )}
          <div className="flex justify-between text-[0.7rem] text-white/40">
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm("Cancel the pickup? The rider won't come; tap Ready for pickup again when it's packed.") && run("cancel-pickup")}
              className="underline underline-offset-2"
            >
              Cancel pickup
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm("Cancel this order? We'll refund the reader.") && run("cancel", { reason: "Author couldn't fulfil" })}
              className="underline underline-offset-2"
            >
              Can&apos;t fulfil it
            </button>
          </div>
        </div>
      )}

      {(delivery.status === "picked_up" || delivery.status === "in_transit") && (
        <div className="mt-3 grid gap-2">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-white/65">
            <Truck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
            {isSelf ? "You're on your way." : `Picked up ${when(delivery.picked_up_at ?? delivery.in_transit_at)} - on its way to ${delivery.reader_name}.`}
            {!isSelf && delivery.delivery_eta ? ` Expected ${delivery.delivery_eta.toLowerCase()}.` : ""}
          </p>
          {isSelf && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run("self", { step: "delivered" })}
              className="rounded-xl bg-[rgb(var(--vp-accent-rgb))] px-4 py-3 text-sm font-black text-[#171100] disabled:opacity-50"
            >
              Mark delivered
            </button>
          )}
        </div>
      )}

      {delivery.status === "delivered" && (
        <p className="mt-3 flex items-center gap-2 text-xs text-white/55">
          <CheckCircle2 size={14} className="text-emerald-400" /> Delivered {when(delivery.delivered_at)}.
        </p>
      )}
      {delivery.status === "cancelled" && <p className="mt-3 text-xs text-white/45">Cancelled - the reader is being refunded.</p>}
    </article>
  );
}
