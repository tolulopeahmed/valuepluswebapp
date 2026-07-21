// app/book/[slug]/page.tsx
//
// Public product page for a single title — the link a publisher shares
// with buyers (surfaced by the "Buy" button on the Publish page), same
// role as a Selar product page. No checkout system exists yet, so "Buy
// Now" opens a pre-filled WhatsApp chat, the same real transactional
// channel the rest of the public site already uses (Chat Admin, Get a
// Quote) ahead of a payment gateway.

import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { BOOKS, slugifyTitle } from "@/data/books";
import { USER } from "../../app/MockUser";

const ADMIN_WHATSAPP_NUMBER = "2349024312689";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = BOOKS.find((b) => slugifyTitle(b.title) === slug);

  if (!book) notFound();

  const buyMessage = `Hi, I'd like to buy "${book.title}" (₦${book.price.toLocaleString()}).`;
  const buyHref = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(buyMessage)}`;

  return (
    <main className="min-h-screen overflow-x-hidden bg-vp-ink text-white">
      <div className="noise-layer" />

      <Navbar />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 md:pt-32">
        <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-14">
          <div className="relative mx-auto aspect-[3/4.4] w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
              priority
            />
          </div>

          <div>
            <p className="eyebrow">{book.category}</p>

            <h1 className="display-heading mt-3 text-3xl font-black leading-tight text-white md:text-4xl">
              {book.title}
            </h1>

            <p className="mt-2 text-sm text-white/50">
              By {USER.firstName} · Published via ValuePlus
            </p>

            <p className="mt-6 text-base leading-relaxed text-white/70">
              {book.description}
            </p>

            <p className="mt-8 text-3xl font-black text-white">
              ₦{book.price.toLocaleString()}
            </p>

            <a
              href={buyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-base btn-primary btn-lg mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              Buy Now
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
