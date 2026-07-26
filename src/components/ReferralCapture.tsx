"use client";

import { useEffect } from "react";
import { captureReferralFromUrl } from "@/lib/referral";

// Mounted once in the root layout so a `?ref=` link works no matter
// which page it points at (homepage, /getQuote, /login, ...) — renders
// nothing, just captures the code into storage on first load.
export default function ReferralCapture() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  return null;
}
