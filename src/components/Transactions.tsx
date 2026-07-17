// src/components/Transactions.tsx

"use client";

import { useState } from "react";
import { Target, CheckCircle2, type LucideIcon } from "lucide-react";
import SectionLabel from "./SectionLabel";
import Modal from "./Modal";

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

// Swap this for real data once the transactions endpoint is wired up —
// shape is deliberately flat so a fetched payload can map to it 1:1.
const MOCK_TRANSACTIONS: TransactionGroup[] = [
  {
    month: "July 2026",
    items: [
      {
        id: "1",
        title: "Test 2 Cancelled",
        date: "Jul 12, 2026 · 1:53 PM",
        status: "confirmed",
        type: "credit",
        amount: 198,
        Icon: Target,
      },
      {
        id: "2",
        title: "Target Savings Created (Test)",
        date: "Jul 12, 2026 · 1:52 PM",
        status: "confirmed",
        type: "credit",
        amount: 200,
        Icon: Target,
      },
      {
        id: "3",
        title: "Target Savings Initial Funding",
        date: "Jul 12, 2026 · 1:52 PM",
        status: "confirmed",
        type: "debit",
        amount: 200,
        Icon: CheckCircle2,
      },
    ],
  },
];

function formatParts(value: number) {
  const [whole, decimal] = value
    .toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .split(".");
  return { whole, decimal };
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

// Renders the ₦ sign and decimal tail smaller than the whole-number part,
// same proportions as the reference design.
function Amount({
  value,
  color,
  size = "row",
}: {
  value: number;
  color: string;
  size?: "row" | "modal";
}) {
  const { whole, decimal } = formatParts(value);
  const wholeSize = size === "modal" ? "text-[2rem]" : "text-[1.05rem]";
  const smallSize = size === "modal" ? "text-[0.85rem]" : "text-[0.62rem]";

  return (
    <span className="font-black leading-none" style={{ color }}>
      <span className={`${smallSize} align-top`}>₦</span>
      <span className={wholeSize}>{whole}</span>
      <span className={smallSize}>.{decimal}</span>
    </span>
  );
}

function TransactionRow({
  tx,
  onSelect,
}: {
  tx: Transaction;
  onSelect: (tx: Transaction) => void;
}) {
  const status = STATUS_STYLES[tx.status];
  const amountColor = amountColorFor(tx);

  return (
    <button
      type="button"
      onClick={() => onSelect(tx)}
      className="flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left backdrop-blur-sm transition-colors duration-200 active:bg-white/[0.06]"
      style={{
        background:
          "linear-gradient(135deg, rgba(var(--vp-accent-rgb),0.14), rgba(var(--vp-accent-rgb),0.05))",
        borderColor: "rgba(var(--vp-accent-rgb),0.2)",
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.16)",
          borderColor: "rgba(var(--vp-accent-rgb),0.3)",
        }}
      >
        <tx.Icon
          size={17}
          strokeWidth={1.8}
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[0.85rem] font-semibold leading-tight"
          style={{ color: "rgba(var(--vp-accent-rgb),0.92)" }}
        >
          {tx.title}
        </p>
        <p className="mt-0.5 text-[0.62rem] text-white/40">{tx.date}</p>
        <span
          className="mt-1 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[0.52rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {tx.status}
        </span>
      </div>

      <div className="flex-shrink-0 text-right">
        <Amount value={tx.amount} color={amountColor} />
      </div>
    </button>
  );
}

export default function Transactions() {
  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>My recent transactions</SectionLabel>

      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/[0.06] bg-white/[0.03] p-2.5">
        {MOCK_TRANSACTIONS.map((group) => (
          <div key={group.month} className="flex flex-col gap-1.5">
            <p
              className="px-1 pb-0.5 text-[0.8rem] font-bold"
              style={{ color: "rgb(var(--vp-accent-rgb))" }}
            >
              {group.month}
            </p>
            <div className="flex flex-col gap-1.5">
              {group.items.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onSelect={setSelected} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mx-auto mt-1 text-[0.68rem] font-semibold uppercase tracking-widest text-white/40 transition-colors hover:text-white/60"
      >
        View all transactions...
      </button>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
              style={{
                background: "rgba(var(--vp-accent-rgb),0.16)",
                borderColor: "rgba(var(--vp-accent-rgb),0.3)",
              }}
            >
              <selected.Icon
                size={24}
                strokeWidth={1.8}
                style={{ color: "rgb(var(--vp-accent-rgb))" }}
              />
            </div>

            <Amount
              value={selected.amount}
              color={amountColorFor(selected)}
              size="modal"
            />

            <p className="mt-3 text-[0.95rem] font-semibold text-white">
              {selected.title}
            </p>
            <p className="mt-1 text-[0.72rem] text-white/50">{selected.date}</p>

            <span
              className="mt-3 inline-flex items-center rounded-md border px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-wide"
              style={{
                background: STATUS_STYLES[selected.status].bg,
                borderColor: STATUS_STYLES[selected.status].border,
                color: STATUS_STYLES[selected.status].text,
              }}
            >
              {selected.status}
            </span>

            <div className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-1">
              <div className="flex items-center justify-between border-b border-white/10 py-2.5">
                <span className="text-[0.65rem] uppercase tracking-wide text-white/40">
                  Type
                </span>
                <span className="text-[0.8rem] font-semibold capitalize text-white/85">
                  {selected.type}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[0.65rem] uppercase tracking-wide text-white/40">
                  Reference ID
                </span>
                <span className="text-[0.75rem] text-white/60">
                  {selected.id.padStart(8, "0")}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
