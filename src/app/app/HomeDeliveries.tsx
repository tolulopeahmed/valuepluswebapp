"use client";

// Home's "needs you" strip for authors who sell single copies: every open
// order shows here - to pack until the author marks it ready, then live
// tracking until it's delivered - so nothing waits unseen in Deliveries.
// Renders nothing when there's nothing open.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import SectionLabel from "../../components/SectionLabel";
import DeliveryCard, { type Delivery } from "./more/deliveries/DeliveryCard";

const SHOWN = 3;
const MOVING = ["booked", "picked_up", "in_transit"];

export default function HomeDeliveries() {
  const [rows, setRows] = useState<Delivery[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [pickupAddress, setPickupAddress] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ open_count: number; pickup_address: string; results: Delivery[] }>(
        "/storefront/deliveries/mine/?state=open",
        { silent: true },
      );
      // Ones that still need the author come first.
      setRows([...data.results].sort((a, b) => Number(b.status === "preparing") - Number(a.status === "preparing")));
      setOpenCount(data.open_count);
      setPickupAddress(data.pickup_address);
    } catch {
      // Home stays quiet if this fails; the Deliveries page shows errors.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Courier updates arrive server-side; refresh while something is moving.
  useEffect(() => {
    if (!rows.some((r) => MOVING.includes(r.status))) return;
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [rows, load]);

  if (rows.length === 0) return null;
  const toPack = rows.filter((r) => r.status === "preparing").length;

  return (
    <div className="vp-card-in min-w-0" style={{ animationDelay: "40ms" }}>
      <div className="flex items-center justify-between">
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <Truck size={13} />
            {toPack > 0 ? `${toPack} to pack` : "On the way"}
            {toPack > 0 && openCount > toPack ? ` · ${openCount - toPack} on the way` : ""}
          </span>
        </SectionLabel>
        <Link href="/app/more/deliveries" className="text-xs font-bold text-white/50 hover:text-white">
          {openCount > SHOWN ? `See all ${openCount}` : "Deliveries"}
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.slice(0, SHOWN).map((delivery) => (
          <DeliveryCard key={delivery.id} delivery={delivery} pickupAddress={pickupAddress} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
