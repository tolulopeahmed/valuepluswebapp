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

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  source: "book_sale" | "referral" | "withdrawal";
  title: string;
  amount: string;
  status: "confirmed" | "pending" | "failed";
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

export interface ReferralSummary {
  code: string;
  count: number;
  total_earned: string;
  pending_amount: string;
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
