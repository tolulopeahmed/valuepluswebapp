"use client";

// The author's single-copy orders (Book.author_ships_physical). Pack it,
// tap "Ready for pickup", and ValuePlus books a rider who collects it
// from the author's pickup address; courier updates then move it along
// and the reader is emailed at each step. "I'll deliver it myself" is the
// fallback. Mirrors the mobile app's Deliveries screen.
// Backed by GET /storefront/deliveries/mine/ and POST /storefront/deliveries/<id>/<action>/.

import { useCallback, useEffect, useState } from "react";
import { Truck } from "lucide-react";
import Title from "@/components/Title";
import Subtitle from "@/components/Subtitle";
import { apiFetch } from "@/lib/api";
import ChatAdminFab from "../ChatAdminFab";
import DeliveryCard, { type Delivery } from "./DeliveryCard";

export default function DeliveriesPage() {
  const [tab, setTab] = useState<"open" | "done">("open");
  const [rows, setRows] = useState<Delivery[] | null>(null);
  const [openCount, setOpenCount] = useState(0);
  const [pickupAddress, setPickupAddress] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ open_count: number; pickup_address: string; results: Delivery[] }>(
        `/storefront/deliveries/mine/?state=${tab}`,
      );
      setRows(data.results);
      setOpenCount(data.open_count);
      setPickupAddress(data.pickup_address);
    } catch {
      setRows([]); // apiFetch already showed the error
    }
  }, [tab]);

  useEffect(() => {
    // Fetch-on-mount/tab-change; state is set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Courier updates arrive server-side; poll while something is moving.
  useEffect(() => {
    if (tab !== "open" || !rows?.some((r) => ["booked", "picked_up", "in_transit"].includes(r.status))) return;
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [tab, rows, load]);

  return (
    <div className="space-y-5">
      <ChatAdminFab />
      <div>
        <Title>Deliveries</Title>
        <Subtitle>Delivery requests for copies readers bought</Subtitle>
      </div>

      <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
        {(["open", "done"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === tab) return;
              setRows(null);
              setTab(key);
            }}
            className={`rounded-xl px-3 py-3 text-sm font-black transition-colors ${tab === key ? "bg-[rgb(var(--vp-accent-rgb))] text-[#171100]" : "text-white/50"}`}
          >
            {key === "open" ? `TO DELIVER (${openCount})` : "COMPLETED"}
          </button>
        ))}
      </div>

      {rows === null ? (
        <p className="py-5 text-center text-sm text-white/40">Loading your deliveries…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
          <Truck size={26} className="mx-auto mb-2 text-white/30" />
          <p className="text-sm font-bold text-white/70">
            {tab === "open" ? "Nothing to deliver right now" : "No completed deliveries yet"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/40">
            Turn on <strong>&ldquo;Deliver single copies&rdquo;</strong> on a book with a Paperback or Hardback price,
            and readers can buy one copy. New orders appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} pickupAddress={pickupAddress} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

