"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Check, Landmark } from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import { notify } from "../lib/snackbar";
import { ApiError } from "../lib/api";
import { bankOptions } from "../lib/bankOptions";
import {
  detectBankAccount,
  type DetectedBankMatch,
  type LinkedBankAccount,
} from "../hooks/useWallet";

const inputClass =
  "w-full rounded-xl border bg-white/5 px-3.5 py-[0.65rem] text-[0.9rem] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[rgba(var(--vp-accent-rgb),0.55)] focus:bg-white/[0.07]";

function Field({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
        {label}
      </span>
      <input {...inputProps} className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
    </label>
  );
}

// NUBAN account numbers are always 10 digits — detection only makes
// sense once a full one's been typed, not on every keystroke.
const ACCOUNT_NUMBER_LENGTH = 10;

function bankLogoFor(bankCode: string) {
  return bankOptions.find((b) => b.code === bankCode)?.logo ?? null;
}

function BankMatchRow({
  match,
  selected,
  onSelect,
}: {
  match: DetectedBankMatch;
  selected: boolean;
  onSelect: () => void;
}) {
  const logo = bankLogoFor(match.bank_code);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors"
      style={{
        borderColor: selected ? "rgb(var(--vp-accent-rgb))" : "rgba(255,255,255,0.1)",
        background: selected ? "rgba(var(--vp-accent-rgb),0.08)" : "transparent",
      }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white">
        {logo ? (
          <Image src={logo} alt="" width={32} height={32} className="h-full w-full object-cover" />
        ) : (
          <Landmark size={15} className="text-black/40" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <p className="truncate text-[0.85rem] font-bold text-white/90">{match.bank_name}</p>
        <p className="truncate text-[0.74rem] text-white/50">{match.account_name}</p>
      </span>
      {selected && (
        <Check size={16} className="shrink-0" style={{ color: "rgb(var(--vp-accent-rgb))" }} />
      )}
    </button>
  );
}

export default function AddBankAccountModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (account: LinkedBankAccount) => Promise<unknown>;
}) {
  const [bvn, setBvn] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [matches, setMatches] = useState<DetectedBankMatch[]>([]);
  const [selected, setSelected] = useState<DetectedBankMatch | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);
  // Distinct from "searched and genuinely found nothing" — a network/
  // timeout failure shouldn't tell the user their account number is
  // probably wrong when the real problem is that the request itself
  // never completed.
  const [detectError, setDetectError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fresh form every time the modal is reopened, rather than carrying
  // over whatever was left from a previous open/cancel.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBvn("");
    setAccountNumber("");
    setMatches([]);
    setSelected(null);
    setSearchedOnce(false);
    setDetectError(null);
  }, [open]);

  // Account-number-first, same as mobile's AddBankModal: once a full
  // 10-digit number is typed, probe a shortlist of banks server-side and
  // list every one that matches — pick one and the account name is
  // already resolved, no separate bank-picker step.
  useEffect(() => {
    setMatches([]);
    setSelected(null);
    setSearchedOnce(false);
    setDetectError(null);
    if (accountNumber.length !== ACCOUNT_NUMBER_LENGTH) return;

    let cancelled = false;
    setDetecting(true);

    detectBankAccount(accountNumber)
      .then((res) => {
        if (cancelled) return;
        setMatches(res.matches);
        setSearchedOnce(true);
        if (res.matches.length === 1) setSelected(res.matches[0]);
      })
      .catch((err) => {
        if (cancelled) return;
        setDetectError(
          err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setDetecting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accountNumber]);

  const canSubmit = selected !== null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setSubmitting(true);
    try {
      await onAdd({
        bankName: selected.bank_name,
        bankCode: selected.bank_code,
        accountNumber,
        accountName: selected.account_name,
        isVerified: true,
      });
      onClose();
    } catch (err) {
      // apiFetch already fires its own error toast for an ApiError —
      // only the network-level case needs a fallback here. Either way,
      // keep the modal open so the user can retry without retyping.
      if (!(err instanceof ApiError)) {
        notify("Could not add this bank account. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-1 text-[1.05rem] font-black text-white">
        Add Bank Account
      </h3>
      <p className="mb-5 text-[0.78rem] leading-relaxed text-white/45">
        Set up your bank account so you can perform faster withdrawals.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field
          label="Bank verification number (BVN) — optional"
          value={bvn}
          onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
          inputMode="numeric"
          placeholder="e.g. 22101234567"
        />

        <Field
          label="Bank account number"
          value={accountNumber}
          onChange={(e) =>
            setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, ACCOUNT_NUMBER_LENGTH))
          }
          inputMode="numeric"
          placeholder="0123456789"
          required
        />

        {detecting && (
          <p className="flex items-center gap-2 text-[0.82rem] text-white/45">
            <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white/70" />
            Checking which bank this belongs to…
          </p>
        )}

        {!detecting && detectError && (
          <p className="text-[0.8rem] font-semibold" style={{ color: "#F87171" }}>
            {detectError}
          </p>
        )}

        {!detecting && !detectError && searchedOnce && matches.length === 0 && (
          <p className="text-[0.8rem] font-semibold" style={{ color: "#F87171" }}>
            We couldn&apos;t match this number to a bank. Double-check the digits and try again.
          </p>
        )}

        {!detecting && matches.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
              {matches.length === 1 ? "Bank found" : "Select your bank"}
            </span>
            <div className="flex flex-col gap-2">
              {matches.map((m) => (
                <BankMatchRow
                  key={m.bank_code}
                  match={m}
                  selected={selected?.bank_code === m.bank_code}
                  onSelect={() => setSelected(m)}
                />
              ))}
            </div>
          </div>
        )}

        <p className="text-[0.68rem] leading-relaxed text-white/35">
          This bank account can only be used by you for receiving money.
        </p>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="mt-1 w-full"
          loading={submitting}
          disabled={!canSubmit}
        >
          {submitting ? "Adding…" : "Add Bank Account"}
        </Button>
      </form>
    </Modal>
  );
}
