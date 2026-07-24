"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/buttons/buttons";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

const inputBase =
  "w-full min-h-[2.9rem] rounded-[0.8rem] border border-white/[0.09] bg-white/[0.055] px-[0.9rem] py-[0.75rem] text-white text-[0.88rem] outline-none placeholder:text-white/30 transition-all duration-150 focus:border-[rgba(239,199,0,0.55)] focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(239,199,0,0.09)]";

function CompleteRegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({
        email,
        code,
        password,
        password_confirm: confirmPassword,
      });
      router.push("/app");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setResending(true);
    try {
      await resendVerification(email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main
      className="flex min-h-[100svh] flex-col items-center justify-center px-4 pb-10 pt-20"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgba(29,155,240,.13), transparent 32%), radial-gradient(circle at 84% 16%, rgba(239,199,0,.11), transparent 30%), linear-gradient(145deg, #070b12 0%, #0d1420 52%, #080711 100%)",
      }}
    >
      <div
        className="relative z-10 w-full max-w-[26rem] rounded-[1.55rem] border border-white/[0.11] px-6 pb-6 pt-7 shadow-[0_40px_110px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,.072), rgba(255,255,255,.025)), #0a0f1a",
        }}
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Image
              src="/images/logos/valueplus-logo-white2.png"
              alt="ValuePlus"
              width={145}
              height={42}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <h1 className="mb-2 text-center font-['PP_Telegraf'] text-[clamp(1.55rem,5.5vw,1.9rem)] font-black leading-none tracking-[-0.045em] text-white">
          Complete your registration.
        </h1>

        <p className="mb-6 text-center text-[0.78rem] leading-relaxed text-white/40">
          Choose a password and enter the code we emailed you to see your
          full quote and unlock your dashboard.
        </p>

        {error && (
          <div className="mb-4 rounded-[0.7rem] border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-[0.76rem] text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[0.6rem]">
          <input
            type="email"
            value={email}
            placeholder="Email address"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
          />

          <input
            type="text"
            inputMode="numeric"
            value={code}
            placeholder="6-digit code"
            maxLength={6}
            onChange={(e) => setCode(e.target.value)}
            className={`${inputBase} text-center tracking-[0.4em]`}
          />

          <input
            type="password"
            value={password}
            placeholder="Choose a password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            className={inputBase}
          />

          <input
            type="password"
            value={confirmPassword}
            placeholder="Confirm password"
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputBase}
          />

          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            className="-mt-1 cursor-pointer self-end border-none bg-transparent p-0 text-[0.7rem] font-black text-[rgba(239,199,0,0.72)] transition-colors hover:text-[rgb(239,199,0)] disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="mt-1 w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-[rgba(23,17,0,0.3)] border-t-[#171100]" />
                Please wait…
              </>
            ) : (
              "Complete registration →"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-[0.76rem] text-white/40">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-black text-[rgba(239,199,0,0.82)] transition-colors hover:text-[rgb(239,199,0)]"
          >
            Log in
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 flex items-center gap-1.5 text-[0.7rem] font-black text-white/30 no-underline transition-colors hover:text-white/60"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to ValuePlus
      </Link>
    </main>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={null}>
      <CompleteRegistrationForm />
    </Suspense>
  );
}
