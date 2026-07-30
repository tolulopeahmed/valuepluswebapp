"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";
import { notify } from "../lib/snackbar";
import { deleteMyAccount } from "../hooks/useAccountDeletion";
import { useAuth } from "../contexts/AuthContext";

// Same row treatment as more/Settings.tsx's SettingRow — icon box, label,
// subtitle, chevron — so this modal reads as an extension of that page
// rather than a visually distinct one-off.
function ManageAccountRow({
  icon,
  label,
  subtitle,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-colors active:bg-white/[0.06]"
      style={{
        background: danger ? "rgba(248,113,113,0.06)" : "rgba(var(--vp-accent-rgb),0.08)",
        borderColor: danger ? "rgba(248,113,113,0.22)" : "rgba(var(--vp-accent-rgb),0.16)",
      }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: danger ? "rgba(248,113,113,0.14)" : "rgba(var(--vp-accent-rgb),0.16)",
          color: danger ? "#f87171" : "rgb(var(--vp-accent-rgb))",
        }}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[0.9rem] font-black ${danger ? "text-red-300" : "text-white"}`}>
          {label}
        </p>
        <p className="truncate text-[0.66rem] text-white/40">{subtitle}</p>
      </div>

      <div className="shrink-0">
        <ChevronRight size={16} className="text-white/25" />
      </div>
    </button>
  );
}

function DeleteAccountConfirmModal({
  open,
  onClose,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await deleteMyAccount();
      notify("Your account has been closed.", "success");
      onDeleted();
    } catch {
      notify(
        "Could not close your account right now. Please try again or contact support.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={submitting ? () => {} : onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.12)] text-[#f87171]">
          <Trash2 size={22} strokeWidth={1.8} />
        </span>

        <h3 className="mb-2 text-[1.05rem] font-black text-white">
          Delete your account?
        </h3>
        <p className="mb-6 max-w-[22rem] text-[0.82rem] leading-relaxed text-white/50">
          Any remaining wallet balance will be paid out to your linked bank
          account first, then your account will be permanently closed and
          you&apos;ll be logged out. This can&apos;t be undone.
        </p>

        <div className="flex w-full gap-3">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={submitting}
          >
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
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Closing account…" : "Delete account"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ManageAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleUpdateKyc = () => {
    onClose();
    router.push("/app/more/kyc");
  };

  const handleAccountDeleted = async () => {
    setConfirmOpen(false);
    onClose();
    await logout();
    router.push("/login");
  };

  return (
    <>
      <Modal open={open && !confirmOpen} onClose={onClose}>
        <div className="flex flex-col gap-2">
          <h3 className="mb-1 text-[1.05rem] font-black text-white">
            Manage Account
          </h3>

          <ManageAccountRow
            icon={<ShieldCheck size={18} strokeWidth={1.9} />}
            label="Update KYC"
            subtitle="Review or update your verification details"
            onClick={handleUpdateKyc}
          />

          <ManageAccountRow
            icon={<Trash2 size={18} strokeWidth={1.9} />}
            label="Delete My Account"
            subtitle="Withdraw your balance and permanently close your account"
            danger
            onClick={() => setConfirmOpen(true)}
          />
        </div>
      </Modal>

      <DeleteAccountConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onDeleted={handleAccountDeleted}
      />
    </>
  );
}
