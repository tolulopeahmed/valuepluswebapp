"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.valuepluspublishing.app";
const APP_STORE_URL =
  "https://apps.apple.com/ng/app/valueplus-learn-publishing/id6801470780";

type Destination = {
  label: string;
  action: string;
  url: string;
};

function getDestination(): Destination {
  const userAgent = window.navigator.userAgent;

  if (/android/i.test(userAgent)) {
    return {
      label: "Google Play",
      action: "Open Google Play",
      url: PLAY_STORE_URL,
    };
  }

  // iPadOS can identify itself as Macintosh, but still includes "Mobile".
  if (/iphone|ipad|ipod/i.test(userAgent) || /macintosh.*mobile/i.test(userAgent)) {
    return {
      label: "the App Store",
      action: "Open App Store",
      url: APP_STORE_URL,
    };
  }

  return {
    label: "ValuePlus on the web",
    action: "Create your account",
    url: "/login?mode=signup",
  };
}

export default function DownloadPage() {
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    const nextDestination = getDestination();
    setDestination(nextDestination);

    const redirectTimer = window.setTimeout(() => {
      window.location.replace(nextDestination.url);
    }, 1800);

    return () => window.clearTimeout(redirectTimer);
  }, []);

  const fallbackUrl = destination?.url ?? "/login?mode=signup";

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#050711] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,145,64,0.18),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(29,155,240,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border border-[#ff9140]/15" />

      <section className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_rgba(255,145,64,0.15)] backdrop-blur-xl">
          <Image
            src="/images/logos/valueplus-mark.png"
            alt="ValuePlus"
            width={58}
            height={58}
            priority
            className="h-14 w-14 animate-pulse object-contain"
          />
        </div>

        <Image
          src="/images/logos/valueplus-logo-white2.png"
          alt="ValuePlus Publishing"
          width={190}
          height={56}
          priority
          className="mx-auto mt-7 h-auto w-44 object-contain"
        />

        <h1 className="mt-8 font-telegraf text-3xl font-black tracking-[-0.035em] sm:text-4xl">
          Your publishing journey starts here.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/55">
          {destination
            ? `Taking you to ${destination.label}…`
            : "Finding the best ValuePlus experience for your device…"}
        </p>

        <div className="mx-auto mt-7 h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[pulse_0.8s_ease-in-out_infinite] rounded-full bg-[#ff9140] shadow-[0_0_18px_rgba(255,145,64,0.7)]" />
        </div>

        <a
          href={fallbackUrl}
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff9140] px-7 text-sm font-black text-[#171100] shadow-[0_12px_36px_rgba(255,145,64,0.22)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {destination?.action ?? "Continue"}
        </a>
        <p className="mt-4 text-[0.7rem] text-white/30">
          Not redirected automatically? Use the button above.
        </p>
      </section>
    </main>
  );
}
