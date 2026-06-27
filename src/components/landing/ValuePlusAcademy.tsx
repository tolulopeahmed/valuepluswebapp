import Link from "next/link";
import Button from "../buttons/buttons";

const academyLessons = [
  "FOUNDATIONS: A—Z of Publishing",
  "SOFTJOB: Inside, Cover & Editing",
  "PUBLISHING: KDP, Prints, etc.",
  "MARKETING and SELLING",
];

const academyModules = [
  {
    number: "01",
    title: "Foundations: A—Z of Publishing",
    desc: "Tools of the Trade: Understanding the publishing process, from manuscript to market.",
    xp: "120 XP",
    isFree: true,
  },
  {
    number: "02",
    title: "DESIGN: Inside and Cover",
    desc: "Cover Design, Inside Design or Formatting/Layout, and everything that makes a book reader-ready.",
    xp: "200 XP",
    isFree: false,
  },
  {
    number: "03",
    title: "Proofreading and Editing",
    desc: "Getting the book error-free and updating it to ensure high engagement and readability.",
    xp: "150 XP",
    isFree: false,
  },
  {
    number: "04",
    title: "PRINTING: Presswork",
    desc: "From back-cover printing and lamination to inside printing, perfect-binding, sewing, trimming and packaging.",
    xp: "180 XP",
    isFree: false,
  },
  {
    number: "05",
    title: "Distribution: KDP, Selar, etc.",
    desc: "Upload, metadata, pricing strategy, and getting your book into readers’ hands.",
    xp: "220 XP",
    isFree: false,
  },
  {
    number: "06",
    title: "Capstone: Publish First Book",
    desc: "Write a book about an important area of your life that you've succeeded in and publish it for others to achieve the same.",
    xp: "200 XP",
    isFree: false,
  },
];

export default function ValuePlusAcademy() {
  return (
    <section
      id="academy"
      className="bg-vp-paper px-4 py-16 text-vp-dark md:py-28"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="academy-phone-shell">
          <div className="flex items-center justify-between text-xs text-white">
            <span>9:03</span>
            <span>●●●</span>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/45">A—Z of Publishing</p>
              <h3 className="mt-1 text-xl font-black text-white">
                Today&apos;s lessons
              </h3>
            </div>

            <span className="rounded-full bg-vp-accent/15 px-3 py-2 text-xs font-black text-vp-accent">
              1,250 XP
            </span>
          </div>

          <div className="mt-5 inline-flex rounded-full bg-vp-accent/15 px-3 py-2 text-xs font-black text-vp-accent">
            🔥 12 day streak
          </div>

          <div className="mt-5 space-y-3">
            {academyLessons.map((lesson, i) => (
              <Link key={lesson} href="/pricing" className="lesson-item group">
                <div className="lesson-check">✓</div>

                <p>{lesson}</p>

                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  {i === 3 ? "next" : "+30 XP"}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-white/45">
              <span>Your progress</span>
              <span>72%</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-vp-accent" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs text-white/40">Recent achievement</p>

            <h4 className="mt-1 text-sm font-black text-white">
              Publishing Beginner
            </h4>

            <span className="mt-2 inline-flex text-xs text-vp-accent">
              Badge earned ✦
            </span>
          </div>
        </div>

        <div>
          <p className="eyebrow" style={{ color: "#fb9906" }}>
            BECOME A
          </p>

          <h2 className="display-heading section-heading text-vp-dark">
            Professional Publisher{" "}
            <span className="text-[#fb9906]">in Just 6 Modules</span>
          </h2>

          <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-black/60">
            Short lessons, daily streaks, XP, quizzes, peer scoring and
            certificates — all built around the Nigerian publishing market.
          </p>

          <div className="mt-7 space-y-4">
            {[
              "Starts at 100% — your score reflects every choice you make",
              "Daily streaks, XP and badges keep momentum alive",
              "Quizzes, video lessons and hands-on project uploads",
              "Finish the course and qualify for the intern track",
              "Pay in Naira or Dollars — starts free",
            ].map((item) => (
              <div key={item} className="benefit-row">
                <span style={{ backgroundColor: "#ffb546", color: "#fff" }}>
                  ✓
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <Button
            href="/pricing"
            variant="light"
            size="lg"
            className="mt-8"
            style={{ color: "black" }}
          >
            Start For Free →
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl">
        <div className="mb-10 text-center">
          <p className="eyebrow">What you will learn</p>

          <h2 className="display-heading section-heading mx-auto text-vp-dark">
            Take Module 1 For Free
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {academyModules.map((mod) => (
            <Link
              key={mod.number}
              href="/pricing"
              className="module-card group block cursor-pointer"
            >
              <span className="module-card-num">{mod.number}</span>

              {mod.isFree && (
                <span className="absolute right-4 top-4 z-10 rounded-full bg-[#2cb23c] px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(251,153,6,0.28)] transition-transform duration-300 group-hover:scale-105">
                  FREE
                </span>
              )}

              <p className="mb-2 text-xs font-black uppercase tracking-widest text-vp-accent">
                Module {mod.number}
              </p>

              <h3
                className="text-2xl font-black tracking-tight leading-snug text-vp-dark transition-colors duration-300 group-hover:text-[#fb9906]"
                style={{ fontFamily: "PP Telegraf" }}
              >
                {mod.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/55">{mod.desc}</p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-black/30">
                  <span className="text-vp-accent">●</span> {mod.xp}
                </span>

                <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-[#fb9906] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  View pricing →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
