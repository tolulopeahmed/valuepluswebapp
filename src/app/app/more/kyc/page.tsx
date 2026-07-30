"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserRound,
  Heart,
  Building2,
  Banknote,
  Cake,
  Home,
  User,
  MapPin,
  Globe,
  IdCard,
  UserPlus,
  Users,
  Phone,
  ChevronDown,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import Title from "../../../../components/Title";
import Subtitle from "../../../../components/Subtitle";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/buttons/buttons";
import IDDocumentCropModal from "../../../../components/IDDocumentCropModal";
import { notify } from "../../../../lib/snackbar";
import { ApiError } from "../../../../lib/api";
import {
  useKYCProfile,
  updateKYCProfile,
  type KYCStatus,
} from "../../../../hooks/useKYC";
import {
  GENDER_OPTIONS,
  RELATIONSHIP_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  YEARLY_INCOME_OPTIONS,
  IDENTIFICATION_TYPE_OPTIONS,
  NEXT_OF_KIN_RELATIONSHIP_OPTIONS,
  NIGERIAN_STATES,
  COUNTRIES,
  type KYCOption,
} from "../../../../lib/kycOptions";

const STATUS_LABEL: Record<KYCStatus, string> = {
  not_started: "Not started",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<KYCStatus, string> = {
  not_started: "rgba(255,255,255,0.5)",
  pending: "rgb(var(--vp-accent-rgb))",
  approved: "#34D399",
  rejected: "#F87171",
};

const fieldWrapClass = "flex items-center gap-3";
const iconClass = "shrink-0 text-white/35";
const inputClass =
  "w-full rounded-xl border bg-white/5 px-3.5 py-[0.75rem] text-[0.82rem] uppercase tracking-wide text-white outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-white/30 focus:border-[rgba(var(--vp-accent-rgb),0.55)] focus:bg-white/[0.07]";

function KYCRow({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className={fieldWrapClass}>
      <Icon size={18} className={iconClass} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// Every field in this form is required — set as the default here rather
// than repeated at each of the ~14 call sites below.
function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      required
      {...props}
      className={inputClass}
      style={{ borderColor: "rgba(255,255,255,0.1)" }}
    />
  );
}

function SelectField({
  options,
  placeholder,
  ...props
}: {
  options: KYCOption[] | string[];
  placeholder: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        required
        {...props}
        className={`${inputClass} appearance-none pr-9`}
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <option value="" disabled hidden className="normal-case text-white/40">
          {placeholder}
        </option>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value} className="bg-[#12172c] normal-case text-white">
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
      />
    </div>
  );
}

