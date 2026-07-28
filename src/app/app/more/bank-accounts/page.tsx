"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check, Landmark, Plus, Trash2 } from "lucide-react";
import Title from "../../../../components/Title";
import Subtitle from "../../../../components/Subtitle";
import SectionLabel from "../../../../components/SectionLabel";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/buttons/buttons";
import AddBankAccountModal from "../../../../components/AddBankAccountModal";
import { getBankLogo } from "../../../../lib/bankOptions";
import { useLocalBankAccounts, type StoredBankAccount } from "../../../../hooks/useWallet";

function maskAccountNumber(accountNumber: string) {
  const last4 = accountNumber.slice(-4);
  return `•••• •••• ${last4}`;
}

// Mirrors MyFund's bank card look: solid navy card, logo tile on the left,
// bank name/masked number/holder name stacked center, a green "default"
// checkmark floating top-right, a delete button floating bottom-right
// over a faint oversized watermark of the same logo, and a mint accent
// bar along the bottom edge — only for whichever account is active. A
// non-default account gets a plain outlined "tap to activate" circle
// instead of the checkmark, and no accent bar.
function BankAccountCard({
  account,
  onRemove,
  onSetDefault,
}: {
  account: StoredBankAccount;
  onRemove: () => void;
  onSetDefault: () => void;
}) {
  const logo = getBankLogo(account.bankName);

  return (
    <div
      className="vp-card-in relative overflow-hidden rounded-3xl p-5 pb-7"
      style={{
        background: account.isDefault
          ? "linear-gradient(155deg, #1D2B6B 0%, #141D4A 55%, #0B1230 100%)"
          : "linear-gradient(155deg, #1a2036 0%, #12162a 55%, #0b0e1f 100%)",
      }}
    >
      {logo && (
        <Image
          src={logo}
          alt=""
          aria-hidden="true"
          width={200}
          height={200}
          className="pointer-events-none absolute -bottom-6 -right-6 z-0 h-40 w-40 object-cover opacity-[0.08] grayscale"
        />
      )}

      {account.isDefault ? (
        <span
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "#34D399" }}
          title="Default account"
        >
          <Check size={15} strokeWidth={3} style={{ color: "#04150f" }} />
        </span>
      ) : (
        <button
          type="button"
          onClick={onSetDefault}
          title="Set as default"
          aria-label="Set as default account"
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-white/30 transition-colors hover:border-white/40 hover:text-white/60"
        >
          <Check size={15} strokeWidth={3} />
        </button>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove bank account"
        className="absolute bottom-6 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-90"
        style={{ background: "rgba(248,113,113,0.2)" }}
      >
        <Trash2 size={14} style={{ color: "#f87171" }} />
      </button>

      <div className="relative z-10 flex items-start gap-3.5 pr-10">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/5">
          {logo ? (
            <Image
              src={logo}
              alt={account.bankName}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <Landmark size={22} className="text-white/40" />
          )}
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-[1rem] font-black text-white">
            {account.bankName}
          </p>
          <p className="mt-1.5 text-[1.3rem] font-black tracking-[0.12em] text-white/90">
            {maskAccountNumber(account.accountNumber)}
          </p>
          <p className="mt-2 truncate text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white/45">
            {account.accountName}
          </p>
        </div>
      </div>

      {account.isDefault && (
        <span
          className="absolute inset-x-0 bottom-0 h-1.5"
          style={{
            background: "linear-gradient(90deg, #34D399, #6EE7B7)",
          }}
        />
      )}
    </div>
  );
}

function AddAccountCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="vp-card-in flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-5 py-10 text-center transition-colors active:bg-white/[0.04]"
      style={{ borderColor: "rgba(255,255,255,0.16)" }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          background: "rgba(var(--vp-accent-rgb),0.14)",
          color: "rgb(var(--vp-accent-rgb))",
        }}
      >
        <Plus size={20} strokeWidth={2.2} />
      </span>
      <p className="text-[0.88rem] font-black text-white/80">
        Add a bank account
      </p>
      <p className="max-w-[16rem] text-[0.68rem] leading-relaxed text-white/35">
        Link a bank account so you can receive withdrawals directly.
      </p>
    </button>
  );
}

function RemoveBankAccountModal({
  account,
  onClose,
  onConfirm,
}: {
  account: StoredBankAccount | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!account) return null;

  return (
    <Modal open={!!account} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.12)] text-[#f87171]">
          <Trash2 size={22} strokeWidth={1.8} />
        </span>

        <h3 className="mb-2 text-[1.05rem] font-black text-white">
          Remove this bank account?
        </h3>
        <p className="mb-6 max-w-[20rem] text-[0.82rem] leading-relaxed text-white/50">
          {account.bankName} •••• {account.accountNumber.slice(-4)} will be
          removed from your account. This can&apos;t be undone.
        </p>

        <div className="flex w-full gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            style={{
              background: "#f87171",
              color: "#2a0a0a",
              boxShadow: "0 10px 24px rgba(248,113,113,0.3)",
            }}
            onClick={onConfirm}
          >
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function BankAccountsPageInner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<StoredBankAccount | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { accounts, hydrated, addAccount, removeAccount, setDefault } =
    useLocalBankAccounts();

  // Quick Actions' "Add bank account" row (only shown when nothing's
  // linked yet) sends the user here with ?add=1 to jump straight into the
  // modal instead of just the empty-state list. Cleared from the URL
  // right after so a later refresh/back-nav doesn't reopen it.
  useEffect(() => {
    if (searchParams.get("add") !== "1" || !hydrated || accounts.length > 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalOpen(true);
    router.replace("/app/more/bank-accounts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hydrated, accounts.length]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-6">
        <Title className="block">Bank Accounts</Title>
        <Subtitle>Set up your bank account for faster withdrawals.</Subtitle>
      </div>

      <div
        className="vp-card-in mb-6 flex items-start gap-3 rounded-2xl border p-4"
        style={{
          borderColor: "rgba(var(--vp-accent-rgb),0.2)",
          background: "rgba(var(--vp-accent-rgb),0.06)",
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "rgba(var(--vp-accent-rgb),0.16)",
            color: "rgb(var(--vp-accent-rgb))",
          }}
        >
          <Landmark size={17} strokeWidth={1.9} />
        </span>
        <p className="text-[0.78rem] leading-relaxed text-white/60">
          Set up your bank account so you can perform faster withdrawals.
        </p>
      </div>

      <SectionLabel>List of bank accounts</SectionLabel>

      {!hydrated ? (
        <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
          Loading your bank accounts…
        </div>
      ) : accounts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {accounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onRemove={() => setPendingRemoval(account)}
              onSetDefault={() => setDefault(account.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3.5 text-[0.82rem] font-bold text-white/50 transition-colors active:bg-white/[0.04]"
          >
            <Plus size={15} />
            Add New Account
          </button>
        </div>
      ) : (
        <AddAccountCard onClick={() => setModalOpen(true)} />
      )}

      <AddBankAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addAccount}
      />

      <RemoveBankAccountModal
        account={pendingRemoval}
        onClose={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (pendingRemoval) removeAccount(pendingRemoval.id);
          setPendingRemoval(null);
        }}
      />
    </div>
  );
}

export default function BankAccountsPage() {
  return (
    <Suspense fallback={null}>
      <BankAccountsPageInner />
    </Suspense>
  );
}
