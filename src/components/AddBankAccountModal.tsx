"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { Check, ChevronDown, Landmark } from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import { notify } from "../lib/snackbar";
import { bankOptions, type BankOption } from "../lib/bankOptions";
import { resolveBankAccount, type LinkedBankAccount } from "../hooks/useWallet";

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

// No Autocomplete-with-light-theme component (the MUI one myfund uses) —
// this app's modals are all dark, so a plain in-flow expand/collapse list
// is used instead of an absolutely-positioned popover, which would get
// clipped by Modal's own overflow-y-auto body.
function BankSelectField({
  value,
  onChange,
}: {
  value: BankOption | null;
  onChange: (bank: BankOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = bankOptions.filter((bank) =>
    bank.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
        Bank
      </span>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <span className="flex min-w-0 items-center gap-2">
          {value?.logo && (
            <Image
              src={value.logo}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 rounded-full object-cover"
            />
          )}
          <span className={`truncate ${value ? "text-white" : "text-white/30"}`}>
            {value?.name ?? "Select bank"}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="overflow-hidden rounded-xl border bg-black/25"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search banks…"
            className="w-full border-b bg-transparent px-3.5 py-2.5 text-[0.85rem] text-white outline-none placeholder:text-white/30"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          />
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3.5 py-3 text-[0.78rem] text-white/35">
                No banks found
              </p>
            ) : (
              filtered.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => {
                    onChange(bank);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white">
                    {bank.logo ? (
                      <Image
                        src={bank.logo}
                        alt=""
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Landmark size={14} className="text-black/40" />
                    )}
                  </span>
                  <span className="truncate text-[0.82rem] font-semibold text-white/85">
                    {bank.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type ResolveState = "idle" | "loading" | "success" | "error";

// NUBAN account numbers are always 10 digits — resolution only makes
// sense once a full one's been typed, not on every keystroke.
const ACCOUNT_NUMBER_LENGTH = 10;

function AccountNameStatus({
  state,
  name,
}: {
  state: ResolveState;
  name: string | null;
}) {
  if (state === "loading") {
    return (
      <span className="flex items-center gap-2 text-[0.82rem] text-white/45">
        <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white/70" />
        Verifying account…
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="text-[0.86rem] font-bold" style={{ color: "#F87171" }}>
        Name not found
      </span>
    );
  }

  if (state === "success") {
    return (
      <span
        className="flex items-center gap-1.5 text-[0.86rem] font-bold"
        style={{ color: "#34D399" }}
      >
        <Check size={15} className="shrink-0" />
        {name}
      </span>
    );
  }

  return (
    <span className="text-[0.78rem] text-white/30">
      Select a bank and enter the account number to verify
    </span>
  );
}

export default function AddBankAccountModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (account: LinkedBankAccount) => void;
}) {
  const [bvn, setBvn] = useState("");
  const [bank, setBank] = useState<BankOption | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolveState, setResolveState] = useState<ResolveState>("idle");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fresh form every time the modal is reopened, rather than carrying
  // over whatever was left from a previous open/cancel.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBvn("");
    setBank(null);
    setAccountNumber("");
    setResolveState("idle");
    setResolvedName(null);
  }, [open]);

  // Auto-resolves the account name via Paystack once a bank is picked and
  // a full 10-digit account number is typed — debounced so it doesn't
  // fire on every keystroke, and `cancelled` guards against a stale
  // response landing after the bank/number changed again.
  useEffect(() => {
    if (!bank || accountNumber.length !== ACCOUNT_NUMBER_LENGTH) {
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
        const result = await resolveBankAccount(accountNumber, bank.code);
        if (cancelled) return;
        if (result.resolved && result.account_name) {
          setResolvedName(result.account_name);
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
  }, [bank, accountNumber]);

  const canSubmit = bank !== null && resolveState === "success" && resolvedName !== null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bank || !canSubmit || !resolvedName) return;

    setSubmitting(true);
    // No bank-linking endpoint exists yet (see MyBankAccountView — GET
    // only) — this just hands the new account to the page's local state
    // so the flow can be reviewed end to end. Swap for a real POST once
    // that endpoint lands.
    await new Promise((resolve) => setTimeout(resolve, 400));
    onAdd({
      bankName: bank.name,
      accountNumber,
      accountName: resolvedName,
      isVerified: true,
    });
    notify("Bank account added!", "success");
    setSubmitting(false);
    onClose();
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

        <BankSelectField value={bank} onChange={setBank} />

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

        <div className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/45">
            Account name
          </span>
          <div
            className="flex min-h-[2.7rem] items-center rounded-xl border bg-white/5 px-3.5 py-[0.65rem]"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <AccountNameStatus state={resolveState} name={resolvedName} />
          </div>
        </div>

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
