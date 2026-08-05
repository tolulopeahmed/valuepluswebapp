// A small pill + icon that makes a book's format legible at a glance —
// used everywhere a title's format matters enough to call out on its
// own (storefront pages, the dashboard's book detail views): Ebook vs.
// a physical copy reads very differently for a buyer (instant download
// vs. something that ships and costs delivery), and Paperback vs.
// Hardback are different physical products with different prices, so
// each of the three gets its own color rather than lumping both
// physical formats together. Solid, saturated fill (not a translucent
// tint) so it actually pops against both the dark dashboard/landing
// chrome and the light storefront cards, rather than blending into
// either.

import { Download, Truck } from "lucide-react";

const BACKGROUND_BY_FORMAT: Record<string, string> = {
  Ebook: "#1D4ED8", // deep blue — digital
  Paperback: "#C2410C", // terracotta — softcover
  Hardback: "#6D28D9", // deep violet — hardcover, reads as the "premium" edition
};

export default function FormatBadge({
  format,
  className = "",
}: {
  format: string;
  className?: string;
}) {
  const isEbook = format === "Ebook";
  const Icon = isEbook ? Download : Truck;
  const background = BACKGROUND_BY_FORMAT[format] ?? "#C2410C";

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
