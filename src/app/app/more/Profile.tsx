"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Camera, Eye, EyeOff, Landmark, Pencil, TrendingUp } from "lucide-react";
import { USER } from "../MockUser";
import MarqueeName from "../../../components/MarqueeName";
import AutoFitText from "../../../components/AutoFitText";

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
    // min-w-0 (not a fixed min-w) + flex-1 — these sit side by side no
    // matter how narrow the screen gets; AutoFitText below handles fit by
    // shrinking instead of the tile itself needing room to wrap to.
    <div
      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border px-3 py-2"
      style={{
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <span className="shrink-0 text-white/55">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <AutoFitText className="min-w-0 flex-1">
            <p className="text-[0.56rem] font-black uppercase leading-none tracking-[0.14em] text-white/45">
              {label}
            </p>
          </AutoFitText>
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
        {/* AutoFitText (not flex-wrap/truncate) — "Get NUBAN" + its badge
            is wider than a side-by-side tile on most phones. Scaling the
            whole value+badge group down as one unit keeps both fully
            legible on one line at any width, instead of wrapping the
            badge onto its own line or clipping the label. */}
        <AutoFitText className="mt-0">
          <p
            className="text-[1.05rem] font-black leading-none"
            style={{ color: valueColor }}
          >
            {hidden ? MASKED_AMOUNT : value}
          </p>
          {badge && (
            <span
              className="ml-1.5 shrink-0 rounded-md px-1.5 py-0.5 text-[0.48rem] font-black uppercase tracking-wide"
              style={{
                background: "rgb(var(--vp-accent-rgb))",
                color: "#171100",
              }}
            >
              {badge}
            </span>
          )}
        </AutoFitText>
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
          (not flush against the edge), radius matches the combined
          card's own outer rounding (more/page.tsx's rounded-[1.75rem])
          rather than a generic button radius, and the same solid accent
          fill as the learner home's Resume/Withdraw pill (SlideCta in
          HeroCards.tsx) instead of a translucent glass tint. gap-1.5 +
          real px/py (not the cramped px-1.5/py-0.5 it had before) gives
          the icon and label actual breathing room instead of reading as
          one squeezed-together block. */}
      <button
        type="button"
        className="absolute right-3 top-3 flex items-center gap-1.5 px-3 py-1.5 text-[0.62rem] font-black tracking-wide transition-transform active:scale-95"
        style={{
          background: "rgb(var(--vp-accent-rgb))",
          color: "#171100",
          boxShadow: "0 8px 20px rgba(var(--vp-accent-rgb),0.35)",
          borderRadius: "1.75rem",
        }}
      >
        <Pencil size={11} strokeWidth={2.25} />
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
              renders completely statically. -mb-1 is the same fix as
              Title.tsx: leading-none still reserves a bit of space below
              the glyphs at this font-telegraf size, which read as a
              bigger name-to-email gap than intended. */}
          <MarqueeName
            text={USER.firstName}
            className="-mb-1"
            fadeColor="#232a4d"
            textClassName="font-telegraf text-[2rem] font-black leading-none text-white md:text-4xl"
          />
          <MarqueeName
            text={USER.email}
            fadeColor="#232a4d"
            textClassName="text-[0.68rem] text-white/50"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2.5">
        <StatTile
          icon={<TrendingUp size={15} strokeWidth={1.8} />}
          label="Total earnings"
          value="₦170,600"
          valueColor="#4ade80"
          maskable
          hidden={amountHidden}
          onToggleHidden={() => setAmountHidden((v) => !v)}
        />
        <StatTile
          icon={<Landmark size={15} strokeWidth={1.8} />}
          label="Virtual account"
          value="Get NUBAN"
          badge="New"
        />
      </div>
    </div>
  );
}
