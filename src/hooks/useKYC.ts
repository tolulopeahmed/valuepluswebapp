"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export type KYCStatus = "not_started" | "pending" | "approved" | "rejected";

export interface KYCProfile {
  status: KYCStatus;
  rejection_reason: string;
  reviewed_at: string | null;
  gender: string;
  relationship_status: string;
  employment_status: string;
  yearly_income: string;
  date_of_birth: string | null;
  address: string;
  mothers_maiden_name: string;
  state_of_residence: string;
  country_of_residence: string;
  identification_type: string;
  id_document: string | null;
  next_of_kin_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone: string;
}

export function useKYCProfile() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<KYCProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<KYCProfile>("/auth/kyc/mine/");
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { profile, loading, refetch };
}

export type KYCUpdatePayload = Partial<
  Omit<KYCProfile, "status" | "rejection_reason" | "reviewed_at" | "id_document">
> & {
  id_document?: Blob;
};

// Always sent as multipart — id_document (a file) may or may not be part
// of any given submit, so this is simpler than switching between a JSON
// and a FormData body depending on whether a new file was picked.
export function updateKYCProfile(payload: KYCUpdatePayload) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "id_document" && value instanceof Blob) {
      // A cropped ID photo arrives as a bare Blob (no filename) — a
      // picked PDF/File already carries its own real name, so only
      // fall back to a synthetic one when there isn't one already.
      const filename = value instanceof File ? value.name : "id-document.jpg";
      formData.append(key, value, filename);
    } else {
      formData.append(key, value as string);
    }
  }
  return apiFetch<KYCProfile>("/auth/kyc/mine/", {
    method: "PATCH",
    body: formData,
  });
}
