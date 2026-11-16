// Horizontal, labelled delivery progress (like a courier tracking page):
// one segment per step, filled and labelled once reached. `tone` picks
// colours for the light order page or the dark author dashboard.

export const DELIVERY_STEPS = [
  { status: "preparing", label: "Ordered" },
  { status: "booked", label: "Booked" },
  { status: "picked_up", label: "Picked up" },
  { status: "in_transit", label: "In transit" },
  { status: "delivered", label: "Delivered" },
] as const;

export default function DeliveryStepBar({ status, tone = "light" }: { status: string; tone?: "light" | "dark" }) {
  const reached = DELIVERY_STEPS.findIndex((s) => s.status === status);
  const on = tone === "light" ? "#c2410c" : "rgb(var(--vp-accent-rgb))";
  const off = tone === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const offText = tone === "light" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {DELIVERY_STEPS.map((step, i) => {
        const done = i <= reached;
        return (
          <div key={step.status} className="min-w-0">
            <span className="block h-1.5 rounded-full" style={{ background: done ? on : off }} />
            <span
              className={`mt-1.5 block truncate text-[0.68rem] ${i === reached ? "font-black" : "font-medium"}`}
              style={{ color: done ? on : offText }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
