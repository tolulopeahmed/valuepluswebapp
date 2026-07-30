"use client";

import { useState } from "react";
import Image from "next/image";
import { Banknote, PlusCircle } from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import { VALUEPLUS_PAYMENT_ACCOUNT } from "../lib/bankOptions";
import { notify } from "../lib/snackbar";
import { ApiError } from "../lib/api";
import { requestDeposit } from "../hooks/useWallet";

// Same quick-pick amounts as MyFund's QuickSave modal — one tap instead
// of typing out a round number.
const QUICK_AMOUNTS = [2000, 5000, 10000, 15000, 20000];

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
      // Clipboard API can be unavailable — the value is still shown on
      // screen either way.
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

export default function AddFundsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amountValue = Number(amount.replace(/,/g, "")) || 0;

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    setAmount(digits ? Number(digits).toLocaleString() : "");
  };

  const handleClose = () => {
    if (submitting) return;
    setAmount("");
    onClose();
  };

  const handleConfirm = async () => {
    if (amountValue <= 0) return;
    setSubmitting(true);
    try {
      // apiFetch already fires a success toast off the backend's own
      // "message" field ("We've received your request!...") — no need
      // to notify() or show a separate success screen here, same
      // convention as WithdrawModal's peer-to-peer transfer path.
      await requestDeposit(amountValue);
      setAmount("");
      onClose();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not submit your deposit. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center text-center">
          <span
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border"
            style={{
              borderColor: "rgba(var(--vp-accent-rgb),0.3)",
              background: "rgba(var(--vp-accent-rgb),0.12)",
              color: "rgb(var(--vp-accent-rgb))",
            }}
          >
            <PlusCircle size={22} strokeWidth={2} />
          </span>
          <h3 className="text-[1.05rem] font-black text-white">Add Funds</h3>
          <p className="mt-1 max-w-[20rem] text-[0.78rem] leading-relaxed text-white/50">
            Manually move funds from your bank account into your ValuePlus
            wallet.
          </p>
        </div>

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

          <div className="mt-1 flex gap-1.5 overflow-x-auto pb-1">
            {QUICK_AMOUNTS.map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setAmount(quick.toLocaleString())}
                className="shrink-0 rounded-full border px-3 py-1.5 text-[0.7rem] font-bold transition-colors"
                style={{
                  borderColor:
                    amountValue === quick
                      ? "rgb(var(--vp-accent-rgb))"
                      : "rgba(255,255,255,0.12)",
                  color:
                    amountValue === quick
                      ? "rgb(var(--vp-accent-rgb))"
                      : "rgba(255,255,255,0.55)",
                  background:
                    amountValue === quick
                      ? "rgba(var(--vp-accent-rgb),0.1)"
                      : "transparent",
                }}
              >
                ₦{(quick / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            className="mb-1.5 text-[0.7rem] font-black uppercase tracking-wide"
            style={{ color: "#FFD60A" }}
          >
            1. Transfer the exact amount above to
          </p>

          <div className="w-full rounded-2xl border border-white/10 bg-white/3 p-3.5">
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

            <div className="mt-2.5">
              <CopyField
                label="Account no."
                value={VALUEPLUS_PAYMENT_ACCOUNT.accountNumber}
                copyValue={VALUEPLUS_PAYMENT_ACCOUNT.accountNumber}
              />
            </div>
          </div>

          <p className="mt-2 text-[0.68rem] leading-relaxed text-white/35">
            Ensure the account name matches your ValuePlus name records.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-[0.7rem] font-black uppercase tracking-wide text-white/45">
            2. Tap the button below afterwards (not before)
          </p>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleConfirm}
            disabled={amountValue <= 0 || submitting}
          >
            {submitting ? "Submitting…" : "I've Sent The Payment"}
          </Button>
          <p className="mt-2 text-center text-[0.64rem] leading-snug text-white/35">
            Unconfirmed requests made before sending will be ignored.
          </p>
        </div>
      </div>
    </Modal>
  );
}
