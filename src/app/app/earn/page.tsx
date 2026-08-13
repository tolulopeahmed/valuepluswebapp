"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  Wallet,
  DollarSign,
  PlusCircle,
  BookOpen,
  Send,
  RefreshCcw,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import SectionLabel from "../../../components/SectionLabel";
import Button from "../../../components/buttons/buttons";
import Modal from "../../../components/Modal";
import WithdrawModal from "../../../components/WithdrawModal";
import AddFundsModal from "../../../components/AddFundsModal";
import { RECENT_TRANSACTIONS_LIMIT } from "../../../components/Transactions";
import GlassCard from "../GlassCard";
import { useAppShell } from "../AppShellContext";
import { useMyBooks } from "../../../hooks/useMyBooks";
import {
  useTransactions,
  useWalletBalance,
  type WalletTransaction,
} from "../../../hooks/useWallet";

type EarningStatus = "confirmed" | "pending" | "failed";
type EarningType = "credit" | "debit";
// quote_payment/reprint deliberately excluded — those are external
// payments the author owes ValuePlus for a service and never touch
// Wallet.balance at all (see Transaction model docstring), so they
// don't belong on a page about money actually moving through the
// wallet. Every other source does.
type EarningSource = "referral" | "book-sale" | "transfer" | "withdrawal" | "deposit";

interface Earning {
  id: string;
  source: EarningSource;
  type: EarningType;
  title: string;
  subtitle: string;
  date: string;
  status: EarningStatus;
  amount: number;
  balanceBefore: number | null;
  balanceAfter: number | null;
  Icon: LucideIcon;
}

interface EarningGroup {
  month: string;
  items: Earning[];
}

const SOURCE_ICON: Record<EarningSource, LucideIcon> = {
  referral: Gift,
  "book-sale": BookOpen,
  transfer: Send,
  withdrawal: RefreshCcw,
  deposit: PlusCircle,
};

