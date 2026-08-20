"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownToLine,
  Banknote,
  Check,
  ChevronDown,
  Landmark,
  Mail,
  Plus,
  UserRound,
  Wallet,
} from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import AddBankAccountModal from "./AddBankAccountModal";
import {
  getBankLogo,
  getCanonicalBankName,
  getBankCardGradient,
  bankOptions,
} from "../lib/bankOptions";
import {
  calculateTransferFee,
  MINIMUM_WITHDRAWAL_AMOUNT,
} from "../lib/paystackFee";
import { notify } from "../lib/snackbar";
import { ApiError } from "../lib/api";
import {
  useBankAccounts,
  useWalletBalance,
  requestWithdrawal,
  lookupUserByEmail,
  transferToUser,
  type StoredBankAccount,
} from "../hooks/useWallet";
import { useKYCProfile } from "../hooks/useKYC";

type DestinationMode = "bank" | "user";
type ResolveState = "idle" | "loading" | "success" | "error";

// A full email is required before auto-resolving on every keystroke —
// but per the product ask, clicking out of the field (onBlur) forces a
// lookup attempt regardless, since the user may not have typed a full
// ".com" yet before tabbing away.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskAccountNumber(accountNumber: string) {
  return `•••• •••• ${accountNumber.slice(-4)}`;
}

function bankCodeFor(account: StoredBankAccount): string | null {
  return (
    account.bankCode ||
    bankOptions.find((b) => b.name === account.bankName)?.code ||
    null
  );
}

