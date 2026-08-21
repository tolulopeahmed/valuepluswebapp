"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="white"
        d="M16.02 4C9.4 4 4 9.33 4 15.9c0 2.1.56 4.15 1.62 5.95L4 28l6.32-1.58A12.17 12.17 0 0 0 16.02 28C22.65 28 28 22.67 28 16.1 28 9.53 22.65 4 16.02 4Zm0 21.86c-1.78 0-3.52-.47-5.03-1.36l-.36-.21-3.75.94 1-3.62-.24-.38a9.86 9.86 0 0 1-1.5-5.23c0-5.38 4.43-9.76 9.88-9.76 5.45 0 9.88 4.38 9.88 9.76s-4.43 9.86-9.88 9.86Z"
      />
      <path
        fill="white"
        d="M21.42 18.55c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.09 3.17 5.07 4.45.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
      />
    </svg>
  );
}

export default function Footer() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    let ticking = false;

    const checkScrollPosition = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      const distanceFromBottom = pageHeight - (scrollTop + windowHeight);
      const isNearBottom = distanceFromBottom < 720;

      setShowWhatsApp(isNearBottom);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScrollPosition);
        ticking = true;
      }
    };

    checkScrollPosition();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  return (
    <footer className="border-t border-white/10 bg-[#050810]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/images/logos/valueplus-logo-white2.png"
            alt="ValuePlus"
            width={150}
            height={45}
            className="h-9 w-auto object-contain"
          />

          <p className="mt-4 max-w-xs text-sm leading-7 text-white/45">
            Nigeria&apos;s publishing academy and platform — for African
            storytellers and the next generation of publishing professionals.
          </p>

          <p className="mt-5 text-xs italic text-vp-accent">
            ...express yourself more excellently
          </p>
        </div>

        <div>
          <h4 className="footer-col-heading">Learn Publishing</h4>

          <ul className="footer-links">
            <li>
              <a href="#academy">About the Course</a>
            </li>
            <li>
              <a href="#academy">The 6 Modules</a>
            </li>
            <li>
              <a href="/pricing">Enrol Now</a>
            </li>
            <li>
              <a href="/pricing">Intern Track</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer-col-heading">Manage Your Books</h4>

          <ul className="footer-links">
            <li>
              <a href="#portfolio">Portfolio</a>
            </li>
            <li>
              <a href="/getQuote">Get a Quote</a>
            </li>
            <li>
              <a href="/getQuote">Book Editing</a>
            </li>
            <li>
              <a href="#academy">KDP Setup</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer-col-heading">Contact</h4>

          <ul className="footer-links">
            <li>
              <a href="tel:+2349024312689">+234 902 431 2689</a>
            </li>
            <li>
              <a href="mailto:valuepluspublishing@gmail.com">
                valuepluspublishing@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/2349024312689"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-white/10 px-6 py-5 text-center text-xs text-white/30 sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} ValuePlus Media Limited. All Rights
          Reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:text-white/60">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white/60">
            Terms of Service
          </Link>
        </div>
      </div>

      <a
        href="https://wa.me/2349024312689"
        target="_blank"
        rel="noopener noreferrer"
        className={`whatsapp-admin-fab ${
          showWhatsApp ? "whatsapp-admin-fab-visible" : ""
        }`}
        aria-label="Chat with ValuePlus admin on WhatsApp"
      >
        <span className="whatsapp-admin-icon">
          <WhatsAppIcon />
        </span>

        <span className="whatsapp-admin-label">WhatsApp Admin</span>
      </a>
    </footer>
  );
}
