"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Camera, Landmark, Pencil, TrendingUp } from "lucide-react";
import { USER } from "../MockUser";

function StatTile({
  icon,
  label,
  value,
  valueColor = "#ffffff",
  badge,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueColor?: string;
  badge?: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-2xl border px-3.5 py-3.5"
      style={{
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <span className="shrink-0 text-white/55">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.56rem] font-black uppercase tracking-[0.14em] text-white/45">
          {label}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <p
            className="truncate text-[1.05rem] font-black leading-none"
            style={{ color: valueColor }}
          >
            {value}
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
  const initial = USER.firstName.trim().charAt(0).toUpperCase() || "V";

  return (
    <div
      className="relative px-5 pb-12 pt-5"
      style={{
        background:
          "radial-gradient(120% 70% at 15% 0%, rgba(var(--vp-accent-rgb),0.32), transparent 55%), radial-gradient(90% 60% at 100% 0%, rgba(var(--vp-accent-rgb),0.14), transparent 60%), linear-gradient(180deg, #232a4d 0%, #171d38 60%, #12172c 100%)",
      }}
    >
      {/* Edit Profile pill — top right, opposite the avatar */}
      <button
        type="button"
        className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.66rem] font-black tracking-wide text-white/85 backdrop-blur-sm transition-colors hover:text-white"
        style={{
          borderColor: "rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <Pencil size={12} strokeWidth={2.25} />
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
        <div className="mt-8 min-w-0">
          <p className="truncate font-telegraf text-[2rem] font-black leading-tight text-white md:text-4xl">
            {USER.firstName}
          </p>
          <p className="mt-0.5 truncate text-[0.78rem] text-white/50">
            {USER.email}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <StatTile
          icon={<TrendingUp size={17} strokeWidth={1.8} />}
          label="Total earnings"
          value="₦170,600"
          valueColor="#4ade80"
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