function naira(value: number) {
  return `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Compact horizontally-scrollable variant of bank-accounts/page.tsx's
// BankAccountCard — same logo/name/masked-number treatment, just sized
// to sit in a row instead of stacked full-width, and tappable to select
// rather than tappable to edit.
function BankPickerCard({
  account,
  selected,
  onSelect,
}: {
  account: StoredBankAccount;
  selected: boolean;
  onSelect: () => void;
}) {
  const logo = getBankLogo(account.bankName, account.bankCode);
  const bankName = getCanonicalBankName(account.bankName, account.bankCode);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="vp-card-in relative flex w-52 shrink-0 flex-col overflow-hidden rounded-2xl p-3 text-left transition-transform active:scale-[0.98]"
      style={{
        background: getBankCardGradient(account.bankName, account.bankCode),
        outline: selected
          ? "2px solid rgb(var(--vp-accent-rgb))"
          : "2px solid transparent",
        outlineOffset: 2,
      }}
    >
      {logo && (
        <Image
          src={logo}
          alt=""
          aria-hidden="true"
          width={120}
          height={120}
          className="pointer-events-none absolute -bottom-5 -right-5 z-0 h-24 w-24 object-cover opacity-[0.1] grayscale"
        />
      )}

      {selected && (
        <span
          className="absolute right-2.5 top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: "#34D399" }}
        >
          <Check size={12} strokeWidth={3} style={{ color: "#04150f" }} />
        </span>
      )}

      <div className="relative z-10 flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5">
          {logo ? (
            <Image
              src={logo}
              alt={bankName}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <Landmark size={16} className="text-white/40" />
          )}
        </span>

        <p className="truncate text-[0.82rem] font-black text-white">
          {bankName}
        </p>
      </div>

      <p className="relative z-10 mt-2 truncate text-[0.86rem] font-black tracking-[0.06em] text-white/85">
        {maskAccountNumber(account.accountNumber)}
      </p>
      <p className="relative z-10 mt-0.5 truncate text-[0.58rem] font-bold uppercase tracking-[0.06em] text-white/40">
        {account.accountName}
      </p>
    </button>
  );
}

function AddBankPickerCard({
  onClick,
  hasAccounts,
}: {
  onClick: () => void;
  hasAccounts: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="vp-card-in flex w-52 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors active:bg-white/[0.04]"
      style={{ borderColor: "rgba(255,255,255,0.16)" }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.14)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <Plus size={16} strokeWidth={2.2} />
      </span>
      <p className="text-[0.78rem] font-black text-white/80">
        {hasAccounts ? "Add New…" : "No bank account added"}
      </p>
      <p className="text-[0.64rem] leading-relaxed text-white/35">
        {hasAccounts
          ? "Tap to add another bank account"
          : "Tap to add a bank account"}
      </p>
    </button>
  );
}

// Read-only "Withdraw from" row — dropdown-styled to match the reference
// design, but not actually interactive: there's only one wallet balance
// in this app. "Withdraw to" (bank vs. another user) uses
// DestinationToggle below instead, since that one genuinely is a choice.
function StaticRow({
  icon: Icon,
  label,
}: {
  icon: typeof Wallet;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border bg-white/5 px-3.5 py-3"
      style={{ borderColor: "rgba(255,255,255,0.1)" }}
    >
      <Icon size={16} className="shrink-0 text-white/40" />
      <span className="flex-1 truncate text-[0.88rem] font-bold text-white/90">
        {label}
      </span>
      <ChevronDown size={16} className="shrink-0 text-white/30" />
    </div>
  );
}

function DestinationToggle({
  mode,
  onChange,
}: {
  mode: DestinationMode;
  onChange: (mode: DestinationMode) => void;
}) {
  const options: { id: DestinationMode; label: string; Icon: typeof Wallet }[] =
    [
      { id: "bank", label: "Bank Account", Icon: Landmark },
      { id: "user", label: "Another User", Icon: UserRound },
    ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const active = option.id === mode;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[0.78rem] font-bold transition-colors"
            style={
              active
                ? {
                    borderColor: "rgba(var(--vp-accent-rgb),0.5)",
                    background: "rgba(var(--vp-accent-rgb),0.14)",
                    color: "rgb(var(--vp-accent-rgb))",
                  }
                : {
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.55)",
                  }
            }
          >
            <option.Icon size={15} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function RecipientNameStatus({
  state,
  name,
}: {
  state: ResolveState;
  name: string | null;
}) {
  if (state === "loading") {
    return (
      <span className="flex items-center gap-2 text-[0.78rem] text-white/45">
        <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white/70" />
        Looking up recipient…
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="text-[0.8rem] font-bold" style={{ color: "#F87171" }}>
        No ValuePlus account found for this email
      </span>
    );
  }
  if (state === "success") {
    return (
      <span
        className="flex items-center gap-1.5 text-[0.8rem] font-bold"
        style={{ color: "#34D399" }}
      >
        <Check size={14} className="shrink-0" />
        {name}
      </span>
    );
  }
  return (
    <span className="text-[0.74rem] text-white/30">
      Enter the recipient&apos;s ValuePlus account email
    </span>
  );
}

export default function WithdrawModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { accounts, hydrated, addAccount } = useBankAccounts();
  const { profile: kycProfile, loading: kycLoading } = useKYCProfile();
  const {
    balance,
    loading: balanceLoading,
    refetch: refetchBalance,
  } = useWalletBalance();

  const [destinationMode, setDestinationMode] =
    useState<DestinationMode>("bank");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [resolveState, setResolveState] = useState<ResolveState>("idle");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmount("");
    setDestinationMode("bank");
    setRecipientEmail("");
    setResolveState("idle");
    setResolvedName(null);
  }, [open]);

  // Auto-resolves the recipient's name once the typed email looks
  // complete — debounced so it doesn't fire on every keystroke.
  useEffect(() => {
    if (destinationMode !== "user") return;
    if (!EMAIL_PATTERN.test(recipientEmail.trim())) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolveState("idle");
      setResolvedName(null);
      return;
    }

    let cancelled = false;
    setResolveState("loading");
    setResolvedName(null);

    const timer = setTimeout(async () => {
      try {
        const result = await lookupUserByEmail(recipientEmail.trim());
        if (cancelled) return;
        if (result.found && result.full_name) {
          setResolvedName(result.full_name);
          setResolveState("success");
        } else {
          setResolveState("error");
        }
      } catch {
        if (!cancelled) setResolveState("error");
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [destinationMode, recipientEmail]);

  // The debounced effect above only fires for a full-looking email — if
  // the user instead clicks out of the field with something incomplete
  // (no ".com" typed yet, say), still attempt a lookup right away rather
  // than leaving it unresolved.
  const handleEmailBlur = async () => {
    const trimmed = recipientEmail.trim();
    if (!trimmed || resolveState === "success" || resolveState === "loading")
      return;
    setResolveState("loading");
    try {
      const result = await lookupUserByEmail(trimmed);
      if (result.found && result.full_name) {
        setResolvedName(result.full_name);
        setResolveState("success");
      } else {
        setResolveState("error");
      }
    } catch {
      setResolveState("error");
    }
  };

  // Keeps a valid account selected as the list changes — defaults to
  // whichever's marked default, falling back to the first one.
  useEffect(() => {
    if (accounts.length === 0) {
      if (selectedId !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedId(null);
      }
      return;
    }
    if (selectedId && accounts.some((a) => a.id === selectedId)) return;
    setSelectedId(accounts.find((a) => a.isDefault)?.id ?? accounts[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  const selectedAccount = accounts.find((a) => a.id === selectedId) ?? null;
  const isKycApproved = kycProfile?.status === "approved";

  const amountValue = Number(amount.replace(/,/g, "")) || 0;
  const fee = useMemo(() => calculateTransferFee(amountValue), [amountValue]);
  const netAmount = Math.max(0, amountValue - fee);

  const belowMinimum =
    destinationMode === "bank" &&
    amountValue > 0 &&
    amountValue < MINIMUM_WITHDRAWAL_AMOUNT;
  const exceedsBalance = amountValue > 0 && amountValue > balance;
  const selectedBankCode = selectedAccount
    ? bankCodeFor(selectedAccount)
    : null;

  const canSubmit =
    destinationMode === "bank"
      ? isKycApproved &&
        selectedAccount !== null &&
        selectedBankCode !== null &&
        amountValue >= MINIMUM_WITHDRAWAL_AMOUNT &&
        !exceedsBalance &&
        !submitting
      : isKycApproved &&
        resolveState === "success" &&
        resolvedName !== null &&
        amountValue > 0 &&
        !exceedsBalance &&
        !submitting;

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    setAmount(digits ? Number(digits).toLocaleString() : "");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      if (destinationMode === "bank") {
        if (!selectedAccount || !selectedBankCode) return;
        await requestWithdrawal({
          amount: amountValue,
          bankName: selectedAccount.bankName,
          bankCode: selectedBankCode,
          accountNumber: selectedAccount.accountNumber,
          accountName: selectedAccount.accountName,
        });
      } else {
        // apiFetch already fires a success toast off the backend's own
        // "message" field (e.g. "₦100.00 sent to Jane Doe!") — no need
        // to notify() again here.
        await transferToUser({
          recipientEmail: recipientEmail.trim(),
          amount: amountValue,
        });
      }
      refetchBalance();
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify(
          "Could not complete this transaction. Please try again.",
          "error",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={open && !addBankOpen} onClose={onClose}>
        <h3 className="mb-1 flex items-center gap-2 text-[1.05rem] font-black text-white">
          <ArrowDownToLine
            size={18}
            style={{ color: "rgb(var(--vp-accent-rgb))" }}
          />
          Withdraw
        </h3>
        <p className="mb-5 text-[0.78rem] leading-relaxed text-white/45">
          {destinationMode === "bank"
            ? "Move money from your wallet to your bank account."
            : "Send money from your wallet to another ValuePlus user."}
        </p>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
              Withdraw from
            </span>
            <StaticRow
              icon={Wallet}
              label={balanceLoading ? "Wallet" : `Wallet (${naira(balance)})`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
              Withdraw to
            </span>
            <DestinationToggle
              mode={destinationMode}
              onChange={setDestinationMode}
            />
          </div>

          {!kycLoading && !isKycApproved && (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/app/more/kyc");
              }}
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left"
              style={{
                borderColor: "rgba(251,191,36,0.35)",
                background: "rgba(251,191,36,0.08)",
              }}
            >
              <AlertTriangle
                size={15}
                className="shrink-0"
                style={{ color: "#FBBF24" }}
              />
              <span
                className="text-[0.76rem] font-semibold"
                style={{ color: "#FBBF24" }}
              >
                KYC required to move funds… Tap to complete.
              </span>
            </button>
          )}

          {destinationMode === "bank" ? (
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
                Select destination account
              </span>
              {!hydrated ? (
                <div className="rounded-2xl border border-white/6 bg-white/3 px-4 py-6 text-center text-[0.76rem] text-white/40">
                  Loading your bank accounts…
                </div>
              ) : (
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 py-1.5">
                  {accounts.map((account) => (
                    <BankPickerCard
                      key={account.id}
                      account={account}
                      selected={account.id === selectedId}
                      onSelect={() => setSelectedId(account.id)}
                    />
                  ))}
                  <AddBankPickerCard
                    onClick={() => setAddBankOpen(true)}
                    hasAccounts={accounts.length > 0}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
                Recipient&apos;s email
              </span>
              <div
                className="flex items-center gap-2 rounded-xl border bg-white/5 px-3.5 py-3"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              >
                <Mail size={16} className="shrink-0 text-white/40" />
                <input
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-[0.92rem] font-bold text-white outline-none placeholder:text-white/25"
                />
              </div>
              <div className="px-1">
                <RecipientNameStatus state={resolveState} name={resolvedName} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
              Amount
            </span>
            <div
              className="flex items-center gap-2 rounded-xl border bg-white/5 px-3.5 py-3"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <Banknote size={16} className="shrink-0 text-white/40" />
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-[1.05rem] font-bold text-white outline-none placeholder:text-white/25"
              />
            </div>
          </div>

          {belowMinimum && (
            <div
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5"
              style={{
                borderColor: "rgba(251,191,36,0.35)",
                background: "rgba(251,191,36,0.08)",
              }}
            >
              <AlertTriangle
                size={15}
                className="shrink-0"
                style={{ color: "#FBBF24" }}
              />
              <span
                className="text-[0.76rem] font-semibold"
                style={{ color: "#FBBF24" }}
              >
                Minimum withdrawal is{" "}
                {naira(MINIMUM_WITHDRAWAL_AMOUNT).split(".")[0]}. Please enter a
                higher amount.
              </span>
            </div>
          )}

          {exceedsBalance && !belowMinimum && (
            <div
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5"
              style={{
                borderColor: "rgba(248,113,113,0.35)",
                background: "rgba(248,113,113,0.08)",
              }}
            >
              <AlertTriangle
                size={15}
                className="shrink-0"
                style={{ color: "#F87171" }}
              />
              <span
                className="text-[0.76rem] font-semibold"
                style={{ color: "#F87171" }}
              >
                You don&apos;t have enough balance for this{" "}
                {destinationMode === "bank" ? "withdrawal" : "transfer"}.
              </span>
            </div>
          )}

          {destinationMode === "bank" &&
            amountValue > 0 &&
            !belowMinimum &&
            !exceedsBalance && (
              <div
                className="rounded-xl border px-3.5 py-3"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.72rem] text-white/45">
                    Paystack fee
                  </span>
                  <span
                    className="text-[0.82rem] font-bold"
                    style={{ color: "#F87171" }}
                  >
                    − {naira(fee)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[0.72rem] text-white/45">
                    You will receive
                  </span>
                  <span
                    className="text-[0.92rem] font-black"
                    style={{ color: "#34D399" }}
                  >
                    {naira(netAmount)}
                  </span>
                </div>
              </div>
            )}

          <Button
            type="button"
            variant="primary"
            size="md"
            className="mt-1 w-full"
            loading={submitting}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <ArrowDownToLine size={16} className="mr-1.5" />
            {submitting
              ? destinationMode === "bank"
                ? "Withdrawing…"
                : "Sending…"
              : destinationMode === "bank"
                ? "Withdraw Now"
                : "Send Funds"}
          </Button>
        </div>
      </Modal>

      <AddBankAccountModal
        open={addBankOpen}
        onClose={() => setAddBankOpen(false)}
        onAdd={addAccount}
      />
    </>
  );
}
