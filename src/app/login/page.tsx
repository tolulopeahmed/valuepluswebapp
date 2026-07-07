"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import Button from "@/components/buttons/buttons";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "signup" | "forgot";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function FieldTag({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-[0.6rem] top-1/2 inline-flex -translate-y-1/2 items-center whitespace-nowrap rounded-full border border-[rgba(239,199,0,0.28)] bg-[rgba(239,199,0,0.1)] px-[0.42rem] py-[0.18rem] text-[0.46rem] font-black uppercase tracking-[0.12em] text-[rgb(239,199,0)]">
      {label}
    </span>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login" as const);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [focused, setFocused] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const router = useRouter();

  function markComplete(id: string, value: string) {
    setFocused(null);

    setCompleted((prev) => {
      const next = new Set(prev);

      if (value.trim()) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }

  function isDone(id: string, value: string) {
    return completed.has(id) && !!value.trim() && focused !== id;
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setShowPw(false);
    setDone(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    const payload =
      mode === "signup"
        ? {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
          }
        : mode === "login"
          ? {
              email,
              password,
            }
          : {
              email,
            };

    console.log("AUTH PAYLOAD:", payload);

    // TODO: wire to Django endpoints:
    // login: POST /api/auth/login/
    // signup: POST /api/auth/signup/
    // forgot: POST /api/auth/request-password-reset/

    await new Promise((resolve) => setTimeout(resolve, 900));

    setLoading(false);

    if (mode === ("login" as AuthMode)) {
      router.push("/main/app");
      return;
    }

    if (mode === "forgot") {
      setDone(true);
    }
  } // 👈 THIS CLOSES handleSubmit

  const titles: Record<AuthMode, { h: string; sub: string }> = {
    login: {
      h: "Welcome back.",
      sub: "Log in to continue learning or manage your books.",
    },
    signup: {
      h: "Create your account.",
      sub: "Get started — it's free. Your quote details will live here.",
    },
    forgot: {
      h: "Reset password.",
      sub: "Enter your email and we'll send a reset link.",
    },
  };

  const { h, sub } = titles[mode];

  const inputBase =
    "w-full min-h-[2.9rem] rounded-[0.8rem] border bg-white/[0.055] px-[0.9rem] pr-[2.9rem] py-[0.75rem] text-white text-[0.88rem] outline-none placeholder:text-white/30 transition-all duration-150 focus:border-[rgba(239,199,0,0.55)] focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(239,199,0,0.09)]";

  const inputIdle = "border-white/[0.09]";
  const inputDone = "border-[rgba(239,199,0,0.26)] bg-[#090f1b]";

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
              alt="ValuePlus Publishing"
              width={145}
              height={42}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <h1 className="mb-2 text-center font-['PP_Telegraf'] text-[clamp(1.55rem,5.5vw,1.9rem)] font-black leading-none tracking-[-0.045em] text-white">
          {h}
        </h1>

        <p className="mb-6 text-center text-[0.78rem] leading-relaxed text-white/40">
          {sub}
        </p>

        {mode === "forgot" && done ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full border border-[rgba(74,222,128,0.28)] bg-[rgba(74,222,128,0.12)] text-xl text-[#4ade80]">
              ✓
            </div>

            <h3 className="mb-1 text-[1rem] font-black text-white">
              Check your email
            </h3>

            <p className="mb-4 text-[0.78rem] leading-relaxed text-white/40">
              We sent a reset link to{" "}
              <strong className="text-white">{email}</strong>. It expires in 30
              minutes.
            </p>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => switchMode("login")}
            >
              Back to log in
            </Button>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-[0.6rem]"
            >
              {mode === "signup" && (
                <div className="grid gap-[0.6rem] sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={firstName}
                      placeholder="First name"
                      autoComplete="given-name"
                      onFocus={() => setFocused("firstName")}
                      onBlur={() => markComplete("firstName", firstName)}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`${inputBase} ${
                        isDone("firstName", firstName) ? inputDone : inputIdle
                      }`}
                    />

                    {isDone("firstName", firstName) && (
                      <FieldTag label="First" />
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={lastName}
                      placeholder="Last name"
                      autoComplete="family-name"
                      onFocus={() => setFocused("lastName")}
                      onBlur={() => markComplete("lastName", lastName)}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`${inputBase} ${
                        isDone("lastName", lastName) ? inputDone : inputIdle
                      }`}
                    />

                    {isDone("lastName", lastName) && <FieldTag label="Last" />}
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  placeholder="Email address"
                  autoComplete="email"
                  onFocus={() => setFocused("email")}
                  onBlur={() => markComplete("email", email)}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputBase} ${
                    isDone("email", email) ? inputDone : inputIdle
                  }`}
                />

                {isDone("email", email) && <FieldTag label="Email" />}
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    placeholder={
                      mode === "signup" ? "Create a password" : "Password"
                    }
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    onFocus={() => setFocused("pw")}
                    onBlur={() => markComplete("pw", password)}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} ${
                      isDone("pw", password) ? inputDone : inputIdle
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    tabIndex={-1}
                    className="absolute right-[0.55rem] top-1/2 z-10 grid h-[1.8rem] w-[1.8rem] -translate-y-1/2 cursor-pointer place-items-center rounded-[0.45rem] border-none bg-transparent p-0 text-white/35 transition-all hover:bg-white/[0.06] hover:text-white/75 active:scale-90"
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="-mt-1 cursor-pointer self-end border-none bg-transparent p-0 text-[0.7rem] font-black text-[rgba(239,199,0,0.72)] transition-colors hover:text-[rgb(239,199,0)]"
                >
                  Forgot password?
                </button>
              )}

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
                ) : mode === "login" ? (
                  "Log in →"
                ) : mode === "signup" ? (
                  "Create account →"
                ) : (
                  "Send reset link →"
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-[0.76rem] text-white/40">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="cursor-pointer border-none bg-transparent p-0 font-black text-[rgba(239,199,0,0.82)] transition-colors hover:text-[rgb(239,199,0)]"
                  >
                    Sign up free
                  </button>
                </>
              ) : mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="cursor-pointer border-none bg-transparent p-0 font-black text-[rgba(239,199,0,0.82)] transition-colors hover:text-[rgb(239,199,0)]"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Remembered it?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="cursor-pointer border-none bg-transparent p-0 font-black text-[rgba(239,199,0,0.82)] transition-colors hover:text-[rgb(239,199,0)]"
                  >
                    Back to log in
                  </button>
                </>
              )}
            </p>

            {mode === "signup" && (
              <p className="mt-4 text-center text-[0.64rem] leading-relaxed text-white/25">
                By creating an account you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-white/40 underline underline-offset-2 hover:text-white/70"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-white/40 underline underline-offset-2 hover:text-white/70"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            )}
          </>
        )}
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
