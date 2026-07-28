"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Switch from "@mui/material/Switch";
import {
  Moon,
  ArrowLeftRight,
  Landmark,
  UserPlus,
  ShieldCheck,
  KeyRound,
  HelpCircle,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import SectionLabel from "../../../components/SectionLabel";
import { useAppShell } from "../AppShellContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useBankAccount,
  useLocalBankAccounts,
  useReferrals,
} from "../../../hooks/useWallet";
import LogoutConfirmModal from "../../../components/LogoutConfirmModal";

// Backend decimal fields arrive as strings.
function naira(value: string) {
  const n = Number(value);
  return `₦${Number.isNaN(n) ? 0 : n.toLocaleString()}`;
}

// Same admin line used by Sidebar's "Chat Admin" row and the public
// site's footer FAB: 09024312689 in wa.me international format.
const ADMIN_WHATSAPP_URL = "https://wa.me/2349024312689";

// lucide's MessageCircle is a generic chat bubble — swapped for the real
// WhatsApp mark since this row links straight out to WhatsApp now. Same
// glyph as ChatAdminFab.tsx/Sidebar.tsx's own local copy (fill-based, so
// it needs its own renderer rather than lucide's stroke icons).
function WhatsAppIcon({ size = 15 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16.02 4C9.4 4 4 9.33 4 15.9c0 2.1.56 4.15 1.62 5.95L4 28l6.32-1.58A12.17 12.17 0 0 0 16.02 28C22.65 28 28 22.67 28 16.1 28 9.53 22.65 4 16.02 4Zm0 21.86c-1.78 0-3.52-.47-5.03-1.36l-.36-.21-3.75.94 1-3.62-.24-.38a9.86 9.86 0 0 1-1.5-5.23c0-5.38 4.43-9.76 9.88-9.76 5.45 0 9.88 4.38 9.88 9.76s-4.43 9.86-9.88 9.86Z" />
      <path d="M21.42 18.55c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.09 3.17 5.07 4.45.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

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
  Icon: LucideIcon | typeof WhatsAppIcon;
  trailing?: ReactNode;
  danger?: boolean;
  /** Renders the row as a link instead of a button when set. */
  href?: string;
  /** Opens href in a new tab (wa.me, etc.) instead of navigating in-app. */
  external?: boolean;
}

// Bank/referral rows need live data, so this builds the list at render
// time instead of a module-level constant — everything else here has no
// backend equivalent yet (see the plan's "explicitly out of scope") and
// stays static.
function buildItems({
  isBankLinked,
  bankName,
  referralCount,
  referralTotalEarned,
  referralPending,
}: {
  isBankLinked: boolean;
  bankName: string | null;
  referralCount: number;
  referralTotalEarned: string;
  referralPending: string;
}): SettingItem[] {
  return [
  {
    id: "bank",
    label: "My Bank Accounts",
    subtitle: "Set up accounts for faster withdrawals",
    Icon: Landmark,
    href: "/app/more/bank-accounts",
    trailing: (
      <StatusChip tone={isBankLinked ? "accent" : "neutral"}>
        {isBankLinked ? bankName : "Not added"}
      </StatusChip>
    ),
  },
  {
    id: "referrals",
    label: `My Referrals (${referralCount})`,
    subtitle: "Invite friends so you both earn",
    Icon: UserPlus,
    href: "/app/more/referrals",
    trailing: (
      <div className="flex flex-col items-end gap-0.5">
        <span
          className="text-[0.85rem] font-black"
          style={{ color: "#34D399" }}
        >
          {naira(referralTotalEarned)}
        </span>
        <span className="text-[0.55rem] text-white/35">
          {naira(referralPending)} pending
        </span>
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
    id: "faq",
    label: "FAQ",
    subtitle: "Get answers to common questions",
    Icon: HelpCircle,
    href: "/app/more/faq",
  },
  {
    id: "message-admin",
    label: "Message Admin",
    subtitle: "Get instant support via WhatsApp",
    Icon: WhatsAppIcon,
    href: ADMIN_WHATSAPP_URL,
    external: true,
  },
  {
    id: "logout",
    label: "Log Out",
    subtitle: "Sign out of your account",
    Icon: LogOut,
    danger: true,
  },
  ];
}

function SettingRow({
  item,
  onSelect,
}: {
  item: SettingItem;
  onSelect: (id: string) => void;
}) {
  const className =
    "flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-left transition-colors active:bg-white/[0.06]";
  const style = {
    background: item.danger
      ? "rgba(248,113,113,0.06)"
      : "rgba(var(--vp-accent-rgb),0.08)",
    borderColor: item.danger
      ? "rgba(248,113,113,0.22)"
      : "rgba(var(--vp-accent-rgb),0.16)",
  };

  const content = (
    <>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: item.danger
            ? "rgba(248,113,113,0.14)"
            : "rgba(var(--vp-accent-rgb),0.16)",
          color: item.danger ? "#f87171" : "rgb(var(--vp-accent-rgb))",
        }}
      >
        <item.Icon size={18} strokeWidth={1.9} />
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
    </>
  );

  // message-admin (wa.me) renders as a link instead of a button that
  // fires onSelect — everything else (including logout, handled in
  // Settings()) goes through onSelect.
  if (item.href && item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {content}
      </a>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={className} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={className}
      style={style}
    >
      {content}
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
  const { logout } = useAuth();
  const router = useRouter();
  const { bankAccount, isLinked } = useBankAccount();
  // Same local accounts list Bank Accounts reads/writes — no create/
  // delete/list endpoint exists yet, so this is how this row's status
  // chip agrees with that page instead of only ever reflecting the real
  // (still-empty) backend account.
  const { accounts: bankAccounts } = useLocalBankAccounts();
  const { referrals } = useReferrals();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const defaultBankAccount = bankAccounts.find((a) => a.isDefault) ?? bankAccounts[0];
  const isBankLinked = bankAccounts.length > 0 || isLinked;
  const linkedBankName = defaultBankAccount?.bankName ?? bankAccount?.bank_name ?? null;

  const items = buildItems({
    isBankLinked,
    bankName: linkedBankName,
    referralCount: referrals?.count ?? 0,
    referralTotalEarned: referrals?.total_earned ?? "0",
    referralPending: referrals?.pending_amount ?? "0",
  });

  const handleSelect = (id: string) => {
    if (id === "logout") {
      setShowLogoutConfirm(true);
      return;
    }
    console.log("settings:", id);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.push("/login");
  };

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
        {items.map((item) => (
          <SettingRow key={item.id} item={item} onSelect={handleSelect} />
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
        {/* Computed from the real date (like the copyright year below),
            not hand-typed — always reads as the actual current month. */}
        <p className="text-[0.6rem] text-white/30">
          Updated{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-[0.66rem] text-white/25">
          © {new Date().getFullYear()} ValuePlus Media Limited. All Rights
          Reserved.
        </p>
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
