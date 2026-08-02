"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Mail,
  Search,
  ListFilter,
  Users,
  BookOpen,
  RefreshCcw,
  Receipt,
  Send,
  ShieldCheck,
  PlusCircle,
  Package,
  type LucideIcon,
} from "lucide-react";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import Modal from "../../../components/Modal";
import { VALUEPLUS_PAYMENT_ACCOUNT } from "../../../lib/bankOptions";
import {
  useTransactions,
  type WalletTransaction,
} from "../../../hooks/useWallet";
import {
  useNotifications,
  markAllNotificationsRead,
  type AppNotification,
} from "../../../hooks/useNotifications";

// Same admin line used elsewhere (Sidebar.tsx, Transactions.tsx,
// BookDetailsModal.tsx): 09024312689 in wa.me international format.
const ADMIN_WHATSAPP_NUMBER = "2349024312689";

// lucide has no WhatsApp glyph — same local fill-based SVG duplicated
// wherever the "I've made this payment" flow appears.
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.02 4C9.4 4 4 9.33 4 15.9c0 2.1.56 4.15 1.62 5.95L4 28l6.32-1.58A12.17 12.17 0 0 0 16.02 28C22.65 28 28 22.67 28 16.1 28 9.53 22.65 4 16.02 4Zm0 21.86c-1.78 0-3.52-.47-5.03-1.36l-.36-.21-3.75.94 1-3.62-.24-.38a9.86 9.86 0 0 1-1.5-5.23c0-5.38 4.43-9.76 9.88-9.76 5.45 0 9.88 4.38 9.88 9.76s-4.43 9.86-9.88 9.86Z" />
      <path d="M21.42 18.55c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.09 3.17 5.07 4.45.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

type TxStatus = "confirmed" | "pending" | "failed";
type TxType = "credit" | "debit";
type TxSource = WalletTransaction["source"];
type Tab = "transactions" | "messages";

interface Row {
  id: string;
  title: string;
  date: string;
  status: TxStatus;
  type: TxType;
  source: TxSource;
  amount: number;
  needsPayment: boolean;
  balanceBefore: number | null;
  balanceAfter: number | null;
  Icon: LucideIcon;
}

interface RowGroup {
  month: string;
  items: Row[];
}

const SOURCE_ICON: Record<TxSource, LucideIcon> = {
  book_sale: BookOpen,
  referral: Users,
  withdrawal: RefreshCcw,
  quote_payment: Receipt,
  reprint: Package,
  transfer: Send,
  deposit: PlusCircle,
};

const CATEGORIES: { id: "all" | TxSource; label: string; Icon: LucideIcon }[] =
  [
    { id: "all", label: "All", Icon: ListFilter },
    { id: "book_sale", label: "Sales", Icon: BookOpen },
    { id: "referral", label: "Referrals", Icon: Users },
    { id: "withdrawal", label: "Withdrawals", Icon: RefreshCcw },
    { id: "quote_payment", label: "Payments", Icon: Receipt },
    { id: "reprint", label: "Reorders", Icon: Package },
    { id: "transfer", label: "Transfers", Icon: Send },
    { id: "deposit", label: "Deposits", Icon: PlusCircle },
  ];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function titleFor(tx: WalletTransaction) {
  return (
    tx.title ||
    (tx.source === "book_sale"
      ? "Book Sale"
      : tx.source === "referral"
        ? "Referral Reward"
        : tx.source === "quote_payment"
          ? "Quote Payment"
          : tx.source === "reprint"
            ? "Reprint Payment"
            : tx.source === "transfer"
              ? "Wallet Transfer"
              : tx.source === "deposit"
                ? "Wallet Deposit"
                : "Withdrawal")
  );
}

const STATUS_STYLES: Record<
  TxStatus,
  { bg: string; border: string; text: string }
> = {
  confirmed: {
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.35)",
    text: "#34D399",
  },
  pending: {
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.14)",
    text: "rgba(255,255,255,0.55)",
  },
  failed: {
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.35)",
    text: "#F87171",
  },
};

const AMOUNT_COLOR: Record<TxType, string> = {
  credit: "#34D399",
  debit: "#E0A458",
};

