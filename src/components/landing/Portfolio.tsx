"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/buttons/buttons";

const featuredVideo = {
  title: "Financial Personality",
  youtubeId: "dpboulvVB38",
  thumbnail: "/images/covers/financial-personality.png",
};

const portfolio = [
  {
    title: "A 10-Day Hack for Busy Moms",
    category: "Faith / Inspiration",
    cover: "/images/covers/10-day-hack.jpg",
  },
  {
    title: "Letters to My Child",
    category: "Leadership",
    cover: "/images/covers/letters-to-my-child.png",
  },
  {
    title: "Beyond The Struggle",
    category: "Personal Growth",
    cover: "/images/covers/beyond-the-struggle.png",
  },
  {
    title: "Woman of Vision",
    category: "Business",
    cover: "/images/covers/woman-of-vision.jpg",
  },
  {
    title: "The Man The Family Needs",
    category: "Leadership",
    cover: "/images/covers/the-man-the-family-needs.jpg",
  },
  {
    title: "Whole Again",
    category: "Memoir / Reflection",
    cover: "/images/covers/whole-again.png",
  },
];

export default function Portfolio() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLDivElement | null>(null);

  // Two identical sets are enough for a seamless CSS marquee.
  const shelfBooks = [...portfolio, ...portfolio];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVideoLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="portfolio" className="section-dark px-4 py-16 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Our portfolio</p>

          <h2 className="display-heading section-heading mx-auto text-white">
            Books We&apos;ve <br />
            <span className="text-[#fbbf24]">Brought to Life</span>
          </h2>
        </div>

        <div className="portfolio-showcase mt-12">
          <div className="portfolio-video-card">
            <div className="mb-5">
              <h3 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
                {featuredVideo.title}
              </h3>
            </div>

            <div ref={videoRef} className="portfolio-video-frame">
              {isVideoLoaded ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${featuredVideo.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${featuredVideo.youtubeId}&playsinline=1&rel=0&modestbranding=1`}
                  title={featuredVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full rounded-[1.15rem]"
                />
              ) : (
                <div className="relative h-full w-full">
                  <Image
                    src={featuredVideo.thumbnail}
                    alt={featuredVideo.title}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="rounded-[1.15rem] object-cover"
                  />

                  <div className="absolute inset-0 grid place-items-center rounded-[1.15rem] bg-black/50">
                    <div className="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_0_50px_rgba(239,199,0,0.24)] backdrop-blur-xl">
                      ▶
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="vp-portfolio-books-panel">
            <div className="vp-portfolio-books-heading">
              <p>Featured</p>
              <span>Auto-scrolls · Swipe sideways</span>
            </div>

            <div className="vp-portfolio-marquee-shell">
              <div className="vp-portfolio-marquee-viewport">
                <div className="vp-portfolio-marquee-track">
                  {shelfBooks.map((book, index) => (
                    <article
                      key={`${book.title}-${index}`}
                      className="vp-portfolio-book-item"
                    >
                      <div
                        className={`vp-portfolio-book-card vp-portfolio-book-card-${
                          (index % 6) + 1
                        }`}
                      >
                        <div className="vp-portfolio-book-shine" />

                        <Image
                          src={book.cover}
                          alt={`${book.title} book cover`}
                          fill
                          sizes="(max-width: 767px) 160px, 220px"
                          className="vp-portfolio-book-cover"
                        />

                        <div className="vp-portfolio-book-details">
                          <p>{book.category}</p>
                          <h4>{book.title}</h4>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="portfolio-mini-stat">
                <strong>2500+</strong>
                <span>Books</span>
              </div>

              <div className="portfolio-mini-stat">
                <strong>12+</strong>
                <span>Years</span>
              </div>

              <div className="portfolio-mini-stat">
                <strong>A—Z</strong>
                <span>End-to-End Support</span>
              </div>
            </div>

            <Button
              href="/getQuote"
              variant="primary"
              size="md"
              className="mt-6 w-full"
            >
              Get Estimate for Your Manuscript
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