// Shown once per visit when KYC is already approved, before the form —
// re-submitting can't be done silently since a genuine identity change
// (new ID, next of kin, etc.) is a real enough reason to still want the
// form, but tapping straight into "Update KYC" from Settings shouldn't
// look like nothing happened.
function AlreadyVerifiedModal({
  open,
  onUpdateAnyway,
  onGoBack,
}: {
  open: boolean;
  onUpdateAnyway: () => void;
  onGoBack: () => void;
}) {
  return (
    <Modal open={open} onClose={onGoBack}>
      <div className="flex flex-col items-center text-center">
        <span
          className="mb-4 grid h-14 w-14 place-items-center rounded-full border"
          style={{ borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.12)" }}
        >
          <ShieldCheck size={22} strokeWidth={1.8} style={{ color: "#34D399" }} />
        </span>

        <h3 className="mb-2 text-[1.05rem] font-black text-white">
          Your KYC is already verified
        </h3>
        <p className="mb-6 max-w-[20rem] text-[0.82rem] leading-relaxed text-white/50">
          You&apos;re all set — no need to redo this. You can still update
          details like your next of kin or address if something&apos;s
          changed.
        </p>

        <div className="flex w-full gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onGoBack}>
            Go back
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={onUpdateAnyway}>
            Update anyway
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function KYCPage() {
  const router = useRouter();
  const { profile, loading, refetch } = useKYCProfile();

  const [seeded, setSeeded] = useState(false);
  const [approvedGateDismissed, setApprovedGateDismissed] = useState(false);
  const [gender, setGender] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [yearlyIncome, setYearlyIncome] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [mothersMaidenName, setMothersMaidenName] = useState("");
  const [stateOfResidence, setStateOfResidence] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [identificationType, setIdentificationType] = useState("");
  // The file/blob that will actually upload, its display name (image or
  // PDF), and — only for images — an object URL to preview it. Cropping
  // happens between "file picked" and "file accepted": cropSrc holds the
  // picked image while IDDocumentCropModal is open; nothing here changes
  // until the user confirms the crop.
  const [idDocument, setIdDocument] = useState<Blob | null>(null);
  const [idDocumentName, setIdDocumentName] = useState<string | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(null);
  // Tapping the trash icon on the existing (already-uploaded) ID hides
  // it locally so the box goes back to the empty "Upload ID" state —
  // there's no delete-on-the-backend call for this, it's just "stop
  // showing what's already there until a new one is picked."
  const [existingCleared, setExistingCleared] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nextOfKinName, setNextOfKinName] = useState("");
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState("");
  const [nextOfKinPhone, setNextOfKinPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fills the form from the fetched profile exactly once — after that,
  // refetch() (called post-submit) shouldn't stomp on further edits.
  useEffect(() => {
    if (loading || !profile || seeded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGender(profile.gender);
    setRelationshipStatus(profile.relationship_status);
    setEmploymentStatus(profile.employment_status);
    setYearlyIncome(profile.yearly_income);
    setDateOfBirth(profile.date_of_birth ?? "");
    setAddress(profile.address);
    setMothersMaidenName(profile.mothers_maiden_name);
    setStateOfResidence(profile.state_of_residence);
    setCountryOfResidence(profile.country_of_residence);
    setIdentificationType(profile.identification_type);
    setNextOfKinName(profile.next_of_kin_name);
    setNextOfKinRelationship(profile.next_of_kin_relationship);
    setNextOfKinPhone(profile.next_of_kin_phone);
    setSeeded(true);
  }, [loading, profile, seeded]);

  const status = profile?.status ?? "not_started";

  // PDFs can't be cropped (no canvas to draw a document viewer onto) —
  // only an image goes through IDDocumentCropModal; a picked PDF is
  // accepted as-is.
  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;
    if (file.type.startsWith("image/")) {
      setCropSrc(URL.createObjectURL(file));
      return;
    }
    setIdDocument(file);
    setIdDocumentName(file.name);
    if (idDocumentPreview) URL.revokeObjectURL(idDocumentPreview);
    setIdDocumentPreview(null);
  };

  const handleCropSave = (blob: Blob) => {
    setIdDocument(blob);
    setIdDocumentName("Cropped photo");
    if (idDocumentPreview) URL.revokeObjectURL(idDocumentPreview);
    setIdDocumentPreview(URL.createObjectURL(blob));
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  // Trash icon (pre-approval): drop whatever's currently shown — a
  // pending pick or the existing uploaded one — back to the empty
  // "Upload ID" prompt. Replace icon (post-approval): skip straight to
  // the file picker instead, no clearing step.
  const handleClearDocument = () => {
    if (idDocumentPreview) URL.revokeObjectURL(idDocumentPreview);
    setIdDocument(null);
    setIdDocumentName(null);
    setIdDocumentPreview(null);
    setExistingCleared(true);
  };

  const handleReplaceClick = () => fileInputRef.current?.click();

  // Every field is required (the backend enforces this too — see
  // KYCUpdateSerializer) — checked here first so a missing field is a
  // clear, named error instead of a generic one from the network
  // round-trip. id_document alone also passes if one's already on file
  // and hasn't been cleared, matching the backend's own validate().
  const hasIdDocument = idDocument !== null || (!existingCleared && Boolean(profile?.id_document));
  const missingField =
    (!gender && "Gender") ||
    (!relationshipStatus && "Relationship status") ||
    (!employmentStatus && "Employment status") ||
    (!yearlyIncome && "Yearly income") ||
    (!dateOfBirth && "Date of birth") ||
    (!address && "Address") ||
    (!mothersMaidenName && "Mother's maiden name") ||
    (!stateOfResidence && "State of residence") ||
    (!countryOfResidence && "Country of residence") ||
    (!identificationType && "Identification type") ||
    (!hasIdDocument && "ID document") ||
    (!nextOfKinName && "Name of next of kin") ||
    (!nextOfKinRelationship && "Relationship with next of kin") ||
    (!nextOfKinPhone && "Next of kin's phone number") ||
    null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (missingField) {
      notify(`${missingField} is required.`, "error");
      return;
    }

    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      notify("Date of birth must be in YYYY-MM-DD format.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await updateKYCProfile({
        gender,
        relationship_status: relationshipStatus,
        employment_status: employmentStatus,
        yearly_income: yearlyIncome,
        date_of_birth: dateOfBirth || undefined,
        address,
        mothers_maiden_name: mothersMaidenName,
        state_of_residence: stateOfResidence,
        country_of_residence: countryOfResidence,
        identification_type: identificationType,
        id_document: idDocument ?? undefined,
        next_of_kin_name: nextOfKinName,
        next_of_kin_relationship: nextOfKinRelationship,
        next_of_kin_phone: nextOfKinPhone,
      });
      notify("KYC details submitted for review!", "success");
      if (idDocumentPreview) URL.revokeObjectURL(idDocumentPreview);
      setIdDocument(null);
      setIdDocumentName(null);
      setIdDocumentPreview(null);
      setExistingCleared(false);
      refetch();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not update your KYC details. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-6">
        <Title className="block">Update KYC</Title>
        <Subtitle>Update your details for added account security.</Subtitle>
      </div>

      <div
        className="vp-card-in mb-5 flex items-start gap-3 rounded-2xl border p-4"
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
          <ShieldCheck size={17} strokeWidth={1.9} />
        </span>
        <p className="text-[0.78rem] leading-relaxed text-white/60">
          KYC (Know Your Customer) checks, in line with CBN guidelines, help
          keep your account from being used — intentionally or not — for
          fraud or money laundering.
        </p>
      </div>

      <p className="vp-card-in mb-5 text-center text-[0.82rem] text-white/55">
        Status:{" "}
        <span className="font-black italic" style={{ color: STATUS_COLOR[status] }}>
          {STATUS_LABEL[status]}
        </span>
      </p>

      {profile?.status === "rejected" && profile.rejection_reason && (
        <div
          className="vp-card-in mb-5 rounded-2xl border p-4 text-[0.76rem] leading-relaxed text-white/70"
          style={{ borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)" }}
        >
          <span className="font-black text-[#F87171]">Why it was rejected: </span>
          {profile.rejection_reason}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/6 bg-white/3 px-4 py-8 text-center text-[0.78rem] text-white/40">
          Loading your KYC details…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <KYCRow icon={UserRound}>
            <SelectField
              placeholder="Select gender"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={Heart}>
            <SelectField
              placeholder="Relationship status"
              options={RELATIONSHIP_STATUS_OPTIONS}
              value={relationshipStatus}
              onChange={(e) => setRelationshipStatus(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={Building2}>
            <SelectField
              placeholder="Employment status"
              options={EMPLOYMENT_STATUS_OPTIONS}
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={Banknote}>
            <SelectField
              placeholder="Yearly income"
              options={YEARLY_INCOME_OPTIONS}
              value={yearlyIncome}
              onChange={(e) => setYearlyIncome(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={Cake}>
            <TextField
              placeholder="Date of birth (YYYY-MM-DD)"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              inputMode="numeric"
            />
          </KYCRow>

          <KYCRow icon={Home}>
            <TextField
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={User}>
            <TextField
              placeholder="Mother's maiden name"
              value={mothersMaidenName}
              onChange={(e) => setMothersMaidenName(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={MapPin}>
            <SelectField
              placeholder="State of residence"
              options={NIGERIAN_STATES}
              value={stateOfResidence}
              onChange={(e) => setStateOfResidence(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={Globe}>
            <SelectField
              placeholder="Country of residence"
              options={COUNTRIES}
              value={countryOfResidence}
              onChange={(e) => setCountryOfResidence(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={IdCard}>
            <SelectField
              placeholder="Identification type"
              options={IDENTIFICATION_TYPE_OPTIONS}
              value={identificationType}
              onChange={(e) => setIdentificationType(e.target.value)}
            />
          </KYCRow>

          {(() => {
            const showExisting = !idDocumentName && !existingCleared && profile?.id_document;
            const hasDocument = Boolean(idDocumentPreview || idDocumentName || showExisting);
            const isApproved = status === "approved";

            return (
              <div
                className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed"
                style={{
                  borderColor: "rgba(var(--vp-accent-rgb),0.5)",
                  background: hasDocument ? "transparent" : "rgba(var(--vp-accent-rgb),0.06)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files?.[0])}
                />

                {!hasDocument && (
                  <div className="flex h-44 items-center justify-center">
                    <button
                      type="button"
                      onClick={handleReplaceClick}
                      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-[0.8rem] font-bold text-white/80 transition-colors active:bg-white/15"
                    >
                      <Upload size={16} />
                      Upload ID
                    </button>
                  </div>
                )}

                {idDocumentPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={idDocumentPreview}
                    alt="ID document preview"
                    className="h-44 w-full object-cover"
                  />
                )}

                {!idDocumentPreview && showExisting && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile!.id_document!}
                    alt="Current ID on file"
                    className="h-44 w-full object-cover"
                  />
                )}

                {!idDocumentPreview && !showExisting && idDocumentName && (
                  <div className="flex h-44 items-center justify-center">
                    <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-[0.74rem] font-semibold text-white/80">
                      <FileText size={15} />
                      {idDocumentName}
                    </span>
                  </div>
                )}

                {hasDocument && (
                  <button
                    type="button"
                    onClick={isApproved ? handleReplaceClick : handleClearDocument}
                    aria-label={isApproved ? "Replace ID" : "Remove ID"}
                    title={isApproved ? "Replace ID" : "Remove ID"}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90"
                    style={
                      isApproved
                        ? { background: "rgb(var(--vp-accent-rgb))" }
                        : { background: "#F87171" }
                    }
                  >
                    {isApproved ? (
                      <RefreshCw size={16} color="#171100" />
                    ) : (
                      <Trash2 size={16} color="#2a0a0a" />
                    )}
                  </button>
                )}
              </div>
            );
          })()}

          <KYCRow icon={UserPlus}>
            <TextField
              placeholder="Name of next of kin"
              value={nextOfKinName}
              onChange={(e) => setNextOfKinName(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={Users}>
            <SelectField
              placeholder="Relationship with next of kin"
              options={NEXT_OF_KIN_RELATIONSHIP_OPTIONS}
              value={nextOfKinRelationship}
              onChange={(e) => setNextOfKinRelationship(e.target.value)}
            />
          </KYCRow>

          <KYCRow icon={Phone}>
            <TextField
              placeholder="Next of kin's phone number"
              value={nextOfKinPhone}
              onChange={(e) => setNextOfKinPhone(e.target.value)}
              inputMode="tel"
            />
          </KYCRow>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="mt-2 w-full"
            loading={submitting}
          >
            <ShieldCheck size={16} className="mr-1.5" />
            {submitting ? "Updating…" : "Update KYC"}
          </Button>
        </form>
      )}

      <AlreadyVerifiedModal
        open={!loading && status === "approved" && !approvedGateDismissed}
        onUpdateAnyway={() => setApprovedGateDismissed(true)}
        onGoBack={() => router.push("/app/more")}
      />

      <IDDocumentCropModal
        open={cropSrc !== null}
        imageSrc={cropSrc}
        onClose={handleCropCancel}
        onSave={handleCropSave}
      />
    </div>
  );
}
