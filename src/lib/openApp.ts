// Attempts to open the ValuePlus mobile app via its custom URL scheme
// (see mobile/app.json's "scheme": "valueplus" — no Universal Links/App
// Links configured yet, so this is the one deep-link mechanism that
// exists today). If the app is installed, the OS switches away from
// this page immediately and the fallback timer below never fires (its
// setTimeout is cleared by the page going to the background). If it
// isn't installed, nothing happens and the timer fires, sending the
// visitor to /download — the existing app-store-detection page — same
// "use My Books as the reliable fallback" approach the brief allows
// instead of building real deferred deep linking for this first release.
//
// No reference/book id is threaded through the scheme URL on purpose:
// once inside the app, signing in with the same email used at checkout
// surfaces the purchase automatically (see ClaimPurchasesView server-
// side, called on every login) — carrying state through a fresh
// install would need deferred deep linking, which this intentionally
// skips for v1.
export function openValuePlusApp() {
  const fallbackTimer = window.setTimeout(() => {
    window.location.href = "/download";
  }, 1500);

  const clearFallback = () => {
    window.clearTimeout(fallbackTimer);
    document.removeEventListener("visibilitychange", clearFallback);
  };
  document.addEventListener("visibilitychange", clearFallback);

  window.location.href = "valueplus://";
}
