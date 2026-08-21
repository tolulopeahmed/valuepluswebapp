"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import Modal from "./Modal";
import { toWhatsAppLink } from "@/lib/whatsapp";
import type { ReferralItem } from "@/hooks/useWallet";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16.02 4C9.4 4 4 9.33 4 15.9c0 2.1.56 4.15 1.62 5.95L4 28l6.32-1.58A12.17 12.17 0 0 0 16.02 28C22.65 28 28 22.67 28 16.1 28 9.53 22.65 4 16.02 4Zm0 21.86c-1.78 0-3.52-.47-5.03-1.36l-.36-.21-3.75.94 1-3.62-.24-.38a9.86 9.86 0 0 1-1.5-5.23c0-5.38 4.43-9.76 9.88-9.76 5.45 0 9.88 4.38 9.88 9.76s-4.43 9.86-9.88 9.86Z" />
      <path d="M21.42 18.55c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.09 3.17 5.07 4.45.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function naira(value: string) {
  const n = Number(value);
  return `₦${Number.isNaN(n) ? 0 : n.toLocaleString()}`;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.04] px-2 py-3 text-center">
      <span className="text-[0.56rem] font-black uppercase tracking-wide text-white/40">
        {label}
      </span>
      <span className="truncate text-[0.85rem] font-black text-white">
        {value}
      </span>
    </div>
  );
}

export default function ReferralDetailsModal({
  referral,
  onClose,
}: {
  referral: ReferralItem | null;
  onClose: () => void;
}) {
  if (!referral) return null;

  const user = referral.referred_user;
  const name = user ? `${user.first_name} ${user.last_name}`.trim() : "Deleted account";
  const initial = (user?.first_name.trim().charAt(0) || "?").toUpperCase();
  const isConfirmed = referral.status === "confirmed";

  const whatsappMessage = `Hi ${user?.first_name ?? ""}! Just following up on your ValuePlus project 🙂`;

  return (
    <Modal open={!!referral} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={name}
            width={72}
            height={72}
            unoptimized
            className="h-[72px] w-[72px] rounded-full border-2 object-cover"
            style={{ borderColor: "rgba(var(--vp-accent-rgb),0.5)" }}
          />
        ) : (
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 text-2xl font-black text-white"
            style={{
              borderColor: "rgba(var(--vp-accent-rgb),0.5)",
              background: "linear-gradient(145deg, #3a4763, #232e47)",
            }}
          >
            {initial}
          </div>
        )}

        <h3 className="mt-3 text-[1.05rem] font-black text-white">{name}</h3>
        {user && (
          <p className="mt-0.5 text-[0.76rem] text-white/45">{user.email}</p>
        )}

        <span
          className="mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-black uppercase tracking-wide"
          style={
            isConfirmed
              ? {
                  background: "rgba(52,211,153,0.12)",
                  borderColor: "rgba(52,211,153,0.35)",
                  color: "#34D399",
                }
              : {
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.55)",
                }
          }
        >
          {isConfirmed ? "Confirmed" : "Pending"}
        </span>

        <div className="mt-5 flex w-full gap-2.5">
          <StatTile
            label="Reward"
            value={isConfirmed ? naira(referral.amount_earned) : "—"}
          />
          <StatTile label="Joined" value={formatDate(referral.created_at)} />
          <StatTile label="Ref ID" value={referral.id.slice(0, 8)} />
        </div>

        {user && (
          <div className="mt-6 w-full">
            <p className="mb-2 text-left text-[0.6rem] font-black uppercase tracking-wide text-white/40">
              Follow up
            </p>

            <div className="flex flex-col gap-2.5">
              {referral.whatsapp_number && (
                <a
                  href={toWhatsAppLink(referral.whatsapp_number, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
                  style={{ background: "#22c55e" }}
                >
                  <WhatsAppIcon size={17} />
                  Message on WhatsApp
                </a>
              )}

              <a
                href={`mailto:${user.email}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] py-3 text-sm font-bold text-white/85 transition-transform active:scale-[0.98]"
              >
                <Mail size={16} strokeWidth={2} />
                Send an Email
              </a>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl py-3 text-sm font-bold"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
