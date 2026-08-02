"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// bank-account/mine/ always 200s (null fields when nothing's linked) —
// see server/apps/wallet/views.py's MyBankAccountView docstring for why:
// apiFetch turns any non-2xx into an error toast, and "no bank account
// yet" is the normal state for a brand-new account, not an error.
export interface BankAccount {
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  is_verified: boolean;
}

export function useBankAccount() {
  const { isAuthenticated } = useAuth();
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setBankAccount(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<BankAccount>("/wallet/bank-account/mine/");
      setBankAccount(data);
    } catch {
      setBankAccount(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const isLinked = Boolean(bankAccount?.bank_name);

  return { bankAccount, isLinked, loading, refetch };
}

export interface LinkedBankAccount {
  bankName: string;
  // Paystack's own bank code (bankOptions[].code) — needed to create a
  // transfer recipient at withdrawal time.
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
}

export interface StoredBankAccount extends LinkedBankAccount {
  id: string;
  // Exactly one account is ever the default at a time — the one shown
  // first, with the green accent bar, and the one a payout would use.
  isDefault: boolean;
}

interface BankAccountApiRecord {
  id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_verified: boolean;
  is_default: boolean;
}

function fromApiRecord(record: BankAccountApiRecord): StoredBankAccount {
  return {
    id: record.id,
    bankName: record.bank_name,
    bankCode: record.bank_code,
    accountNumber: record.account_number,
    accountName: record.account_name,
    isVerified: record.is_verified,
    isDefault: record.is_default,
  };
}

function sortByDefaultFirst(accounts: StoredBankAccount[]): StoredBankAccount[] {
  return [...accounts].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

// Every bank account a user adds lives on the backend now, scoped
// strictly to their own account (GET/POST /wallet/bank-accounts/mine/,
// DELETE/set-default by id) — this used to be a single shared
// localStorage key with no per-user scoping at all, so logging out and
// into a different account on the same browser showed the PREVIOUS
// user's saved bank accounts. A real payout destination can never be
// browser-shared state, so this is the actual source of truth now.
// The old shared-across-every-account key this hook used to read/write —
// removed once, on mount, purely so stale cross-user bank data can't
// linger in a browser's storage or confuse anyone poking at devtools.
// Nothing reads from this key anymore; the backend is the only source
// of truth now.
const LEGACY_LOCAL_BANK_ACCOUNTS_KEY = "vp_local_bank_accounts";

export function useBankAccounts() {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<StoredBankAccount[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_LOCAL_BANK_ACCOUNTS_KEY);
    } catch {
      // localStorage can be unavailable (privacy mode, disabled) — the
      // key just won't exist to worry about in that case either.
    }
  }, []);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setAccounts([]);
      setHydrated(true);
      return;
    }
    try {
      const data = await apiFetch<BankAccountApiRecord[]>(
        "/wallet/bank-accounts/mine/",
      );
      setAccounts(data.map(fromApiRecord));
    } catch {
      setAccounts([]);
    } finally {
      setHydrated(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const addAccount = useCallback(
    async (account: LinkedBankAccount) => {
      await apiFetch<BankAccountApiRecord>("/wallet/bank-accounts/mine/", {
        method: "POST",
        body: JSON.stringify({
          bank_name: account.bankName,
          bank_code: account.bankCode ?? "",
          account_number: account.accountNumber,
          account_name: account.accountName,
        }),
      });
      await refetch();
    },
    [refetch],
  );

  const removeAccount = useCallback(
    async (id: string) => {
      await apiFetch(`/wallet/bank-accounts/${id}/`, { method: "DELETE" });
      await refetch();
    },
    [refetch],
  );

  const setDefault = useCallback(
    async (id: string) => {
      await apiFetch(`/wallet/bank-accounts/${id}/set-default/`, {
        method: "POST",
      });
      await refetch();
    },
    [refetch],
  );

  return {
    accounts: sortByDefaultFirst(accounts),
    hydrated,
    addAccount,
    removeAccount,
    setDefault,
    refetch,
  };
}

export interface ResolvedBankAccount {
  resolved: boolean;
  account_name: string | null;
}

// Always 200s (see ResolveBankAccountView's docstring) — a not-yet-valid
// account number is expected and frequent while the user is still typing,
// not something apiFetch's error toast should fire for.
export function resolveBankAccount(accountNumber: string, bankCode: string) {
  const params = new URLSearchParams({
    account_number: accountNumber,
    bank_code: bankCode,
  });
  return apiFetch<ResolvedBankAccount>(
    `/wallet/bank-account/resolve/?${params.toString()}`,
  );
}

export interface WalletTransaction {
  id: string;
  book_id: string | null;
  type: "credit" | "debit";
  source:
    | "book_sale"
    | "referral"
    | "withdrawal"
    | "quote_payment"
    | "reprint"
    | "transfer"
    | "deposit";
  title: string;
  amount: string;
  status: "confirmed" | "pending" | "failed";
  // No real payment gateway yet — true only for a pending quote_payment
  // or reprint debit, the frontend's cue to show the self-report "I've
  // paid" action.
  can_confirm_payment: boolean;
  // The real Wallet.balance this transaction moved from/to (see
  // apps.wallet.services.apply_to_wallet) — null for a QUOTE_PAYMENT/
  // REPRINT (never touches the wallet) or a still-pending withdrawal
  // (nothing's moved yet, only reserved).
  balance_before: string | null;
  balance_after: string | null;
  created_at: string;
}

export function useTransactions() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<WalletTransaction[]>(
        "/wallet/transactions/mine/",
      );
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { transactions, loading, refetch };
}