function amountColorFor(row: Row) {
  if (row.status === "failed") return STATUS_STYLES.failed.text;
  if (row.status === "pending") return STATUS_STYLES.pending.text;
  return AMOUNT_COLOR[row.type];
}

// Renders the naira sign and the decimal tail at ~0.55em so they sit
// smaller than the whole-number amount.
function MoneyDisplay({
  value,
  color,
  className = "",
}: {
  value: number;
  color: string;
  className?: string;
}) {
  const [whole, decimal] = value.toFixed(2).split(".");
  return (
    <span className={className} style={{ color }}>
      <span style={{ fontSize: "0.55em" }}>₦</span>
      {Number(whole).toLocaleString()}
      <span style={{ fontSize: "0.55em" }}>.{decimal}</span>
    </span>
  );
}

function TabSwitch({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  const isMessages = tab === "messages";
  return (
    <div className="relative flex items-center rounded-full border border-white/[0.1] bg-white/[0.05] p-1">
      <div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)]"
        style={{
          background: "rgb(var(--vp-accent-rgb))",
          transform: isMessages
            ? "translateX(calc(100% + 4px))"
            : "translateX(0)",
        }}
      />
      <button
        type="button"
        onClick={() => onChange("transactions")}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[0.72rem] font-black uppercase tracking-[0.04em] transition-colors ${!isMessages ? "text-[#171100]" : "text-white/50"}`}
      >
        <ArrowLeftRight size={14} strokeWidth={2.2} />
        Transactions
      </button>
      <button
        type="button"
        onClick={() => onChange("messages")}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[0.72rem] font-black uppercase tracking-[0.04em] transition-colors ${isMessages ? "text-[#171100]" : "text-white/50"}`}
      >
        <Mail size={14} strokeWidth={2.2} />
        Messages
      </button>
    </div>
  );
}

function CategoryChip({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.74rem] font-bold transition-colors"
      style={
        active
          ? {
              background: "rgb(var(--vp-accent-rgb))",
              borderColor: "rgb(var(--vp-accent-rgb))",
              color: "#171100",
            }
          : {
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }
      }
    >
      <Icon size={14} strokeWidth={2} />
      {label}
    </button>
  );
}

function TransactionRow({
  row,
  onOpen,
}: {
  row: Row;
  onOpen: (row: Row) => void;
}) {
  const status = STATUS_STYLES[row.status];

  return (
    <button
      type="button"
      onClick={() => onOpen(row)}
      className="flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors duration-200 active:bg-white/[0.07]"
      style={{ background: "#1E1E1E", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.16)",
          borderColor: "rgba(var(--vp-accent-rgb),0.3)",
        }}
      >
        <row.Icon
          size={18}
          strokeWidth={1.8}
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p
          className="truncate text-[0.92rem] font-bold leading-tight text-white/75"
          style={{ marginBottom: -5 }}
        >
          {row.title}
        </p>
        <p className="mt-1 text-[0.62rem] text-white/40">{row.date}</p>
        <span
          className="mt-1 inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {row.status}
        </span>
      </div>

      <div className="flex shrink-0 items-center">
        <MoneyDisplay
          value={row.amount}
          color={amountColorFor(row)}
          className="text-right text-[1.1rem] font-black leading-none"
        />
      </div>
    </button>
  );
}

const NOTIFICATION_ICON: Record<AppNotification["category"], LucideIcon> = {
  transaction: Receipt,
  kyc: ShieldCheck,
  system: Mail,
};

