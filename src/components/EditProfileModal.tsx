"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/snackbar";
import Button from "./buttons/buttons";
import Modal from "./Modal";

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

export default function EditProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Re-sync the editable copy from the real profile every time the modal
  // opens — the fields live in local state (so typing doesn't PATCH on
  // every keystroke), but that means a stale edit from a previous open
  // (or a cancel) would otherwise still be sitting there next time.
  useEffect(() => {
    if (!open || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setPhoneNumber(user.phone_number ?? "");
  }, [open, user]);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim(),
      });
      notify("Profile updated!", "success");
      onClose();
    } catch (err) {
      // apiFetch already fires an error snackbar for ApiError (including
      // field-level validation messages, e.g. an invalid phone number) —
      // only the network-level case needs a fallback here.
      if (!(err instanceof ApiError)) {
        notify("Could not update your profile. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-5 text-[1.05rem] font-black text-white">Edit Profile</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          required
        />
        <Field
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          required
        />
        <Field
          label="Phone number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g. 08012345678"
          autoComplete="tel"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="mt-2 w-full"
          loading={submitting}
        >
          {submitting ? "Updating…" : "Update Profile"}
        </Button>
      </form>
    </Modal>
  );
}
