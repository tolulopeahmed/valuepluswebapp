"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Switch from "@mui/material/Switch";
import {
  Moon,
  ArrowLeftRight,
  Landmark,
  UserPlus,
  ShieldCheck,
  KeyRound,
  ArrowDownCircle,
  HelpCircle,
  MessageCircle,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import SectionLabel from "../../../components/SectionLabel";
import { useAppShell } from "../AppShellContext";

const REFERRAL_COUNT = 3;

// MUI's Switch sx, restyled to match the reference: a wide, chunky pill
// track with a large white thumb that nearly fills the track's height.
// On-state fills the track solidly with the brand accent. Shared between
// ToggleRow's (now purely visual, pointerEvents:none) Switch instances.
const SWITCH_SX = {
  width: 58,
  height: 34,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: "3px",
    color: "#fff",
    transitionDuration: "220ms",
    "&.Mui-checked": {
      transform: "translateX(24px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "rgb(var(--vp-accent-rgb))",
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 28,
    height: 28,
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.16)",
    opacity: 1,
    transition: "background-color 220ms ease",
  },
} as const;

function ToggleRow({
  Icon,
  label,
  checked,
  onChange,
  disabled = false,
}: {
  Icon: LucideIcon;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  // The whole row toggles now, not just the switch — pointerEvents: "none"
  // on the Switch keeps it purely visual so its own click doesn't also
  // bubble into this button's onClick and fire onChange twice.
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl py-2 text-left transition-opacity active:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <div className="flex items-center gap-3.5">
        <Icon size={22} strokeWidth={1.8} className="text-white/80" />
        <span className="text-[1.05rem] font-bold text-white">{label}</span>
      </div>
      <Switch
        checked={checked}
        onChange={() => {}}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        disableRipple
        sx={{ ...SWITCH_SX, pointerEvents: "none" }}
      />
    </button>
  );
}

function StatusChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border px-2 py-1 text-[0.56rem] font-black uppercase tracking-wide"
      style={
        tone === "accent"
          ? {
              background: "rgba(52,211,153,0.14)",
              borderColor: "rgba(52,211,153,0.35)",
              color: "#34D399",
            }
          : {
              background: "rgba(255,255,255,0.08)",
              borderColor: "rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.65)",
            }
      }
    >
      {children}
    </span>
  );
}

interface SettingItem {
  id: string;
  label: string;
  subtitle: string;
  Icon: LucideIcon;
  trailing?: ReactNode;
  danger?: boolean;
}

const ITEMS: SettingItem[] = [
  {
    id: "bank",
    label: "My Bank Accounts",
    subtitle: "Set up accounts for faster withdrawals",
    Icon: Landmark,
    trailing: <StatusChip>GTBank</StatusChip>,
  },
  {
    id: "referrals",
    label: `My Referrals (${REFERRAL_COUNT})`,
    subtitle: "Invite friends so you both earn",
    Icon: UserPlus,
    trailing: (
      <div className="flex flex-col items-end gap-0.5">
        <span
          className="text-[0.85rem] font-black"
          style={{ color: "#34D399" }}
        >
          ₦15,000
        </span>
        <span className="text-[0.55rem] text-white/35">₦5,000 pending</span>
      </div>
    ),
  },
  {
    id: "kyc",
    label: "Update KYC",
    subtitle: "Verify your identity to unlock full features",
    Icon: ShieldCheck,
    trailing: <StatusChip>Not started</StatusChip>,
  },
  {
    id: "pin",
    label: "Transaction PIN",
    subtitle: "Secure withdrawals with a 4-digit PIN",
    Icon: KeyRound,
    trailing: <StatusChip tone="accent">Set</StatusChip>,
  },
  {
    id: "schedule-withdrawal",
    label: "Schedule Withdrawal",
    subtitle: "Withdraw without charges",
    Icon: ArrowDownCircle,
  },
  {
    id: "faq",
    label: "FAQ",
    subtitle: "Get answers to common questions",
    Icon: HelpCircle,
  },
  {
    id: "message-admin",
    label: "Message Admin",
    subtitle: "Get instant support via WhatsApp",
    Icon: MessageCircle,
  },
  {
    id: "logout",
    label: "Log Out",
    subtitle: "Sign out of your account",
    Icon: LogOut,
    danger: true,
  },
];

function SettingRow({
  item,
  onSelect,
}: {
  item: SettingItem;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-left transition-colors active:bg-white/[0.06]"
      style={{
        background: item.danger
          ? "rgba(248,113,113,0.06)"
          : "rgba(var(--vp-accent-rgb),0.08)",
        borderColor: item.danger
          ? "rgba(248,113,113,0.22)"
          : "rgba(var(--vp-accent-rgb),0.16)",
      }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: item.danger
            ? "rgba(248,113,113,0.14)"
            : "rgba(var(--vp-accent-rgb),0.16)",
          color: item.danger ? "#f87171" : "rgb(var(--vp-accent-rgb))",
        }}
      >
        <item.Icon size={15} strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[0.9rem] font-black ${
            item.danger ? "text-red-300" : "text-white"
          }`}
        >
          {item.label}
        </p>
        <p className="truncate text-[0.66rem] text-white/40">{item.subtitle}</p>
      </div>

      <div className="shrink-0">
        {item.trailing ?? <ChevronRight size={16} className="text-white/25" />}
      </div>
    </button>
  );
}

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  // No native device to authenticate against in a webapp, so biometric
  // login is swapped for the Learner/Publisher switch — same state
  // AppShellContext already uses to drive the accent color and the
  // homepage's Learner/Publisher view, so this stays in sync everywhere.
  const { mode, setMode } = useAppShell();

  return (
    // Negative top margin pulls this panel up over the hero's bottom edge;
    // the deeper -mt-8 + bigger 2.5rem top radius makes the layered
    // "shelf" separation from the reference read clearly.
    <div
      className="relative -mt-8 rounded-t-[2.5rem] px-5 pb-5 pt-7"
      style={{ background: "#0b0e1f" }}
    >
      <div className="flex flex-col">
        {/* Disabled — there's no light theme built yet, so this switch
            has nothing to actually do. Left visible (rather than removed)
            so the setting isn't a surprise once dark mode ships. */}
        <ToggleRow
          Icon={Moon}
          label="Dark Mode"
          checked={darkMode}
          onChange={setDarkMode}
          disabled
        />
        <ToggleRow
          Icon={ArrowLeftRight}
          label={mode === "publisher" ? "Publisher Mode" : "Learner Mode"}
          checked={mode === "publisher"}
          onChange={(v) => setMode(v ? "publisher" : "learner")}
        />
      </div>

      <SectionLabel className="mt-4">Settings</SectionLabel>

      <div className="flex flex-col gap-2.5">
        {ITEMS.map((item) => (
          <SettingRow
            key={item.id}
            item={item}
            onSelect={(id) => console.log("settings:", id)}
          />
        ))}
      </div>

      {/* Same credit line as the public site's footer (Footer.tsx) —
          logo, version, and copyright, centered under the settings list. */}
      <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/8 pt-7 text-center">
        <Image
          src="/images/logos/valueplus-logo-white2.png"
          alt="ValuePlus Publishing"
          width={130}
          height={38}
          className="h-8 w-auto object-contain opacity-80"
        />
        <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/35">
          Version 1.0
        </p>
        <p className="text-[0.66rem] text-white/25">
          © {new Date().getFullYear()} ValuePlus Media Limited. All Rights
          Reserved.
        </p>
      </div>
    </div>
  );
}