// The real, backend-computed balance — GET /wallet/mine/ returns
// Wallet.balance (see apps.wallet.models.Wallet / apply_to_wallet) minus
// whatever a still-pending withdrawal/transfer already has a hold on
// (apps.wallet.views._available_balance). This used to be recomputed
// client-side from the raw transaction list; now the backend is the one
// source of truth, so this and the actual submit-time check can never
// disagree.
export function useWalletBalance() {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<{ balance: string }>("/wallet/mine/");
      setBalance(Number(data.balance));
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { balance, loading, refetch };
}

export interface WithdrawalRequest {
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

// POST /wallet/withdrawals/initiate/ — `amount` is the total debited
// from the user's balance; the backend deducts Paystack's own transfer
// fee from it before the money moves, so the recipient gets less than
// `amount` (see apps.wallet.paystack.calculate_transfer_fee). Returns
// the created (pending) transaction.
export function requestWithdrawal(request: WithdrawalRequest) {
  return apiFetch<WalletTransaction>("/wallet/withdrawals/initiate/", {
    method: "POST",
    body: JSON.stringify({
      amount: request.amount,
      bank_name: request.bankName,
      bank_code: request.bankCode,
      account_number: request.accountNumber,
      account_name: request.accountName,
    }),
  });
}

// POST /wallet/deposits/initiate/ — "I've sent the payment" in the Add
// Funds modal. Creates a pending deposit transaction and emails admin a
// Django admin review link; the wallet is only actually credited once
// an admin approves it there (see server's TransactionAdmin.
// approve_deposit_requests) — never user self-confirmable, since that
// would let anyone credit their own wallet for free.
export function requestDeposit(amount: number) {
  return apiFetch<WalletTransaction>("/wallet/deposits/initiate/", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export interface LookedUpUser {
  found: boolean;
  full_name: string | null;
}

// Always 200s (see LookupUserByEmailView's docstring) — an incomplete or
// unmatched email is expected and frequent while the user is still
// typing, not something apiFetch's error toast should fire for.
export function lookupUserByEmail(email: string) {
  const params = new URLSearchParams({ email });
  return apiFetch<LookedUpUser>(`/wallet/lookup-user/?${params.toString()}`);
}

export interface TransferRequest {
  recipientEmail: string;
  amount: number;
}

// POST /wallet/transfer/ — a peer-to-peer wallet transfer by email
// instead of a bank withdrawal; resolved instantly (both sides confirmed
// server-side), no Paystack transfer/fee involved.
export function transferToUser(request: TransferRequest) {
  return apiFetch<WalletTransaction>("/wallet/transfer/", {
    method: "POST",
    body: JSON.stringify({
      recipient_email: request.recipientEmail,
      amount: request.amount,
    }),
  });
}

export interface ReferredUser {
  first_name: string;
  last_name: string;
  email: string;
  avatar: string | null;
}

export interface ReferralItem {
  id: string;
  referred_user: ReferredUser | null;
  whatsapp_number: string | null;
  amount_earned: string;
  status: "confirmed" | "pending";
  created_at: string;
}

export interface ReferralSummary {
  // The referral identifier IS the user's own email — already unique
  // per account, nothing separate generated/stored.
  email: string;
  count: number;
  total_earned: string;
  pending_amount: string;
  referrals: ReferralItem[];
}

export function useReferrals() {
  const { isAuthenticated } = useAuth();
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setReferrals(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<ReferralSummary>("/wallet/referrals/mine/");
      setReferrals(data);
    } catch {
      setReferrals(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { referrals, loading, refetch };
}
