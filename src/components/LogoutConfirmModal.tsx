"use client";

import { LogOut } from "lucide-react";
import Modal from "./Modal";
import Button from "./buttons/buttons";

export default function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.12)] text-[#f87171]">
          <LogOut size={22} strokeWidth={1.8} />
        </span>

        <h3 className="mb-2 text-[1.05rem] font-black text-white">
          Log out?
        </h3>
        <p className="mb-6 max-w-[20rem] text-[0.82rem] leading-relaxed text-white/50">
          You&apos;ll need to log back in with your email and password to
          access your dashboard again.
        </p>

        <div className="flex w-full gap-3">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
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
            onClick={onConfirm}
          >
            Log out
          </Button>
        </div>
      </div>
    </Modal>
  );
}