const WALLET_SOURCES = new Set<WalletTransaction["source"]>([
  "book_sale",
  "referral",
  "withdrawal",
  "transfer",
  "deposit",
]);

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Every transaction that actually moves the wallet — money in (book
// sales, referral rewards, an incoming transfer, a confirmed deposit)
// and money out (a withdrawal, an outgoing transfer) alike. Real
// transactions already arrive newest-first (Transaction.Meta.ordering
// server-side), so grouping preserves that order.
function groupEarnings(transactions: WalletTransaction[]): EarningGroup[] {
  const groups = new Map<string, Earning[]>();

  for (const tx of transactions) {
    if (!WALLET_SOURCES.has(tx.source)) continue;

    const month = new Date(tx.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const source: EarningSource =
      tx.source === "book_sale"
        ? "book-sale"
        : tx.source === "transfer"
          ? "transfer"
          : tx.source === "withdrawal"
            ? "withdrawal"
            : tx.source === "deposit"
              ? "deposit"
              : "referral";
    const date = formatDate(tx.created_at);

    const earning: Earning = {
      id: tx.id,
      source,
      type: tx.type,
      title: tx.title,
      subtitle: date,
      date,
      status: tx.status,
      amount: Number(tx.amount),
      balanceBefore: tx.balance_before !== null ? Number(tx.balance_before) : null,
      balanceAfter: tx.balance_after !== null ? Number(tx.balance_after) : null,
      Icon: SOURCE_ICON[source],
    };

    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(earning);
  }

  return Array.from(groups.entries()).map(([month, items]) => ({ month, items }));
}

const STATUS_STYLES: Record<
  EarningStatus,
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

// Same rule as the Transactions page/home dashboard: pending is always
// grey regardless of credit/debit (nothing's actually moved yet), failed
// is red, and otherwise credit is green / debit is the warm accent.
const AMOUNT_COLOR: Record<EarningType, string> = {
  credit: "#34D399",
  debit: "#E0A458",
};

function amountColorFor(earning: Pick<Earning, "status" | "type">) {
  if (earning.status === "failed") return STATUS_STYLES.failed.text;
  if (earning.status === "pending") return STATUS_STYLES.pending.text;
  return AMOUNT_COLOR[earning.type];
}

// Renders ₦ and the decimal tail smaller than the whole-number amount, in
// `em` units so one component works at hero size and at row size alike.
function NairaAmount({
  value,
  className = "",
  bold = true,
  color,
}: {
  value: number;
  className?: string;
  bold?: boolean;
  color?: string;
}) {
  const [whole, decimal] = value.toFixed(2).split(".");
  const symbolWeight = bold ? "font-black" : "font-normal";
  return (
    <span
      className={`inline-flex items-baseline ${className}`}
      style={color ? { color } : undefined}
    >
      <span className={`mr-0.5 text-[0.5em] ${symbolWeight}`}>₦</span>
      <span>{Number(whole).toLocaleString()}</span>
      <span className={`text-[0.5em] ${symbolWeight}`}>.{decimal}</span>
    </span>
  );
}

// ── Hero: total earned up top; bottom row holds the referral/book counts
// on the left and a raised QuickSave-style Withdraw pill pinned to the
// bottom-right with proper inset padding, like the MyFund reference.
// Same content as the homepage's publisher EarningsCard (HeroCards.tsx)
// — icon+label cluster top-left, big regular-weight Proxima Nova amount,
// a "N Titles" line bottom-left (real book count from useMyBooks(), same
// count as the Publish page), same button color/radius — not just the
// same look, the same container end to end. ──
function EarningsHero({
  totalEarned,
  titleCount,
  onAddFunds,
}: {
  totalEarned: number;
  titleCount: number;
  onAddFunds?: () => void;
}) {
  const [balanceHidden, setBalanceHidden] = useState(false);

  return (
    <GlassCard accent className="flex min-h-[9.5rem] flex-col p-3.5">
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "rgba(var(--vp-accent-rgb),0.14)",
            color: "rgb(var(--vp-accent-rgb))",
          }}
        >
          <Wallet size={14} strokeWidth={2} />
        </span>
        <SectionLabel style={{ marginBottom: 0 }}>Wallet</SectionLabel>

        <button
          type="button"
          onClick={() => setBalanceHidden((v) => !v)}
          aria-label={balanceHidden ? "Show balance" : "Hide balance"}
          className="ml-auto flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 active:scale-90"
        >
          {balanceHidden ? (
            <EyeOff size={14} strokeWidth={2} />
          ) : (
            <Eye size={14} strokeWidth={2} />
          )}
        </button>
      </div>

      <p
        className="mt-1 text-5xl font-bold leading-none text-white md:text-4xl"
        style={{ fontFamily: "Proxima Nova" }}
      >
        {balanceHidden ? (
          <span aria-label="Balance hidden">••••••</span>
        ) : (
          <NairaAmount value={totalEarned} />
        )}
      </p>

      {/* Bottom row — stats left, Add Funds pill right, both sitting on
          the card's own padding so the inset feels deliberate like the
          reference's QuickSave corner. */}
      <div className="mt-2 flex items-end justify-between gap-3">
        <SectionLabel style={{ marginBottom: 0 }}>
          {titleCount} {titleCount === 1 ? "Title" : "Titles"}
        </SectionLabel>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddFunds}
          className="shrink-0 items-center gap-1 whitespace-nowrap px-4 py-2 text-[0.78rem] font-bold"
          style={{
            // Solid accent fill, same as Resume on the learner home card
            // — .btn-primary's own background/color/shadow already do
            // that, so no color override here anymore. Just the sizing:
            // this button is short, so var(--r-md) — sized for the
            // taller default .btn-sm — would sit near half its height
            // and still read as a pill; var(--r-sm) keeps the same
            // proportional look at this smaller scale.
            minHeight: "1.85rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "var(--r-sm)",
          }}
        >
          <PlusCircle size={13} strokeWidth={2.5} />
          Add Funds
        </Button>
      </div>
    </GlassCard>
  );
}

// ── Refer & Earn CTA — sits between the hero and the transactions list.
// In Publisher mode it becomes the Withdraw CTA instead (Add Funds
// already covers "get money in" up in the hero, so this slot covers
// "get money out" for publishers rather than referrals). ──
function ReferAndEarnButton({ onWithdraw }: { onWithdraw?: () => void }) {
  const { mode } = useAppShell();
  const isPublisher = mode === "publisher";

  return (
    <div className="flex justify-center">
      <Button
        variant="primary"
        size="md"
        onClick={isPublisher ? onWithdraw : undefined}
      >
        {isPublisher ? (
          <DollarSign size={16} strokeWidth={2.25} />
        ) : (
          <Gift size={16} strokeWidth={2.25} />
        )}
        {isPublisher ? "Withdraw" : <>Refer &amp; Earn</>}
      </Button>
    </div>
  );
}

