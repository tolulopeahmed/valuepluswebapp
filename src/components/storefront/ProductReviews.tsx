"use client";

// Ratings & reviews for a single book — sits directly below BuyBox on
// the public product page, same "light card on dark page" treatment as
// BuyBox itself. Checkout is anonymous (no ValuePlus account required —
// see apps.storefront.models.Order's own docstring), so a review is
// gated on a matching PAID order for the email entered here, not on
// being logged in — a logged-in visitor's name/email is just convenient
// prefill (see the effect below), never required or auto-substituted.

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/buttons/buttons";
import { apiFetch, ApiError } from "@/lib/api";
import { notify } from "@/lib/snackbar";

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

interface ReviewsResponse {
  results: Review[];
  average_rating: number | null;
  count: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Read-only star display (average rating, or one review's own rating) —
// rendered filled up to the nearest whole star.
function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? "fill-[#EFC700] text-[#EFC700]" : "text-black/15"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

// Clickable star picker for the review form — hover previews the
// selection before it's actually chosen, same affordance every star-
// rating widget (Amazon, Google Play, App Store) uses.
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="p-0.5 transition-transform active:scale-90"
        >
          <Star
            size={24}
            className={n <= (hover || value) ? "fill-[#EFC700] text-[#EFC700]" : "text-black/20"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({
  slug,
  initialAverageRating,
  initialReviewCount,
}: {
  slug: string;
  initialAverageRating: number | null;
  initialReviewCount: number;
}) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [count, setCount] = useState(initialReviewCount);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // refreshReviews is only ever called from an event handler (see
  // handleSubmit below), never from an effect — the mount fetch just
  // below uses its own inline .then()/.catch() instead, matching the
  // fetchBookCoupon pattern elsewhere in this app; calling a named
  // async function from inside an effect trips the set-state-in-effect
  // lint rule even though nothing here actually runs synchronously.
  const refreshReviews = async () => {
    try {
      const data = await apiFetch<ReviewsResponse>(`/storefront/books/${slug}/reviews/`, {
        skipAuth: true,
      });
      setReviews(data.results);
      setAverageRating(data.average_rating);
      setCount(data.count);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    apiFetch<ReviewsResponse>(`/storefront/books/${slug}/reviews/`, { skipAuth: true })
      .then((data) => {
        setReviews(data.results);
        setAverageRating(data.average_rating);
        setCount(data.count);
      })
      .catch(() => setReviews([]));
  }, [slug]);

  // Already-logged-in visitors don't need to retype their own name/
  // email — prefill once per login, same "adjust state during render"
  // pattern (guarded so it only fires once per user) GetQuote.tsx uses
  // for its own contact fields, rather than an effect.
  const [prefilledForEmail, setPrefilledForEmail] = useState<string | null>(null);
  if (isAuthenticated && user && prefilledForEmail !== user.email) {
    setPrefilledForEmail(user.email);
    setReviewerName((current) => current || `${user.first_name} ${user.last_name}`.trim());
    setReviewerEmail((current) => current || user.email);
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      notify("Choose a star rating.", "error");
      return;
    }
    if (!reviewerName.trim() || !reviewerEmail.trim()) {
      notify("Please enter your name and email.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/storefront/books/${slug}/reviews/`, {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          reviewer_name: reviewerName.trim(),
          reviewer_email: reviewerEmail.trim(),
          rating,
          comment: comment.trim(),
        }),
      });
      setRating(0);
      setComment("");
      setShowForm(false);
      await refreshReviews();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        notify("Could not submit your review. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="mt-6 rounded-2xl border bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(239,199,0,0.12)]"
      style={{ borderColor: "rgba(239,199,0,0.28)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#14181f]">Ratings &amp; Reviews</h2>
          {count > 0 ? (
            <div className="mt-1 flex items-center gap-2">
              <StarRow value={averageRating ?? 0} />
              <span className="text-sm font-bold text-[#14181f]">{averageRating?.toFixed(1)}</span>
              <span className="text-sm text-black/40">
                ({count} review{count === 1 ? "" : "s"})
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-black/40">No reviews yet — be the first.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-transform active:scale-[0.97] ${
            showForm ? "bg-black/[0.05] text-black/60" : "text-[#171100]"
          }`}
          style={showForm ? undefined : { background: "rgb(var(--vp-accent-rgb))" }}
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-black/10 bg-black/[0.02] p-4">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-black/45">
              Your rating
            </p>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book (optional)"
            rows={3}
            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm text-[#14181f] outline-none placeholder:text-black/35"
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Your name *"
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm text-[#14181f] outline-none placeholder:text-black/35"
            />
            <input
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              placeholder="Email address *"
              type="email"
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm text-[#14181f] outline-none placeholder:text-black/35"
            />
          </div>

          <p className="text-xs leading-relaxed text-black/40">
            Anyone can leave a review — if this is the email you checked out with, yours will be
            marked as a Verified Purchase.
          </p>

          <Button variant="primary" size="md" onClick={handleSubmit} loading={submitting} className="mt-1 w-full">
            Submit Review
          </Button>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4">
        {reviews === null ? (
          <p className="text-sm text-black/40">Loading reviews…</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-t border-black/5 pt-4 first:border-0 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StarRow value={review.rating} size={13} />
                  <span className="text-sm font-bold text-[#14181f]">{review.reviewer_name}</span>
                  {review.is_verified_purchase && (
                    <span className="rounded-full bg-[rgba(74,222,128,0.15)] px-2 py-0.5 text-[0.62rem] font-bold text-[#16a34a]">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-black/35">
                  {formatDate(review.created_at)}
                </span>
              </div>
              {review.comment && (
                <p className="mt-1.5 text-sm leading-relaxed text-black/70">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
