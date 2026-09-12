"use client";

import { useState } from "react";
import { Copy, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import Title from "@/components/Title";
import Subtitle from "@/components/Subtitle";
import { useAffiliates } from "@/hooks/useAffiliates";
import { useMyBooks } from "@/hooks/useMyBooks";
import { notify } from "@/lib/snackbar";

const naira = (value: string) => `₦${Number(value || 0).toLocaleString()}`;

export default function AffiliatesPage() {
  const { affiliates, loading } = useAffiliates();
  const { books, loading: booksLoading } = useMyBooks();
  const [tab, setTab] = useState<"programmes" | "promoting">("programmes");

  return (
    <div className="space-y-5">
      <div>
        <Title>Distributors</Title>
        <Subtitle>Manage distributors for your books and products you promote.</Subtitle>
      </div>
      <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
        <button type="button" onClick={() => setTab("programmes")} className={`rounded-xl px-3 py-2.5 text-xs font-black transition-colors ${tab === "programmes" ? "bg-[rgb(var(--vp-accent-rgb))] text-[#171100]" : "text-white/50"}`}>My Programmes ({books.length})</button>
        <button type="button" onClick={() => setTab("promoting")} className={`rounded-xl px-3 py-2.5 text-xs font-black transition-colors ${tab === "promoting" ? "bg-[rgb(var(--vp-accent-rgb))] text-[#171100]" : "text-white/50"}`}>Products I Promote ({affiliates.length})</button>
      </div>
      {tab === "programmes" && (booksLoading ? (
        <p className="py-5 text-center text-sm text-white/40">Loading your books…</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-white/45">Publish a book to start an affiliate programme.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {books.map((book) => (
            <Link key={book.id} href={`/app/publish/book/${book.id}`} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition-colors hover:border-[rgb(var(--vp-accent-rgb))]/50">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 truncate font-black text-white">{book.title}</h2>
                <span className={`shrink-0 rounded-lg px-2 py-1 text-[0.65rem] font-black ${book.affiliate_enabled ? "bg-green-500/15 text-green-300" : "bg-white/10 text-white/40"}`}>{book.affiliate_enabled ? `${book.affiliate_percentage}% · ON` : "OFF"}</span>
              </div>
              <p className="mt-2 text-xs text-white/45">Open to view distributors or change the programme.</p>
            </Link>
          ))}
        </div>
      ))}
      {tab === "promoting" && (loading ? (
        <p className="py-10 text-center text-sm text-white/40">Loading your affiliate books…</p>
      ) : affiliates.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <Users className="mx-auto mb-3 text-white/35" />
          <p className="font-bold text-white">No distributor products yet</p>
          <p className="mt-1 text-sm text-white/45">Opt in as a distributor when purchasing an eligible book.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {affiliates.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-black text-white">{item.book_title}</h2>
                  <p className="mt-1 text-xs font-bold text-[rgb(var(--vp-accent-rgb))]">{item.commission_percentage}% commission</p>
                </div>
                <span className="rounded-lg bg-green-500/15 px-2 py-1 text-xs font-black text-green-300">{naira(item.earnings)}</span>
              </div>
              <p className="mt-3 text-xs text-white/50">{item.orders_referred} orders · {item.units_sold} units · {naira(item.revenue_generated)} sales</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[0.68rem]">
                <span className="rounded-lg bg-amber-500/10 p-2 text-amber-200">Pending <strong className="block">{naira(item.pending_commission)}</strong></span>
                <span className="rounded-lg bg-green-500/10 p-2 text-green-300">Available <strong className="block">{naira(item.available_commission)}</strong></span>
                <span className="rounded-lg bg-white/5 p-2 text-white/50">Paid <strong className="block">{naira(item.paid_commission)}</strong></span>
                <span className="rounded-lg bg-red-500/10 p-2 text-red-300">Reversed <strong className="block">{naira(item.reversed_commission)}</strong></span>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(item.share_url).then(() => notify("Distributor link copied!", "success"))} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--vp-accent-rgb))] px-3 py-2 text-xs font-black text-[#171100]"><Copy size={14} />Copy link</button>
                <a href={item.share_url} target="_blank" rel="noreferrer" aria-label={`Open ${item.book_title}`} className="grid w-10 place-items-center rounded-xl border border-white/10 text-white/60"><ExternalLink size={15} /></a>
              </div>
            </article>
          ))}
        </div>
      ))}
    </div>
  );
}
