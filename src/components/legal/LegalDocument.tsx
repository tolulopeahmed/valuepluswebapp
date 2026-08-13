import type { ReactNode } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// Shared shell for the Privacy Policy and Terms of Service pages — same
// Navbar + dark vp-ink + Footer composition as the other public marketing
// pages (see src/app/pricing/page.tsx), just with a legal-document layout
// (centered hero band, "last updated" date, numbered sections) instead of
// marketing content. Both documents share this exact structure, so it's
// pulled out once rather than duplicated across two ~150-line page files.
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-y-3 border-b border-white/10 py-8 first:pt-0">
      <h2 className="text-sm font-black uppercase tracking-wide text-vp-accent">
        {heading}
      </h2>
      <div className="flex flex-col gap-y-3 text-sm leading-7 text-white/70">
        {children}
      </div>
    </div>
  );
}

export default function LegalDocument({
  title,
  tagline,
  lastUpdated,
  intro,
  children,
  contactNote,
}: {
  title: string;
  tagline: string;
  lastUpdated: string;
  intro: ReactNode;
  children: ReactNode;
  contactNote: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-vp-ink text-white">
      <div className="noise-layer" />
      <Navbar />

      <div className="pb-10 pt-28 md:pt-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-y-4 px-6 text-center">
          <h1 className="text-3xl font-black md:text-5xl">{title}</h1>
          <p className="text-sm text-white/50 md:text-base">{tagline}</p>
          <p className="text-xs uppercase tracking-wide text-white/35">
            Last updated {lastUpdated}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <p className="mb-10 text-sm leading-7 text-white/70">{intro}</p>
        <div className="flex flex-col">{children}</div>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-white/60">
          {contactNote}
        </div>
      </div>

      <Footer />
    </main>
  );
}
