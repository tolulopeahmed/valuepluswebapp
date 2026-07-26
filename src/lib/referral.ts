// A referrer shares a link like https://valuepluspublishing.com/getQuote?ref=someone@example.com
// (or the homepage, or /login) — whichever page the visitor actually
// lands on first, this captures their referrer's email once and
// stashes it so it's still there once they reach an actual signup
// form, even if that's a different page/navigation later in the same
// session. Email, not a separate generated code, is the referral
// identifier — it's already unique per account.
const STORAGE_KEY = "vp_referrer_email";

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const email = new URLSearchParams(window.location.search).get("ref");
  if (email && email.trim()) {
    window.localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
  }
}

export function getStoredReferrerEmail(): string {
  if (typeof window === "undefined") return "";

  // Checked directly (not just left to ReferralCapture's effect) because
  // this runs inside a signup/quote form's OWN lazy useState initializer,
  // during the very first render — before any sibling effect (including
  // ReferralCapture's) has had a chance to run. Landing straight on
  // e.g. /login?ref=EMAIL would otherwise read an empty localStorage.
  const fromUrl = new URLSearchParams(window.location.search).get("ref");
  if (fromUrl && fromUrl.trim()) {
    const normalized = fromUrl.trim().toLowerCase();
    window.localStorage.setItem(STORAGE_KEY, normalized);
    return normalized;
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

// Called once an email has actually been used on a successful signup, so
// a later, unrelated signup from the same browser doesn't get wrongly
// attributed to the same referrer.
export function clearStoredReferrerEmail() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
