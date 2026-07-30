import { apiFetch, getTokens } from "@/lib/api";

// Pays out any remaining wallet balance to the user's linked bank
// account, then soft-deletes the account server-side (see
// server/apps/accounts/views.py's DeleteAccountView) — the account
// itself blacklists the refresh token as part of this call, since a
// follow-up call to /auth/logout/ would otherwise carry an access token
// for an already-deactivated user and get rejected before it could ever
// blacklist anything.
export function deleteMyAccount() {
  const { refresh } = getTokens();
  return apiFetch<{ detail: string }>("/auth/account/delete/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}
