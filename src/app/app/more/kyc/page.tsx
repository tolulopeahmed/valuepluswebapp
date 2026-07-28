"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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
  type LucideIcon,
} from "lucide-react";
import Title from "../../../../components/Title";
import Subtitle from "../../../../components/Subtitle";
import Button from "../../../../components/buttons/buttons";
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

function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
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

export default function KYCPage() {
  const { profile, loading, refetch } = useKYCProfile();

  const [seeded, setSeeded] = useState(false);
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
  const [idDocument, setIdDocument] = useState<File | null>(null);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
      setIdDocument(null);
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

          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors active:bg-white/[0.03]"
            style={{ borderColor: "rgba(var(--vp-accent-rgb),0.35)" }}
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
            />
            <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[0.78rem] font-bold text-white/70">
              <Upload size={15} />
              Upload ID
            </span>
            <p className="max-w-[16rem] text-[0.68rem] leading-relaxed text-white/40">
              {idDocument
                ? idDocument.name
                : profile?.id_document
                  ? "ID already uploaded — choose a file to replace it."
                  : "JPG, PNG or PDF"}
            </p>
          </label>

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
    </div>
  );
}
