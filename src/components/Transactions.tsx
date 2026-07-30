// src/app/components/Transactions.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  RefreshCcw,
  Receipt,
  Send,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import SectionLabel from "./SectionLabel";
import Modal from "./Modal";
import { VALUEPLUS_PAYMENT_ACCOUNT } from "../lib/bankOptions";
import { useTransactions, type WalletTransaction } from "../hooks/useWallet";

// Same admin line used elsewhere (Sidebar.tsx, BookDetailsModal.tsx,
// more/Settings.tsx): 09024312689 in wa.me international format.
const ADMIN_WHATSAPP_NUMBER = "2349024312689";

// lucide has no WhatsApp glyph — same local fill-based SVG duplicated in
// Sidebar.tsx/Settings.tsx/BookDetailsModal.tsx for the same reason.
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

interface Transaction {
  id: string;
  title: string;
  date: string;
  status: TxStatus;
  type: TxType;
  amount: number;
  needsPayment: boolean;
  balanceBefore: number | null;
  balanceAfter: number | null;
  Icon: LucideIcon;
}

interface TransactionGroup {
  month: string;
  items: Transaction[];
}

const SOURCE_ICON: Record<WalletTransaction["source"], LucideIcon> = {
  book_sale: BookOpen,
  referral: Users,
  withdrawal: RefreshCcw,
  quote_payment: Receipt,
  transfer: Send,
  deposit: PlusCircle,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Real transactions arrive already ordered newest-first (see
// Transaction.Meta.ordering server-side) — grouping preserves that order
// since each month's bucket is created the first time it's seen.
function groupByMonth(items: WalletTransaction[]): TransactionGroup[] {
  const groups = new Map<string, Transaction[]>();

  for (const tx of items) {
    const month = new Date(tx.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const row: Transaction = {
      id: tx.id,
      title:
        tx.title ||
        (tx.source === "book_sale"
          ? "Book Sale"
          : tx.source === "referral"
            ? "Referral Reward"
            : tx.source === "quote_payment"
              ? "Quote Payment"
              : tx.source === "transfer"
                ? "Wallet Transfer"
                : tx.source === "deposit"
                  ? "Wallet Deposit"
                  : "Withdrawal"),
      date: formatDate(tx.created_at),
      status: tx.status,
      type: tx.type,
      amount: Number(tx.amount),
      needsPayment: tx.can_confirm_payment,
      balanceBefore: tx.balance_before !== null ? Number(tx.balance_before) : null,
      balanceAfter: tx.balance_after !== null ? Number(tx.balance_after) : null,
      Icon: SOURCE_ICON[tx.source],
    };
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(row);
  }

  return Array.from(groups.entries()).map(([month, txItems]) => ({
    month,
    items: txItems,
  }));
}

// Status/amount semantics stay universal (green = confirmed/credit, warm =
// debit, red = failed) — only the chrome around them (icon tiles, text,
// borders) pulls from the brand accent.
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

function amountColorFor(tx: Transaction) {
  if (tx.status === "failed") return STATUS_STYLES.failed.text;
  if (tx.status === "pending") return STATUS_STYLES.pending.text;
  return AMOUNT_COLOR[tx.type];
}

// Renders the naira sign and the decimal tail at ~0.55em so they sit smaller
// than the whole-number amount, same proportion as the reference design.
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

function TransactionRow({
  tx,
  onOpen,
}: {
  tx: Transaction;
  onOpen: (tx: Transaction) => void;
}) {
  const status = STATUS_STYLES[tx.status];

  return (
    <button
      type="button"
      onClick={() => onOpen(tx)}
      className="flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors duration-200 active:bg-white/[0.07]"
      style={{
        background: "#1E1E1E",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.16)",
          borderColor: "rgba(var(--vp-accent-rgb),0.3)",
        }}
      >
        <tx.Icon
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
          {tx.title}
        </p>
        <p className="mt-1 text-[0.52rem] text-white/40">{tx.date}</p>
        <span
          className="mt-1 inline-flex w-fit items-center rounded-md border px-1 py-0.5 text-[0.4rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {tx.status}
        </span>
      </div>

      <div className="flex shrink-0 items-center">
        <MoneyDisplay
          value={tx.amount}
          color={amountColorFor(tx)}
          className="text-right text-[1.2rem] font-black leading-none"
        />
      </div>
    </button>
  );
}

function DetailRow({
  label,
  value,
  last = false,
  valueClassName = "text-[0.78rem]",
}: {
  label: string;
  value: string;
  last?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${
        last ? "" : "border-b border-white/6"
      }`}
    >
      <span className="shrink-0 text-[0.62rem] uppercase tracking-wide text-white/40">
        {label}
      </span>
      <span
        className={`truncate whitespace-nowrap font-semibold text-white/85 ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

// A tap-to-copy pill used for both the account number and the amount —
// same compact shape so the two sit side by side instead of each taking
// a full row.
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
      // Clipboard API can be unavailable (permissions, older browsers) —
      // the value is still shown on screen either way.
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
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white">
          <Image
            src={VALUEPLUS_PAYMENT_ACCOUNT.logo}
            alt={VALUEPLUS_PAYMENT_ACCOUNT.bankName}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[0.78rem] font-bold text-white/85">
            {VALUEPLUS_PAYMENT_ACCOUNT.bankName}
          </p>
          <p className="truncate text-[0.62rem] text-white/45">
            {VALUEPLUS_PAYMENT_ACCOUNT.accountName}
          </p>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
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
  tx,
  onClose,
}: {
  tx: Transaction | null;
  onClose: () => void;
}) {
  if (!tx) return null;
  const status = STATUS_STYLES[tx.status];
  const color = amountColorFor(tx);

  // Short and fixed-width so it never wraps to a second line — tx.id is
  // a full UUID, not something meant to be shown in full here.
  const reference = `TXN-${tx.id.slice(0, 8).toUpperCase()}`;
  const whatsappMessage = `Hi ValuePlus! I've made the payment for "${tx.title}" (₦${tx.amount.toLocaleString()}), reference ${reference}. Kindly confirm. Thank you!`;

  return (
    <Modal open={!!tx} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
          style={{ background: status.bg, borderColor: status.border }}
        >
          <tx.Icon size={22} strokeWidth={1.8} style={{ color: status.text }} />
        </div>

        <MoneyDisplay
          value={tx.amount}
          color={color}
          className="text-4xl font-black leading-none"
        />

        <p className="mt-2.5 text-[0.95rem] font-semibold text-white/90">
          {tx.title}
        </p>
        <p className="mt-1 text-[0.72rem] text-white/45">{tx.date}</p>

        <span
          className="mt-2.5 inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {tx.status}
        </span>

        <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/3 px-4">
          <DetailRow
            label="Type"
            value={tx.type === "credit" ? "Credit" : "Debit"}
          />
          {tx.balanceBefore !== null && (
            <DetailRow
              label="Balance before"
              value={`₦${tx.balanceBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          )}
          {tx.balanceAfter !== null && (
            <DetailRow
              label="Balance after"
              value={`₦${tx.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          )}
          <DetailRow
            label="Reference ID"
            value={reference}
            valueClassName="text-[0.7rem]"
            last
          />
        </div>

        {tx.needsPayment && (
          <>
            <p
              className="mt-4 w-full text-left text-[0.7rem] font-black uppercase tracking-wide"
              style={{ color: "#FFD60A" }}
            >
              Please make payment to
            </p>

            <PaymentDetailsPanel amount={tx.amount} />

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

export default function Transactions() {
  const router = useRouter();
  const [selected, setSelected] = useState<Transaction | null>(null);
  const { transactions, loading } = useTransactions();
  const groups = groupByMonth(transactions);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SectionLabel>My recent transactions</SectionLabel>

      {loading ? (
        <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
          Loading your transactions…
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
          No transactions yet.
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-3 rounded-3xl border border-white/6 bg-white/3 p-2.5">
          {groups.map((group) => (
            <div key={group.month} className="flex min-w-0 flex-col gap-1.5">
              <p
                className="px-1 pb-0.5 text-[0.78rem] font-bold"
                style={{ color: "rgb(var(--vp-accent-rgb))" }}
              >
                {group.month}
              </p>
              <div className="flex min-w-0 flex-col gap-1.5">
                {group.items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onOpen={setSelected} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <button
          type="button"
          onClick={() => router.push("/app/transactions")}
          className="mx-auto mt-1 text-[0.68rem] font-semibold uppercase tracking-widest text-white/40 transition-colors hover:text-white/60"
        >
          View all transactions...
        </button>
      )}

      <TransactionDetailsModal
        tx={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
