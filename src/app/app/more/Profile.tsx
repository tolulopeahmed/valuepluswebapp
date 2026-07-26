"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Image from "next/image";
import { Camera, Check, Landmark, Pencil, TrendingUp } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useMyBooks } from "../../../hooks/useMyBooks";
import MarqueeName from "../../../components/MarqueeName";
import AutoFitText from "../../../components/AutoFitText";
import Button from "../../../components/buttons/buttons";
import Modal from "../../../components/Modal";
import AvatarCropModal from "../../../components/AvatarCropModal";
import EditProfileModal from "../../../components/EditProfileModal";
import { notify } from "../../../lib/snackbar";
import { ApiError } from "../../../lib/api";

// Bullet count is fixed (not tied to the real value's length) — the point
// is to signal "hidden", not to leak the digit count of the amount
// underneath.
const MASKED_AMOUNT = "••••••";

function StatTile({
  icon,
  label,
  value,
  valueColor = "#ffffff",
  badge,
  maskable = false,
  hidden = false,
  onToggleHidden,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueColor?: string;
  badge?: string;
  maskable?: boolean;
  hidden?: boolean;
  onToggleHidden?: () => void;
}) {
  const className =
    "flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left";
  const style = {
    background: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
  };

  const content = (
    <>
      <span className="shrink-0 text-white/55">{icon}</span>
      <div className="min-w-0 flex-1">
        <AutoFitText>
          <p className="text-[0.56rem] font-black uppercase leading-none tracking-[0.14em] text-white/45">
            {label}
          </p>
        </AutoFitText>
        {/* AutoFitText (not flex-wrap/truncate) — "Get NUBAN" + its badge
            is wider than a side-by-side tile on most phones. Scaling the
            whole value+badge group down as one unit keeps both fully
            legible on one line at any width, instead of wrapping the
            badge onto its own line or clipping the label. */}
        <AutoFitText className="mt-0">
          <p
            className="text-[1.05rem] font-black leading-none"
            style={{ color: valueColor }}
          >
            {hidden ? MASKED_AMOUNT : value}
          </p>
          {badge && (
            <span
              className="ml-1.5 shrink-0 rounded-md px-1.5 py-0.5 text-[0.48rem] font-black uppercase tracking-wide"
              style={{
                background: "rgb(var(--vp-accent-rgb))",
                color: "#171100",
              }}
            >
              {badge}
            </span>
          )}
        </AutoFitText>
      </div>
    </>
  );

  // No eye icon anymore — the whole tile itself is the toggle now, tap
  // anywhere on it (not just a small icon target) to hide/reveal.
  if (maskable) {
    return (
      <button
        type="button"
        onClick={onToggleHidden}
        aria-label={hidden ? "Show total earnings" : "Hide total earnings"}
        className={`${className} transition-transform active:scale-[0.97]`}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

function AvatarUpdatedModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(74,222,128,0.28)] bg-[rgba(74,222,128,0.12)] text-[#4ade80]">
          <Check size={24} strokeWidth={2.5} />
        </span>

        <h3 className="mb-2 text-[1.05rem] font-black text-white">
          Profile picture updated!
        </h3>
        <p className="mb-6 max-w-[20rem] text-[0.82rem] leading-relaxed text-white/50">
          Your new photo is live across your dashboard.
        </p>

        <Button variant="primary" size="md" className="w-full" onClick={onClose}>
          Nice
        </Button>
      </div>
    </Modal>
  );
}

// No rounded corners/border of its own — renders full-bleed directly on
// the page (more/page.tsx no longer wraps this in its own bordered card).
// Settings' own rounded "shelf" overlaps this section's bottom edge.
export default function Profile() {
  // AppLayout only ever renders its children once the user is
  // authenticated, so `user` is guaranteed non-null here.
  const { user, updateAvatar } = useAuth();
  const { books } = useMyBooks();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [amountHidden, setAmountHidden] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = user!.first_name.trim().charAt(0).toUpperCase() || "V";
  const totalEarnings = books.reduce((sum, b) => sum + Number(b.earned), 0);

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets picking the same file again re-trigger onChange
    if (!file) return;
    setPendingImageSrc(URL.createObjectURL(file));
  };

  const closeCropModal = () => {
    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingImageSrc(null);
  };

  const handleCropSave = async (blob: Blob) => {
    try {
      await updateAvatar(blob);
      setAvatarFailed(false);
      closeCropModal();
      setShowSuccess(true);
    } catch (err) {
      // apiFetch already fires an error snackbar for ApiError — only the
      // network-level case needs a fallback here.
      if (!(err instanceof ApiError)) {
        notify("Could not update your profile picture. Please try again.", "error");
      }
    }
  };

  return (
    <div
      className="relative px-5 pb-12 pt-5"
      style={{
        background:
          "radial-gradient(120% 70% at 15% 0%, rgba(var(--vp-accent-rgb),0.32), transparent 55%), radial-gradient(90% 60% at 100% 0%, rgba(var(--vp-accent-rgb),0.14), transparent 60%), linear-gradient(180deg, #232a4d 0%, #171d38 60%, #12172c 100%)",
      }}
    >
      {/* Edit Profile — same solid-accent pill treatment as the Earn
          page's Withdraw button (EarningsHero in earn/page.tsx). The
          positioning lives on this wrapper, not the Button itself —
          .btn-base sets its own `position: relative`, which wins the
          cascade over an `absolute` class on the same element and
          silently drops the button back into normal flow. */}
      <div className="absolute right-3 top-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setEditProfileOpen(true)}
          className="shrink-0 items-center gap-1 whitespace-nowrap px-4 py-2 text-[0.78rem] font-bold"
          style={{
            minHeight: "1.85rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "var(--r-sm)",
          }}
        >
          <Pencil size={13} strokeWidth={2.5} />
          Edit Profile
        </Button>
      </div>

      {/* Avatar top-left, name + email beside it, vertically centered
          like the reference */}
      <div className="flex items-center gap-4 pr-2">
        <div className="relative shrink-0">
          {user!.avatar && !avatarFailed ? (
            <Image
              src={user!.avatar}
              alt={user!.first_name}
              width={112}
              height={112}
              unoptimized
              className="h-[112px] w-[112px] rounded-full border-[3px] object-cover"
              style={{ borderColor: "rgba(var(--vp-accent-rgb),0.5)" }}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div
              className="flex h-[112px] w-[112px] items-center justify-center rounded-full border-[3px] text-3xl font-black text-white"
              style={{
                borderColor: "rgba(var(--vp-accent-rgb),0.5)",
                background: "linear-gradient(145deg, #3a4763, #232e47)",
              }}
            >
              {initial}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change profile picture"
            className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform active:scale-90"
            style={{
              background: "rgb(var(--vp-accent-rgb))",
              borderColor: "#171d38",
            }}
          >
            <Camera size={14} strokeWidth={2.25} color="#171100" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        {/* mt-8 nudges the text block below the Edit Profile pill's row so
            the name lines up with the avatar's visual center, as in the
            reference */}
        <div className="mt-8 min-w-0 flex-1">
          {/* MarqueeName instead of truncate — a long name shouldn't just
              get clipped with an ellipsis; it scrolls into view instead,
              same treatment as the email line right below it. Only
              actually animates when the text doesn't fit — a short name
              renders completely statically. -mb-1 is the same fix as
              Title.tsx: leading-none still reserves a bit of space below
              the glyphs at this font-telegraf size, which read as a
              bigger name-to-email gap than intended. */}
          <MarqueeName
            text={user!.first_name}
            className="-mb-2"
            fadeColor="#232a4d"
            textClassName="font-telegraf text-[2rem] font-black leading-none text-white md:text-4xl"
          />
          <MarqueeName
            text={user!.email}
            fadeColor="#232a4d"
            textClassName="text-[0.68rem] text-white/50"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2.5">
        <StatTile
          icon={<TrendingUp size={15} strokeWidth={1.8} />}
          label="Total earnings"
          value={`₦${totalEarnings.toLocaleString()}`}
          valueColor="#4ade80"
          maskable
          hidden={amountHidden}
          onToggleHidden={() => setAmountHidden((v) => !v)}
        />
        <StatTile
          icon={<Landmark size={15} strokeWidth={1.8} />}
          label="Virtual account"
          value="Get NUBAN"
          badge="New"
        />
      </div>

      <AvatarCropModal
        open={pendingImageSrc !== null}
        imageSrc={pendingImageSrc}
        onClose={closeCropModal}
        onSave={handleCropSave}
      />

      <AvatarUpdatedModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <EditProfileModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </div>
  );
}
