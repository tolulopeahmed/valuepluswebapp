// Someone who clicks "Get Started" on the Learn Publishing pricing page
// lands on /login?mode=signup&intent=learner. This captures that intent
// once and stashes it so it's still there once auth actually completes
// (after the OTP step, a separate render/navigation from the one that
// read the URL), so their account can be tagged preferred_mode="learner"
// instead of defaulting to publisher.
const STORAGE_KEY = "vp_signup_intent";

export function getStoredLearnerIntent(): boolean {
  if (typeof window === "undefined") return false;

  // Checked directly (not left to an effect) for the same reason
  // referral.ts's getStoredReferrerEmail does: this runs inside the
  // login/signup form's own lazy useState initializer, during the very
  // first render.
  const fromUrl = new URLSearchParams(window.location.search).get("intent");
  if (fromUrl === "learner") {
    window.localStorage.setItem(STORAGE_KEY, "learner");
    return true;
  }

  return window.localStorage.getItem(STORAGE_KEY) === "learner";
}

// Called once the intent has actually been applied to the account after a
// successful signup/login, so a later, unrelated session on the same
// browser doesn't get wrongly tagged as a learner too.
export function clearStoredLearnerIntent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
