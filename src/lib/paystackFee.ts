// Mirrors apps.wallet.paystack.calculate_transfer_fee on the backend —
// keep both in sync. This is a client-side estimate shown while the user
// types; the backend recomputes it authoritatively when the withdrawal
// is actually submitted, so a mismatch here only ever affects the
// preview, never what's actually charged.

// Paystack's own NGN transfer pricing (paystack.com/pricing) — tiered by
// the transferred amount, not a percentage.
const TRANSFER_FEE_TIERS: [ceiling: number, fee: number][] = [
  [5000, 10],
  [50000, 25],
];
const TRANSFER_FEE_ABOVE_TOP_TIER = 50;

// CBN-mandated stamp duty on electronic transfers of ₦10,000 or more,
// charged by Paystack on top of its own transfer fee.
const STAMP_DUTY_THRESHOLD = 10000;
const STAMP_DUTY_AMOUNT = 50;

export const MINIMUM_WITHDRAWAL_AMOUNT = 500;

export function calculateTransferFee(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  let fee = TRANSFER_FEE_ABOVE_TOP_TIER;
  for (const [ceiling, tierFee] of TRANSFER_FEE_TIERS) {
    if (amount <= ceiling) {
      fee = tierFee;
      break;
    }
  }

  if (amount >= STAMP_DUTY_THRESHOLD) fee += STAMP_DUTY_AMOUNT;

  return fee;
}
