"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Camera, Eye, EyeOff, Landmark, Pencil, TrendingUp } from "lucide-react";
import { USER } from "../MockUser";
import MarqueeName from "../../../components/MarqueeName";

// Bullet count is fixed (not tied to the real value's length) — the point
// is to signal "hidden", not to leak the digit count of the amount
// underneath.
const MASKED_AMOUNT = "••••••";

function StatTile({
  icon,
  label,
  value,
  valueColor = "#ffffff",
  badge,
  maskable = false,
  hidden = false,
  onToggleHidden,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueColor?: string;
  badge?: string;
  maskable?: boolean;
  hidden?: boolean;
  onToggleHidden?: () => void;
}) {
  return (
    // min-w so the tile never gets squeezed narrower than "Get NUBAN" +
    // its badge need to sit on one line — flex-1 lets it share the row
    // evenly with its sibling whenever there's room for both, and the
    // parent's flex-wrap (not grid's fixed 50/50) drops it to its own
    // full-width row instead of compressing it on the few devices where
    // there isn't.
    <div
      className="flex min-w-[11.5rem] flex-1 items-center gap-2.5 rounded-2xl border px-3.5 py-3.5"
      style={{
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <span className="shrink-0 text-white/55">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <p className="truncate text-[0.56rem] font-black uppercase tracking-[0.14em] text-white/45">
            {label}
          </p>
          {maskable && (
            <button
              type="button"
              onClick={onToggleHidden}
              aria-label={hidden ? "Show amount" : "Hide amount"}
              className="shrink-0 text-white/40 transition-colors hover:text-white/70 active:scale-90"
            >
              {hidden ? (
                <EyeOff size={12} strokeWidth={2.1} />
              ) : (
                <Eye size={12} strokeWidth={2.1} />
              )}
            </button>
          )}
        </div>
        {/* flex-wrap (not truncate) — "Get NUBAN" + its badge is wider
            than a 2-column tile on most phones, and truncating it made the
            label unreadable ("Get NU..."). Letting the badge drop to its
            own line keeps both fully legible at any width instead. */}
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <p
            className="text-[1.05rem] font-black leading-none"
            style={{ color: valueColor }}
          >
            {hidden ? MASKED_AMOUNT : value}
          </p>
          {badge && (
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[0.48rem] font-black uppercase tracking-wide"
              style={{
                background: "rgb(var(--vp-accent-rgb))",
                color: "#171100",
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// No rounded corners/border of its own — this is the top section of one
// combined card whose overall shape (and clip) is owned by the wrapper in
// more/page.tsx. Settings' rounded "shelf" overlaps this section's bottom.
export default function Profile() {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [amountHidden, setAmountHidden] = useState(false);
  const initial = USER.firstName.trim().charAt(0).toUpperCase() || "V";

  return (
    <div
      className="relative px-5 pb-12 pt-5"
      style={{
        background:
          "radial-gradient(120% 70% at 15% 0%, rgba(var(--vp-accent-rgb),0.32), transparent 55%), radial-gradient(90% 60% at 100% 0%, rgba(var(--vp-accent-rgb),0.14), transparent 60%), linear-gradient(180deg, #232a4d 0%, #171d38 60%, #12172c 100%)",
      }}
    >
      {/* Edit Profile — sits in the top-right corner with a small inset
          (not flush against the edge), and its radius matches the
          combined card's own outer rounding (more/page.tsx's
          rounded-[1.75rem]) rather than a generic button radius. */}
      <button
        type="button"
        className="absolute right-3 top-3 flex items-center gap-1 border px-2 py-1 text-[0.56rem] font-black tracking-wide text-white/85 backdrop-blur-sm transition-colors hover:text-white"
        style={{
          borderColor: "rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "1.75rem",
        }}
      >
        <Pencil size={10} strokeWidth={2.25} />
        Edit Profile
      </button>

      {/* Avatar top-left, name + email beside it, vertically centered
          like the reference */}
      <div className="flex items-center gap-4 pr-2">
        <div className="relative shrink-0">
          {USER.avatar && !avatarFailed ? (
            <Image
              src={USER.avatar}
              alt={USER.firstName}
              width={112}
              height={112}
              className="h-[112px] w-[112px] rounded-full border-[3px] object-cover"
              style={{ borderColor: "rgba(var(--vp-accent-rgb),0.5)" }}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div
              className="flex h-[112px] w-[112px] items-center justify-center rounded-full border-[3px] text-3xl font-black text-white"
              style={{
                borderColor: "rgba(var(--vp-accent-rgb),0.5)",
                background: "linear-gradient(145deg, #3a4763, #232e47)",
              }}
            >
              {initial}
            </div>
          )}
          <span
            className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2"
            style={{
              background: "rgb(var(--vp-accent-rgb))",
              borderColor: "#171d38",
            }}
          >
            <Camera size={14} strokeWidth={2.25} color="#171100" />
          </span>
        </div>

        {/* mt-8 nudges the text block below the Edit Profile pill's row so
            the name lines up with the avatar's visual center, as in the
            reference */}
        <div className="mt-8 min-w-0 flex-1">
          {/* MarqueeName instead of truncate — a long name shouldn't just
              get clipped with an ellipsis; it scrolls into view instead,
              same treatment as the email line right below it. Only
              actually animates when the text doesn't fit — a short name
              renders completely statically. */}
          <MarqueeName
            text={USER.firstName}
            fadeColor="#232a4d"
            textClassName="font-telegraf text-[2rem] font-black leading-none text-white md:text-4xl"
          />
          {/* Smaller + tighter mt so the email sits right under the name —
              reduced size is also what lets a full email fit on one line
              more often, before marquee ever needs to kick in. */}
          <MarqueeName
            text={USER.email}
            className="mt-0"
            fadeColor="#232a4d"
            textClassName="text-[0.68rem] text-white/50"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <StatTile
          icon={<TrendingUp size={17} strokeWidth={1.8} />}
          label="Total earnings"
          value="₦170,600"
          valueColor="#4ade80"
          maskable
          hidden={amountHidden}
          onToggleHidden={() => setAmountHidden((v) => !v)}
        />
        <StatTile
          icon={<Landmark size={17} strokeWidth={1.8} />}
          label="Virtual account"
          value="Get NUBAN"
          badge="New"
        />
      </div>
    </div>
  );
}
