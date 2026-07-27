// Referred users' WhatsApp numbers come from free-text form fields (the
// Get a Quote form doesn't validate/normalize phone format), so this
// normalizes whatever shape a real person typed — "08011112222",
// "+234 801 111 2222", "234-801-111-2222", ... — into the digits-only,
// country-code-prefixed form wa.me deep links require.
export function toWhatsAppLink(rawNumber: string, message?: string): string {
  const digits = rawNumber.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountryCode}${query}`;
}
