// src/app/components/Transactions.tsx

"use client";

import { useState } from "react";
import { Users, BookOpen, RefreshCcw, type LucideIcon } from "lucide-react";
import SectionLabel from "./SectionLabel";
import Modal from "./Modal";
import { useTransactions, type WalletTransaction } from "../hooks/useWallet";

type TxStatus = "confirmed" | "pending" | "failed";
type TxType = "credit" | "debit";

interface Transaction {
  id: string;
  title: string;
  date: string;
  status: TxStatus;
  type: TxType;
  amount: number;
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
            : "Withdrawal"),
      date: formatDate(tx.created_at),
      status: tx.status,
      type: tx.type,
      amount: Number(tx.amount),
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
          className="truncate text-[1.12rem] font-bold leading-tight text-white/75"
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
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        last ? "" : "border-b border-white/6"
      }`}
    >
      <span className="text-[0.62rem] uppercase tracking-wide text-white/40">
        {label}
      </span>
      <span className="text-[0.78rem] font-semibold text-white/85">
        {value}
      </span>
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

        <p className="mt-3 text-[0.95rem] font-semibold text-white/90">
          {tx.title}
        </p>
        <p className="mt-1 text-[0.72rem] text-white/45">{tx.date}</p>

        <span
          className="mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {tx.status}
        </span>

        <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/3 px-4">
          <DetailRow
            label="Type"
            value={tx.type === "credit" ? "Credit" : "Debit"}
          />
          <DetailRow label="Date" value={tx.date} />
          <DetailRow
            label="Reference ID"
            value={`TXN-${tx.id.padStart(6, "0")}`}
            last
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl py-3 text-sm font-bold"
          style={{
            background: "rgb(var(--vp-accent-rgb))",
            color: "#171100",
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

export default function Transactions() {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const { transactions, loading } = useTransactions();
  const groups = groupByMonth(transactions);

  return (
    <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-3 rounded-3xl border border-white/6 bg-white/3 p-2.5">
          {groups.map((group) => (
            <div key={group.month} className="flex flex-col gap-1.5">
              <p
                className="px-1 pb-0.5 text-[0.78rem] font-bold"
                style={{ color: "rgb(var(--vp-accent-rgb))" }}
              >
                {group.month}
              </p>
              <div className="flex flex-col gap-1.5">
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
