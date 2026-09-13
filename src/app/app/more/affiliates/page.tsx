"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, Users } from "lucide-react";
import Title from "@/components/Title";
import Subtitle from "@/components/Subtitle";
import { useAffiliates } from "@/hooks/useAffiliates";
import { fetchAffiliateProgram, type AffiliateProgram, useMyBooks } from "@/hooks/useMyBooks";
import { notify } from "@/lib/snackbar";

const naira = (value: string) => `₦${Number(value || 0).toLocaleString()}`;
const percentage = (value: string) => `${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;

export default function AffiliatesPage() {
  const { affiliates, loading } = useAffiliates();
  const { books, loading: booksLoading } = useMyBooks();
  const [tab, setTab] = useState<"programmes" | "promoting">("programmes");
  const [programmes, setProgrammes] = useState<Record<string, AffiliateProgram>>({});
  const [programmesLoading, setProgrammesLoading] = useState(true);

  useEffect(() => {
    if (booksLoading) return;
    let active = true;
    setProgrammesLoading(true);
    Promise.all(books.map(async (book) => [book.id, await fetchAffiliateProgram(book.id)] as const))
      .then((entries) => { if (active) setProgrammes(Object.fromEntries(entries)); })
      .catch(() => { if (active) notify("Could not load distributors.", "error"); })
      .finally(() => { if (active) setProgrammesLoading(false); });
    return () => { active = false; };
  }, [books, booksLoading]);

  const distributors = books.flatMap((book, bookIndex) =>
    (programmes[book.id]?.affiliates ?? []).map((distributor) => ({ book, bookIndex, distributor })),
  );
  const borderColors = ["#67b7ae", "#9b6ee8", "#f59e0b", "#ef6f91"];

  return (
    <div className="space-y-5">
      <div>
        <Title>Distributors</Title>
        <Subtitle>Manage your distributors and products you promote.</Subtitle>
      </div>
      <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
        <button
          type="button"
          onClick={() => setTab("programmes")}
          className={`rounded-xl px-3 py-3 text-sm font-black transition-colors ${tab === "programmes" ? "bg-[rgb(var(--vp-accent-rgb))] text-[#171100]" : "text-white/50"}`}
        >
          MY DISTRIBUTORS ({distributors.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("promoting")}
          className={`rounded-xl px-3 py-3 text-sm font-black transition-colors ${tab === "promoting" ? "bg-[rgb(var(--vp-accent-rgb))] text-[#171100]" : "text-white/50"}`}
        >
          PRODUCTS I PROMOTE ({affiliates.length})
        </button>
      </div>
      {tab === "programmes" &&
        (booksLoading || programmesLoading ? (
          <p className="py-5 text-center text-sm text-white/40">
            Loading your distributors…
          </p>
        ) : distributors.length === 0 ? (
          <p className="text-sm text-white/45">
            No distributors have joined your book programmes yet.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {distributors.map(({ book, bookIndex, distributor }) => {
              const firstName = distributor.name.trim().split(/\s+/)[0] || "Distributor";
              const borderColor = borderColors[bookIndex % borderColors.length];
              return (
                <article key={distributor.id} className="flex items-center gap-3 rounded-2xl border-2 bg-white/[0.05] p-3" style={{ borderColor }}>
                  {distributor.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={distributor.avatar} alt="" className="h-16 w-16 shrink-0 rounded-2xl border-2 object-cover" style={{ borderColor }} />
                  ) : (
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 bg-white/5 text-xl font-black text-[rgb(var(--vp-accent-rgb))]" style={{ borderColor }}>{firstName.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-white/45"><strong className="text-sm text-white">{firstName}</strong> · {distributor.email}</p>
                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-xs font-bold text-white/70">{book.title}</p>
                      <span className="shrink-0 text-[0.68rem] font-black text-[rgb(var(--vp-accent-rgb))]">{percentage(distributor.commission_percentage)} per sale</span>
                    </div>
                    <p className="mt-1.5 text-[0.68rem] text-white/50">{distributor.orders_referred} orders · {distributor.units_sold} units · {naira(distributor.revenue_generated)} sales</p>
                  </div>
                  <strong className="shrink-0 text-sm text-green-300">{naira(distributor.earnings)}</strong>
                </article>
              );
            })}
          </div>
        ))}
      {tab === "promoting" &&
        (loading ? (
          <p className="py-10 text-center text-sm text-white/40">
            Loading your affiliate books…
          </p>
        ) : affiliates.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <Users className="mx-auto mb-3 text-white/35" />
            <p className="font-bold text-white">No distributor products yet</p>
            <p className="mt-1 text-sm text-white/45">
              Opt in as a distributor when purchasing an eligible book.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {affiliates.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-black text-white">
                      {item.book_title}
                    </h2>
                    <p className="mt-1 text-xs font-bold text-[rgb(var(--vp-accent-rgb))]">
                      {percentage(item.commission_percentage)} commission
                    </p>
                  </div>
                  <span className="rounded-lg bg-green-500/15 px-2 py-1 text-xs font-black text-green-300">
                    {naira(item.earnings)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-white/50">
                  {item.orders_referred} orders · {item.units_sold} units ·{" "}
                  {naira(item.revenue_generated)} sales
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[0.68rem]">
                  <span className="rounded-lg bg-amber-500/10 p-2 text-amber-200">
                    Pending{" "}
                    <strong className="block">
                      {naira(item.pending_commission)}
                    </strong>
                  </span>
                  <span className="rounded-lg bg-green-500/10 p-2 text-green-300">
                    Available{" "}
                    <strong className="block">
                      {naira(item.available_commission)}
                    </strong>
                  </span>
                  <span className="rounded-lg bg-white/5 p-2 text-white/50">
                    Paid{" "}
                    <strong className="block">
                      {naira(item.paid_commission)}
                    </strong>
                  </span>
                  <span className="rounded-lg bg-red-500/10 p-2 text-red-300">
                    Reversed{" "}
                    <strong className="block">
                      {naira(item.reversed_commission)}
                    </strong>
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(item.share_url)
                        .then(() =>
                          notify("Distributor link copied!", "success"),
                        )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--vp-accent-rgb))] px-3 py-2 text-xs font-black text-[#171100]"
                  >
                    <Copy size={14} />
                    Copy link
                  </button>
                  <a
                    href={item.share_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${item.book_title}`}
                    className="grid w-10 place-items-center rounded-xl border border-white/10 text-white/60"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ))}
    </div>
  );
}