function NotificationMessageRow({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: () => void;
}) {
  const Icon = NOTIFICATION_ICON[notification.category];

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!notification.link}
      className="flex w-full items-start gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors duration-200 disabled:cursor-default active:bg-white/[0.07]"
      style={{
        background: notification.is_read ? "#1E1E1E" : "rgba(var(--vp-accent-rgb),0.07)",
        borderColor: notification.is_read
          ? "rgba(255,255,255,0.07)"
          : "rgba(var(--vp-accent-rgb),0.25)",
      }}
    >
      <div
        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.16)",
          borderColor: "rgba(var(--vp-accent-rgb),0.3)",
        }}
      >
        <Icon size={17} strokeWidth={1.8} style={{ color: "rgb(var(--vp-accent-rgb))" }} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.86rem] font-bold leading-tight text-white/85">
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-1 text-[0.72rem] leading-relaxed text-white/50">
            {notification.body}
          </p>
        )}
        <p className="mt-1 text-[0.6rem] text-white/35">
          {formatDate(notification.created_at)}
        </p>
      </div>

      {!notification.is_read && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: "rgb(var(--vp-accent-rgb))" }}
        />
      )}
    </button>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${last ? "" : "border-b border-white/6"}`}
    >
      <span className="shrink-0 text-[0.62rem] uppercase tracking-wide text-white/40">
        {label}
      </span>
      <span className="truncate whitespace-nowrap text-[0.78rem] font-semibold text-white/85">
        {value}
      </span>
    </div>
  );
}

function CopyField({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be unavailable — the value is still on screen.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex min-w-0 flex-col items-start gap-0.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition-colors active:bg-white/[0.07]"
    >
      <span className="text-[0.55rem] uppercase tracking-wide text-white/35">
        {label}
      </span>
      <span className="flex w-full items-center justify-between gap-2">
        <span className="truncate text-[0.9rem] font-black tracking-wide text-white">
          {value}
        </span>
        <span
          className="shrink-0 text-[0.55rem] font-black uppercase tracking-wide"
          style={{ color: copied ? "#34D399" : "rgb(var(--vp-accent-rgb))" }}
        >
          {copied ? "Copied" : "Copy"}
        </span>
      </span>
    </button>
  );
}

function PaymentDetailsPanel({ amount }: { amount: number }) {
  return (
    <div className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/3 p-3.5">
      <div className="grid grid-cols-2 gap-2">
        <CopyField
          label="Account no."
          value={VALUEPLUS_PAYMENT_ACCOUNT.accountNumber}
          copyValue={VALUEPLUS_PAYMENT_ACCOUNT.accountNumber}
        />
        <CopyField
          label="Amount"
          value={amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          copyValue={amount.toFixed(2)}
        />
      </div>
    </div>
  );
}

function TransactionDetailsModal({
  row,
  onClose,
}: {
  row: Row | null;
  onClose: () => void;
}) {
  if (!row) return null;
  const status = STATUS_STYLES[row.status];
  const color = amountColorFor(row);
  const reference = `TXN-${row.id.slice(0, 8).toUpperCase()}`;
  const whatsappMessage = `Hi ValuePlus! I've made the payment for "${row.title}" (₦${row.amount.toLocaleString()}), reference ${reference}. Kindly confirm. Thank you!`;

  return (
    <Modal open={!!row} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
          style={{ background: status.bg, borderColor: status.border }}
        >
          <row.Icon
            size={22}
            strokeWidth={1.8}
            style={{ color: status.text }}
          />
        </div>

        <MoneyDisplay
          value={row.amount}
          color={color}
          className="text-4xl font-black leading-none"
        />

        <p className="mt-2.5 text-[0.95rem] font-semibold text-white/90">
          {row.title}
        </p>
        <p className="mt-1 text-[0.72rem] text-white/45">{row.date}</p>

        <span
          className="mt-2.5 inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {row.status}
        </span>

        <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/3 px-4">
          <DetailRow
            label="Type"
            value={row.type === "credit" ? "Credit" : "Debit"}
          />
          {row.balanceBefore !== null && (
            <DetailRow
              label="Balance before"
              value={`₦${row.balanceBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          )}
          {row.balanceAfter !== null && (
            <DetailRow
              label="Balance after"
              value={`₦${row.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          )}
          <DetailRow label="Reference ID" value={reference} last />
        </div>

        {row.needsPayment && (
          <>
            <p
              className="mt-4 w-full text-left text-[0.7rem] font-black uppercase tracking-wide"
              style={{ color: "#FFD60A" }}
            >
              Please make payment to
            </p>

            <PaymentDetailsPanel amount={row.amount} />

            <a
              href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              style={{ background: "#25D366" }}
            >
              <WhatsAppIcon size={18} />
              I&apos;ve Completed This Payment
            </a>

            <p className="mt-2 text-[0.64rem] leading-snug text-white/35">
              Click to send proof of payment on Whatsapp.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}

// Real transactions arrive newest-first (server-side ordering) — grouping
// preserves that order since each month's bucket is created the first
// time it's seen.
function groupByMonth(items: WalletTransaction[]): RowGroup[] {
  const groups = new Map<string, Row[]>();

  for (const tx of items) {
    const month = new Date(tx.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const row: Row = {
      id: tx.id,
      title: titleFor(tx),
      date: formatDate(tx.created_at),
      status: tx.status,
      type: tx.type,
      source: tx.source,
      amount: Number(tx.amount),
      needsPayment: tx.can_confirm_payment,
      balanceBefore: tx.balance_before !== null ? Number(tx.balance_before) : null,
      balanceAfter: tx.balance_after !== null ? Number(tx.balance_after) : null,
      Icon: SOURCE_ICON[tx.source],
    };
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(row);
  }

  return Array.from(groups.entries()).map(([month, items]) => ({
    month,
    items,
  }));
}

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, loading } = useTransactions();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const [tab, setTab] = useState<Tab>("transactions");
  const [category, setCategory] = useState<"all" | TxSource>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);

  // Visiting this page is how the bell badge's "unseen" count clears —
  // fire-and-forget, since a failed mark-read just leaves the badge as
  // it was rather than blocking anything on this page.
  useEffect(() => {
    markAllNotificationsRead().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (category !== "all" && tx.source !== category) return false;
      if (q && !titleFor(tx).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [transactions, category, query]);

  const groups = groupByMonth(filtered);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-5">
        <Title className="block">Notifications</Title>
        <Subtitle>Your transactions and messages, all in one place.</Subtitle>
      </div>

      <div className="vp-card-in mb-5">
        <TabSwitch tab={tab} onChange={setTab} />
      </div>

      {tab === "transactions" ? (
        <>
          <div className="vp-card-in relative mb-4">
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-[0.82rem] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[rgba(var(--vp-accent-rgb),0.55)] focus:bg-white/[0.07]"
            />
          </div>

          <div className="vp-card-in mb-5 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.label}
                Icon={c.Icon}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              />
            ))}
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
              Loading your transactions…
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
              {transactions.length === 0
                ? "No transactions yet."
                : "No transactions match your search."}
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-3 rounded-3xl border border-white/6 bg-white/3 p-2.5">
              {groups.map((group) => (
                <div
                  key={group.month}
                  className="flex min-w-0 flex-col gap-1.5"
                >
                  <p
                    className="px-1 pb-0.5 text-[0.78rem] font-bold"
                    style={{ color: "rgb(var(--vp-accent-rgb))" }}
                  >
                    {group.month}
                  </p>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    {group.items.map((row) => (
                      <TransactionRow
                        key={row.id}
                        row={row}
                        onOpen={setSelected}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : notificationsLoading ? (
        <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
          Loading your messages…
        </div>
      ) : notifications.length === 0 ? (
        <div className="vp-card-in flex flex-col items-center gap-3 rounded-3xl border border-white/6 bg-white/3 px-4 py-14 text-center">
          <span
            className="grid h-12 w-12 place-items-center rounded-full border"
            style={{
              background: "rgba(var(--vp-accent-rgb),0.12)",
              borderColor: "rgba(var(--vp-accent-rgb),0.3)",
            }}
          >
            <Mail
              size={20}
              strokeWidth={1.8}
              style={{ color: "rgb(var(--vp-accent-rgb))" }}
            />
          </span>
          <p className="text-[0.85rem] font-bold text-white/70">
            No messages yet
          </p>
          <p className="max-w-[16rem] text-[0.74rem] leading-relaxed text-white/40">
            Messages from ValuePlus will show up here.
          </p>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-2 rounded-3xl border border-white/6 bg-white/3 p-2.5">
          {notifications.map((n) => (
            <NotificationMessageRow
              key={n.id}
              notification={n}
              onOpen={() => n.link && router.push(n.link)}
            />
          ))}
        </div>
      )}

      <TransactionDetailsModal
        row={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
