"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Real book shape from the Django backend (GET /books/mine/) — separate
// from the demo `Book` type in src/data/books.ts, which backs the public
// marketing storefront page and stays on static mock content. Several
// fields are nullable here (a `pending` book created straight from a
// quote request has no cover/price/format/pages yet) where the mock
// type's fields are all non-optional.
export interface MyBook {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  slug: string;
  cover: string | null;
  status: "pending" | "draft" | "in_progress" | "published";
  format: "Paperback" | "Ebook" | "Hardback" | "";
  pages: number | null;
  sales: number;
  earned: string;
  date_published: string | null;
  price: string | null;
  description: string;
  created_at: string;
}

export const MY_BOOK_STATUS_LABEL: Record<MyBook["status"], string> = {
  pending: "Pending",
  draft: "Draft",
  in_progress: "In Progress",
  published: "Published",
};

export const MY_BOOK_STATUS_BADGE_CLASS: Record<MyBook["status"], string> = {
  pending: "bg-[rgba(96,200,255,0.15)] text-[#60c8ff] border border-[rgba(96,200,255,0.4)]",
  draft: "bg-[#3a3f52] text-white border border-white/25",
  in_progress:
    "bg-[rgb(var(--vp-accent-rgb))] text-[#171100] border border-[rgba(255,255,255,0.35)]",
  published: "bg-[#123524] text-[#4ade80] border border-[rgba(74,222,128,0.6)]",
};

export function useMyBooks() {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<MyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<MyBook[]>("/books/mine/");
      setBooks(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your books.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fetching on mount/auth-change is the "synchronize with an external
    // system" case useEffect exists for. refetch()'s loading/error resets
    // do run synchronously before its first await (that's what this rule
    // flags), which is the standard, safe shape for a fetch-on-mount hook
    // — restructuring it away would only make this harder to follow.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { books, loading, error, refetch };
}
