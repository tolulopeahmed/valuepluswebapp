"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Camera, Landmark, Pencil, TrendingUp } from "lucide-react";
import { USER } from "../MockUser";
import MarqueeName from "../../../components/MarqueeName";
import AutoFitText from "../../../components/AutoFitText";
import Button from "../../../components/buttons/buttons";

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
  const className =
    "flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left";
  const style = {
    background: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
  };

  const content = (
    <>
      <span className="shrink-0 text-white/55">{icon}</span>
      <div className="min-w-0 flex-1">
        <AutoFitText>
          <p className="text-[0.56rem] font-black uppercase leading-none tracking-[0.14em] text-white/45">
            {label}
          </p>
        </AutoFitText>
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
    </>
  );

  // No eye icon anymore — the whole tile itself is the toggle now, tap
  // anywhere on it (not just a small icon target) to hide/reveal.
  if (maskable) {
    return (
      <button
        type="button"
        onClick={onToggleHidden}
        aria-label={hidden ? "Show total earnings" : "Hide total earnings"}
        className={`${className} transition-transform active:scale-[0.97]`}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

// No rounded corners/border of its own — renders full-bleed directly on
// the page (more/page.tsx no longer wraps this in its own bordered card).
// Settings' own rounded "shelf" overlaps this section's bottom edge.
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
      {/* Edit Profile — same solid-accent pill treatment as the Earn
          page's Withdraw button (EarningsHero in earn/page.tsx). The
          positioning lives on this wrapper, not the Button itself —
          .btn-base sets its own `position: relative`, which wins the
          cascade over an `absolute` class on the same element and
          silently drops the button back into normal flow. */}
      <div className="absolute right-3 top-3">
        <Button
          variant="primary"
          size="sm"
          className="shrink-0 items-center gap-1 whitespace-nowrap px-4 py-2 text-[0.78rem] font-bold"
          style={{
            minHeight: "1.85rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "var(--r-sm)",
          }}
        >
          <Pencil size={13} strokeWidth={2.5} />
          Edit Profile
        </Button>
      </div>

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
            className="-mb-2"
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
