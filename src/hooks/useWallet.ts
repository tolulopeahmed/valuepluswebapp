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

const LOCAL_BANK_ACCOUNTS_KEY = "vp_local_bank_accounts";

function readStoredAccounts(): StoredBankAccount[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_BANK_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredBankAccount[]) : [];
  } catch {
    return [];
  }
}

function sortByDefaultFirst(accounts: StoredBankAccount[]): StoredBankAccount[] {
  return [...accounts].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

// No create/delete/list bank-account endpoint exists yet (see
// MyBankAccountView — GET only, single account) — every account a user
// adds or removes via AddBankAccountModal/Bank Accounts is tracked here
// instead, in localStorage, so the Bank Accounts page, Settings' status
// chip, and Quick Actions all agree on it. A real user can add several
// accounts but only one is ever active/default at once — matches how a
// real payout destination would work once a backend exists.
export function useLocalBankAccounts() {
  const [accounts, setAccounts] = useState<StoredBankAccount[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccounts(readStoredAccounts());
    setHydrated(true);
  }, []);

  const persist = (next: StoredBankAccount[]) => {
    window.localStorage.setItem(LOCAL_BANK_ACCOUNTS_KEY, JSON.stringify(next));
    setAccounts(next);
  };

  const addAccount = (account: LinkedBankAccount) => {
    const rest = accounts.map((a) => ({ ...a, isDefault: false }));
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    persist([{ ...account, id, isDefault: true }, ...rest]);
  };

  const removeAccount = (id: string) => {
    const remaining = accounts.filter((a) => a.id !== id);
    const removedWasDefault = accounts.find((a) => a.id === id)?.isDefault;
    if (removedWasDefault && remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }
    persist(remaining);
  };

  const setDefault = (id: string) => {
    persist(accounts.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return {
    accounts: sortByDefaultFirst(accounts),
    hydrated,
    addAccount,
    removeAccount,
    setDefault,
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
  source: "book_sale" | "referral" | "withdrawal" | "quote_payment";
  title: string;
  amount: string;
  status: "confirmed" | "pending" | "failed";
  // No real payment gateway yet — true only for a pending quote_payment
  // debit, the frontend's cue to show the self-report "I've paid" action.
  can_confirm_payment: boolean;
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
