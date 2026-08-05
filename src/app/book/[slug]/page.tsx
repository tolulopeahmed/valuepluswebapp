// app/book/[slug]/page.tsx
//
// Public product page for a single title — the link a publisher shares
// with buyers (surfaced by the "Buy" button on the Publish page), same
// role as a Selar product page. The buy interaction itself (BuyBox) is
// a client island so this page can stay a Server Component for the
// SEO-relevant product data.

import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BuyBox from "@/components/storefront/BuyBox";
import ProductReviews from "@/components/storefront/ProductReviews";
import FormatBadge from "@/components/FormatBadge";
import BackButton from "@/components/storefront/BackButton";

// Real published-book shape from the Django backend (GET /books/public/
// <slug>/) — deliberately narrow (see PublicBookSerializer): no contact
// info, no sales/earnings, nothing that isn't meant for a stranger to see.
interface PublicBook {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  cover: string | null;
  paperback_price: string | null;
  hardback_price: string | null;
  ebook_price: string | null;
  has_paperback: boolean;
  has_hardback: boolean;
  has_ebook: boolean;
  description: string;
  author_name: string;
  average_rating: number | null;
  review_count: number;
}

async function fetchPublicBook(slug: string): Promise<PublicBook | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${baseUrl}/books/public/${slug}/`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PublicBook;
  } catch {
    return null;
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await fetchPublicBook(slug);

  if (!book) notFound();

  const paperbackPrice = book.paperback_price !== null ? Number(book.paperback_price) : null;
  const hardbackPrice = book.hardback_price !== null ? Number(book.hardback_price) : null;
  const ebookPrice = book.ebook_price !== null ? Number(book.ebook_price) : null;

  return (
    <main className="vp-product-page-bg min-h-screen overflow-x-hidden text-white">
      <div className="noise-layer" />

      <Navbar />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 md:pt-32">
        <BackButton className="mb-5" />

        <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-14">
          <div className="relative mx-auto aspect-[3/4.4] w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/30">
                No cover yet
              </div>
            )}
          </div>

          <div>
            <p className="eyebrow">{book.category}</p>

            <h1 className="display-heading mt-3 text-3xl font-black leading-tight text-white md:text-4xl">
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="mt-2 text-base text-white/60">{book.subtitle}</p>
            )}

            <p className="mt-2 text-sm text-white/50">
              By {book.author_name} · Published via ValuePlus
            </p>

            {(book.has_paperback || book.has_hardback || book.has_ebook) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {book.has_paperback && <FormatBadge format="Paperback" />}
                {book.has_hardback && <FormatBadge format="Hardback" />}
                {book.has_ebook && <FormatBadge format="Ebook" />}
              </div>
            )}

            {book.description && (
              <p className="mt-6 text-base leading-relaxed text-white/70">
                {book.description}
              </p>
            )}

            <div className="mt-8">
              <BuyBox
                bookId={book.id}
                slug={slug}
                paperbackPrice={paperbackPrice}
                hardbackPrice={hardbackPrice}
                ebookPrice={ebookPrice}
                hasPaperback={book.has_paperback}
                hasHardback={book.has_hardback}
                hasEbook={book.has_ebook}
              />

              <ProductReviews
                slug={slug}
                initialAverageRating={book.average_rating}
                initialReviewCount={book.review_count}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
