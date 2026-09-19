// The short form of a distributor's link — valuepluspublishing.com/go/<code>
// — vs. the full /book/<slug>?affiliate=<code> it stands in for. Resolved
// server-side so the redirect happens before any HTML ships, and the
// distributor can share/paste the short form without it ever going stale
// (a book's slug can change; the code can't).
import { notFound, redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export default async function AffiliateShortLinkPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const res = await fetch(`${API_BASE_URL}/storefront/affiliates/${encodeURIComponent(code)}/redirect/`, {
    cache: "no-store",
  });
  if (!res.ok) notFound();

  const { book_slug } = (await res.json()) as { book_slug: string };
  redirect(`/book/${book_slug}?affiliate=${encodeURIComponent(code)}`);
}
