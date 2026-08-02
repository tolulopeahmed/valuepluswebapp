// A small pill + icon that makes a book's format legible at a glance —
// used everywhere a title's format matters enough to call out on its
// own (storefront pages, the dashboard's book detail views): Ebook vs.
// a physical copy (Paperback/Hardback) reads very differently for a
// buyer (instant download vs. something that ships and costs delivery).
// Solid, saturated fill (not a translucent tint) so it actually pops
// against both the dark dashboard/landing chrome and the light
// storefront cards, rather than blending into either.

import { Download, Truck } from "lucide-react";

export default function FormatBadge({
  format,
  className = "",
}: {
  format: string;
  className?: string;
}) {
  const isEbook = format === "Ebook";
  const Icon = isEbook ? Download : Truck;
  // Deep blue for a digital copy, deep terracotta for a physical one —
  // solid fills with white text read as a real badge at any size,
  // unlike the previous translucent tint.
  const background = isEbook ? "#1D4ED8" : "#C2410C";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.1em] text-white shadow-sm ${className}`}
      style={{ background }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {format}
    </span>
  );
}