function EarningRow({
  earning,
  onOpen,
}: {
  earning: Earning;
  onOpen: (e: Earning) => void;
}) {
  const status = STATUS_STYLES[earning.status];

  return (
    <button
      type="button"
      onClick={() => onOpen(earning)}
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
        <earning.Icon
          size={18}
          strokeWidth={1.8}
          style={{ color: "rgb(var(--vp-accent-rgb))" }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p
          className="truncate text-[1.05rem] font-bold leading-tight text-white/75"
          style={{ marginBottom: -3 }}
        >
          {earning.title}
        </p>
        <p className="mt-1 truncate text-[0.6rem] text-white/40">
          {earning.subtitle}
        </p>
        <span
          className="mt-1 inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-[0.44rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {earning.status}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <NairaAmount
          value={earning.amount}
          className="text-right text-[1.1rem] font-black leading-none"
          color={amountColorFor(earning)}
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

function EarningDetailsModal({
  earning,
  onClose,
}: {
  earning: Earning | null;
  onClose: () => void;
}) {
  if (!earning) return null;
  const status = STATUS_STYLES[earning.status];

  return (
    <Modal open={!!earning} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
          style={{ background: status.bg, borderColor: status.border }}
        >
          <earning.Icon
            size={22}
            strokeWidth={1.8}
            style={{ color: status.text }}
          />
        </div>

        <div className="inline-flex items-baseline gap-1">
          <NairaAmount
            value={earning.amount}
            className="text-4xl font-black leading-none"
            color={amountColorFor(earning)}
          />
        </div>

        <p className="mt-3 text-[0.95rem] font-semibold text-white/90">
          {earning.title}
        </p>
        <p className="mt-1 text-[0.72rem] text-white/45">{earning.subtitle}</p>

        <span
          className="mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-black uppercase tracking-wide"
          style={{
            background: status.bg,
            borderColor: status.border,
            color: status.text,
          }}
        >
          {earning.status}
        </span>

        <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/3 px-4">
          <DetailRow
            label="Source"
            value={
              earning.source === "referral"
                ? "Referral"
                : earning.source === "book-sale"
                  ? "Book sale"
                  : earning.source === "withdrawal"
                    ? "Withdrawal"
                    : earning.source === "deposit"
                      ? "Wallet deposit"
                      : "Wallet transfer"
            }
          />
          {earning.balanceBefore !== null && (
            <DetailRow
              label="Balance before"
              value={`₦${earning.balanceBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          )}
          {earning.balanceAfter !== null && (
            <DetailRow
              label="Balance after"
              value={`₦${earning.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            />
          )}
          <DetailRow
            label="Reference ID"
            value={`ERN-${earning.id.slice(0, 8).toUpperCase()}`}
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

// ── Wallet Activity — every transaction that actually moves the wallet
// (book sales, referral rewards, deposits, transfers, withdrawals —
// money in and out alike), grouped by month ─
function AllEarningsSection({
  groups,
  loading,
  hasMore,
  onSelect,
}: {
  groups: EarningGroup[];
  loading: boolean;
  hasMore: boolean;
  onSelect: (e: Earning) => void;
}) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <SectionLabel>Wallet Activity</SectionLabel>
        <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
          Loading your earnings…
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <SectionLabel>Wallet Activity</SectionLabel>
        <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
          No wallet activity yet — book sales, referral rewards, deposits,
          and withdrawals will show up here.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>All earnings</SectionLabel>

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
              {group.items.map((earning) => (
                <EarningRow
                  key={earning.id}
                  earning={earning}
                  onOpen={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => router.push("/app/transactions")}
          className="mx-auto mt-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/50 md:text-[0.62rem]"
        >
          Show all transactions
        </button>
      )}
    </div>
  );
}

export default function EarnPage() {
  const [selected, setSelected] = useState<Earning | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const { books } = useMyBooks();
  // The real, backend-computed wallet balance (see useWalletBalance's own
  // docstring) — this used to be a books.earned sum with no relationship
  // to the actual Transaction ledger at all, so a withdrawal or an
  // incoming transfer never moved it. Now it's the same number Withdraw
  // itself checks against.
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useWalletBalance();
  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } =
    useTransactions();
  // Filtered (wallet-relevant sources only) before slicing, not after —
  // otherwise a run of quote_payment/reprint rows inside the first 5 raw
  // transactions could quietly shrink the preview below 5 real entries.
  const walletTransactions = transactions.filter((tx) => WALLET_SOURCES.has(tx.source));
  const earningGroups = groupEarnings(walletTransactions.slice(0, RECENT_TRANSACTIONS_LIMIT));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="vp-card-in">
        <Title className="block">Earn</Title>
        <Subtitle>Earn rewards sharing ValuePlus with friends</Subtitle>
      </div>

      <div className="vp-card-in" style={{ animationDelay: "60ms" }}>
        <EarningsHero
          totalEarned={balanceLoading ? 0 : balance}
          titleCount={books.length}
          onAddFunds={() => setAddFundsOpen(true)}
        />
      </div>

      <div className="vp-card-in" style={{ animationDelay: "100ms" }}>
        <ReferAndEarnButton onWithdraw={() => setWithdrawOpen(true)} />
      </div>

      <div className="vp-card-in" style={{ animationDelay: "140ms" }}>
        <AllEarningsSection
          groups={earningGroups}
          loading={transactionsLoading}
          hasMore={walletTransactions.length > RECENT_TRANSACTIONS_LIMIT}
          onSelect={setSelected}
        />
      </div>

      <EarningDetailsModal
        earning={selected}
        onClose={() => setSelected(null)}
      />

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => {
          setWithdrawOpen(false);
          refetchBalance();
          refetchTransactions();
        }}
      />

      <AddFundsModal
        open={addFundsOpen}
        onClose={() => {
          setAddFundsOpen(false);
          refetchTransactions();
        }}
      />
    </div>
  );
}
