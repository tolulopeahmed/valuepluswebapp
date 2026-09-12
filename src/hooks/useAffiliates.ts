"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface MyAffiliate {
  id: string;
  book_id: string;
  book_title: string;
  book_slug: string;
  book_cover: string | null;
  code: string;
  commission_percentage: string;
  is_active: boolean;
  orders_referred: number;
  units_sold: number;
  revenue_generated: string;
  earnings: string;
  pending_commission: string;
  available_commission: string;
  paid_commission: string;
  reversed_commission: string;
  share_url: string;
}

export function useAffiliates() {
  const [affiliates, setAffiliates] = useState<MyAffiliate[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setAffiliates(await apiFetch<MyAffiliate[]>("/storefront/affiliates/mine/"));
    } catch {
      setAffiliates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);
  return { affiliates, loading, refetch };
}
