"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";
import SectionLabel from "../../../components/SectionLabel";
import Header from "../../../components/Header";
import QuickActions from "../../../components/QuickActions";
import Sidebar from "../../../components/Sidebar";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";

type Mode = "learner" | "publisher";

const USER = {
  firstName: "Tolulope Ahmed",
  streak: 7,
  xp: 2340,
  level: 4,
  nextLevelXp: 3000,
  avatar: null as string | null,
};

const LESSONS = [
  {
    id: 1,
    title: "ISBN & Book Registration",
    module: "Module 2",
    progress: 100,
    duration: "12 min",
  },
  {
    id: 2,
    title: "Cover Design Principles",
    module: "Module 3",
    progress: 65,
    duration: "18 min",
  },
  {
    id: 3,
    title: "Typesetting & Layout",
    module: "Module 3",
    progress: 0,
    duration: "22 min",
  },
  {
    id: 4,
    title: "Print-on-Demand Basics",
    module: "Module 4",
    progress: 0,
    duration: "15 min",
  },
];

const CURRENT_LESSON = LESSONS[1];

const BOOKS = [
  {
    id: 1,
    title: "The Wealth Blueprint",
    cover: "bg-gradient-to-br from-[#9d4d3d] to-[#3e1713]",
    status: "published",
    sales: 124,
    earned: 186000,
  },
  {
    id: 2,
    title: "Faith That Moves Mountains",
    cover: "bg-gradient-to-br from-[#233d66] to-[#091423]",
    status: "published",
    sales: 87,
    earned: 130500,
  },
  {
    id: 3,
    title: "The Leadership Code",
    cover: "bg-gradient-to-br from-[#915071] to-[#2f1223]",
    status: "in_progress",
    sales: 0,
    earned: 0,
  },
];

const STREAK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const STREAK_DONE = [true, true, true, true, true, true, false];

const STAGES = [
  "Start",
  "Learn",
  "Practice",
  "Publish",
  "Sell",
  "Scale",
  "Royalty",
  "Freedom",
];

const LEARNER_STAGE_INDEX = 3;
const PUBLISHER_STAGE_INDEX = 5;

const RECENT_SALES = [
  {
    title: "The Wealth Blueprint",
    buyer: "R. Okoye",
    amount: 4500,
    time: "2h ago",
  },
  {
    title: "Faith That Moves Mountains",
    buyer: "A. Bello",
    amount: 3000,
    time: "5h ago",
  },
  {
    title: "The Wealth Blueprint",
    buyer: "T. Musa",
    amount: 4500,
    time: "1d ago",
  },
];

const LEADERBOARD = [
  { name: "Akolade F.", xp: 4120, rank: 1 },
  { name: "Chidinma O.", xp: 3870, rank: 2 },
  { name: "Tolulope A. (You)", xp: 2340, rank: 3, isYou: true },
];

function Icon({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  learn: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  refer:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  withdraw: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  play: "M5 3l14 9-14 9V3z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  chevronR: "M9 18l6-6-6-6",
  trend: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  cash: "M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4 M4 6v12c0 1.1.9 2 2 2h14v-4 M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
};

const TABS = [
  { id: "home", label: "Home", icon: ICONS.home },
  { id: "learn", label: "Learn", icon: ICONS.learn },
  { id: "refer", label: "Refer", icon: ICONS.refer },
  { id: "withdraw", label: "Withdraw", icon: ICONS.withdraw },
  { id: "more", label: "More", icon: ICONS.more },
];

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function GlassCard({
  children,
  className = "",
  accent = false,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        accent ? "border-[rgba(239,199,0,0.32)]" : "border-white/[0.08]"
      } ${className}`}
      style={{
        background: accent
          ? "radial-gradient(circle at 12% 0%, rgba(239,199,0,0.22), transparent 48%), radial-gradient(circle at 100% 100%, rgba(200,115,122,0.16), transparent 42%), linear-gradient(155deg, #201907 0%, #120f08 100%)"
          : "radial-gradient(circle at 12% 0%, rgba(239,199,0,0.075), transparent 52%), linear-gradient(155deg, #171823 0%, #10121a 100%)",
        boxShadow:
          "0 12px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.055)",
        ...style,
      }}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}

function ProfileAvatar({
  name,
  avatar,
  onClick,
}: {
  name: string;
  avatar: string | null;
  onClick: () => void;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "V";

  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 rounded-full transition-transform active:scale-95"
      aria-label="Open profile"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-16 w-16 rounded-full border-2 object-cover md:h-14 md:w-14"
          style={{ borderColor: "rgb(239,199,0)" }}
        />
      ) : (
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 text-base font-black text-white md:h-14 md:w-14"
          style={{
            borderColor: "rgb(239,199,0)",
            background: "linear-gradient(145deg, grey, silver)",
            marginTop: -5,
          }}
        >
          {initial}
        </div>
      )}

      <span
        className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-[#070b12] text-[0.5rem] font-black text-[#171100]"
        style={{ background: "rgb(239,199,0)" }}
      >
        ✓
      </span>
    </button>
  );
}

function HeroSlider({
  cards,
}: {
  cards: { key: string; content: React.ReactNode }[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pausedUntil = useRef(0);

  const scrollToIndex = useCallback((idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, []);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(cards.length - 1, Math.max(0, idx)));
  };

  useEffect(() => {
    const iv = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      const el = trackRef.current;
      if (!el || window.innerWidth >= 768) return;

      const next =
        (Math.round(el.scrollLeft / el.clientWidth) + 1) % cards.length;

      scrollToIndex(next);
    }, 10000);

    return () => clearInterval(iv);
  }, [cards.length, scrollToIndex]);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => {
          pausedUntil.current = Date.now() + 15000;
        }}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-2 md:overflow-visible lg:grid-cols-4"
      >
        {cards.map((card, i) => (
          <div
            key={card.key}
            className="vp-card-in w-full flex-shrink-0 snap-center md:w-auto"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {card.content}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-center gap-1.5 md:hidden">
        {cards.map((card, i) => (
          <button
            key={card.key}
            onClick={() => {
              pausedUntil.current = Date.now() + 15000;
              scrollToIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-4 bg-[rgb(239,199,0)]" : "w-1.5 bg-white/15"
            }`}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function StageBars({
  activeIndex,
  label,
}: {
  activeIndex: number;
  label: string;
}) {
  return (
    <GlassCard className="p-4">
      <SectionLabel>{label}</SectionLabel>

      <p className="mb-3 text-lg font-black leading-none text-white">
        {STAGES[activeIndex]}
      </p>

      <div className="flex h-24 items-end gap-1.5">
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${
                i === activeIndex
                  ? "bg-[rgb(239,199,0)] shadow-[0_0_12px_rgba(239,199,0,0.4)]"
                  : "bg-white/[0.08]"
              }`}
              style={{ height: `${18 + i * 9}%` }}
            />
            <span
              className={`text-[0.4rem] font-black uppercase ${
                i === activeIndex ? "text-[rgb(239,199,0)]" : "text-white/25"
              }`}
            >
              {stage.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function MainTab({
  active,
  onTab,
}: {
  active: string;
  onTab: (id: string) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/[0.08] px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{
        background: "rgba(7,11,18,0.94)",
        backdropFilter: "blur(24px) saturate(1.5)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTab(tab.id)}
            className="relative flex flex-col items-center gap-[3px] px-3 py-2"
          >
            <span
              className={`absolute -top-1 h-9 w-9 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)] ${
                isActive
                  ? "scale-100 bg-[rgba(239,199,0,0.14)] opacity-100"
                  : "scale-75 opacity-0"
              }`}
            />
            <span
              className={`relative transition-all duration-300 ${
                isActive
                  ? "-translate-y-0.5 scale-110 text-[rgb(239,199,0)]"
                  : "text-white/35"
              }`}
            >
              <Icon path={tab.icon} size={20} />
            </span>
            <span
              className={`relative text-[0.52rem] font-black uppercase leading-none tracking-[0.1em] transition-colors ${
                isActive ? "text-[rgb(239,199,0)]" : "text-white/30"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function LearnerHeroCards() {
  const progressPct = Math.round((USER.xp / USER.nextLevelXp) * 100);

  return [
    {
      key: "focus",
      content: (
        <GlassCard accent className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[rgb(239,199,0)]/75">
            Learning progress
          </p>

          <p className="mt-2 text-4xl font-black leading-none text-white md:text-3xl">
            {USER.xp.toLocaleString()} XP
          </p>

          <p className="mt-1 text-[0.68rem] text-white/42">
            {USER.nextLevelXp - USER.xp} XP to Level {USER.level + 1}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-[rgb(239,199,0)] shadow-[0_0_12px_rgba(239,199,0,0.5)] transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </GlassCard>
      ),
    },
    {
      key: "streak",
      content: (
        <GlassCard className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-white/35">
            This week
          </p>

          <p className="mt-2 text-2xl font-black leading-none text-white">
            6 / 7 days
          </p>

          <div className="mt-4 flex gap-1.5">
            {STREAK_DAYS.map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-full items-center justify-center rounded-lg text-[0.6rem] font-black transition-all ${
                    STREAK_DONE[i]
                      ? "bg-[rgb(239,199,0)] text-[#171100] shadow-[0_4px_12px_rgba(239,199,0,0.3)]"
                      : "bg-white/[0.06] text-white/30"
                  }`}
                >
                  {STREAK_DONE[i] ? "✓" : ""}
                </div>
                <span className="text-[0.48rem] font-black uppercase text-white/25">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      ),
    },
    {
      key: "current-lesson",
      content: (
        <GlassCard className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-white/35">
            {CURRENT_LESSON.module}
          </p>

          <p className="mt-2 truncate text-lg font-black text-white">
            {CURRENT_LESSON.title}
          </p>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-[rgb(239,199,0)]"
              style={{ width: `${CURRENT_LESSON.progress}%` }}
            />
          </div>

          <button className="mt-4 flex items-center gap-2 rounded-xl bg-[rgb(239,199,0)] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[#171100] transition-transform hover:scale-[1.02] active:scale-95">
            <Icon path={ICONS.play} size={12} />
            Resume
          </button>
        </GlassCard>
      ),
    },
    {
      key: "rank",
      content: (
        <GlassCard className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-white/35">
            Leaderboard rank
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">#3</p>

          <p className="mt-1 text-[0.68rem] text-white/42">
            1,780 XP behind #1
          </p>
        </GlassCard>
      ),
    },
  ];
}

function PublisherHeroCards() {
  const totalEarned = BOOKS.reduce((s, b) => s + b.earned, 0);
  const totalSales = BOOKS.reduce((s, b) => s + b.sales, 0);
  const publishedCount = BOOKS.filter((b) => b.status === "published").length;

  return [
    {
      key: "focus",
      content: (
        <GlassCard accent className="h-full p-5">
          <div className="flex items-center justify-between">
            <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[rgb(239,199,0)]/75">
              Total earned
            </p>
            <Icon path={ICONS.cash} size={16} />
          </div>

          <p className="mt-2 text-4xl font-black leading-none text-white md:text-3xl">
            {naira(totalEarned)}
          </p>

          <p className="mt-1 flex items-center gap-1 text-[0.68rem] text-[#4ade80]">
            <Icon path={ICONS.trend} size={11} />+{naira(4500)} this week
          </p>
        </GlassCard>
      ),
    },
    {
      key: "sales",
      content: (
        <GlassCard className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-white/35">
            Total sales
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">
            {totalSales}
          </p>

          <p className="mt-1 text-[0.68rem] text-white/42">
            copies sold across all books
          </p>
        </GlassCard>
      ),
    },
    {
      key: "books",
      content: (
        <GlassCard className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-white/35">
            Books published
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">
            {publishedCount}{" "}
            <span className="text-base text-white/30">/ {BOOKS.length}</span>
          </p>

          <p className="mt-1 text-[0.68rem] text-white/42">1 in progress</p>
        </GlassCard>
      ),
    },
    {
      key: "payout",
      content: (
        <GlassCard className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-white/35">
            Available payout
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">
            {naira(103247)}
          </p>

          <button className="mt-4 rounded-xl bg-[rgb(239,199,0)] px-4 py-2 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[#171100] transition-transform hover:scale-[1.02] active:scale-95">
            Withdraw
          </button>
        </GlassCard>
      ),
    },
  ];
}

function LessonsSection() {
  return (
    <div>
      <SectionLabel>All lessons</SectionLabel>

      <div className="grid gap-2 md:grid-cols-2">
        {LESSONS.map((lesson, i) => (
          <GlassCard
            key={lesson.id}
            className="vp-card-in p-3.5"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                  lesson.progress === 100
                    ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80]"
                    : lesson.progress > 0
                      ? "bg-[rgba(239,199,0,0.12)] text-[rgb(239,199,0)]"
                      : "bg-white/[0.05] text-white/25"
                }`}
              >
                {lesson.progress === 100
                  ? "✓"
                  : lesson.progress > 0
                    ? `${lesson.progress}%`
                    : "–"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.78rem] font-black text-white/82">
                  {lesson.title}
                </p>
                <p className="text-[0.55rem] text-white/32">
                  {lesson.module} · {lesson.duration}
                </p>
              </div>

              <Icon path={ICONS.chevronR} size={14} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function BooksSection() {
  return (
    <div>
      <SectionLabel>Manage books</SectionLabel>

      <div className="grid gap-2.5 md:grid-cols-2">
        {BOOKS.map((book, i) => (
          <GlassCard
            key={book.id}
            className="vp-card-in p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-14 w-10 flex-shrink-0 rounded-lg ${book.cover} border border-white/[0.15]`}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] font-black text-white">
                  {book.title}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-[2px] text-[0.44rem] font-black uppercase tracking-wider ${
                      book.status === "published"
                        ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80]"
                        : "bg-[rgba(239,199,0,0.12)] text-[rgb(239,199,0)]"
                    }`}
                  >
                    {book.status === "published" ? "Published" : "In Progress"}
                  </span>

                  {book.sales > 0 && (
                    <span className="text-[0.55rem] text-white/35">
                      {book.sales} sales
                    </span>
                  )}
                </div>

                {book.earned > 0 && (
                  <p className="mt-0.5 text-[0.68rem] font-black text-[rgb(239,199,0)]">
                    {naira(book.earned)} earned
                  </p>
                )}
              </div>

              <button className="flex-shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-[0.58rem] font-black uppercase tracking-[0.1em] text-white/70 transition-all hover:border-[rgba(239,199,0,0.3)] hover:bg-[rgba(239,199,0,0.08)] hover:text-[rgb(239,199,0)] active:scale-95">
                Manage
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function SidePanel({ mode }: { mode: Mode }) {
  if (mode === "learner") {
    return (
      <GlassCard className="p-4">
        <SectionLabel>Leaderboard</SectionLabel>

        <div className="flex flex-col gap-2.5">
          {LEADERBOARD.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${
                entry.isYou ? "bg-[rgba(239,199,0,0.08)]" : ""
              }`}
            >
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[0.62rem] font-black ${
                  entry.rank === 1
                    ? "bg-[rgb(239,199,0)] text-[#171100]"
                    : "bg-white/[0.08] text-white/50"
                }`}
              >
                {entry.rank}
              </span>

              <span
                className={`flex-1 truncate text-[0.72rem] font-black ${
                  entry.isYou ? "text-[rgb(239,199,0)]" : "text-white/75"
                }`}
              >
                {entry.name}
              </span>

              <span className="text-[0.62rem] font-black text-white/40">
                {entry.xp.toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <SectionLabel>Recent sales</SectionLabel>

      <div className="flex flex-col gap-2.5">
        {RECENT_SALES.map((sale, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl px-2.5 py-2"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(74,222,128,0.12)] text-[#4ade80]">
              <Icon path={ICONS.book} size={14} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.72rem] font-black text-white/85">
                {sale.title}
              </p>
              <p className="text-[0.55rem] text-white/30">
                {sale.buyer} · {sale.time}
              </p>
            </div>

            <span className="text-[0.62rem] font-black text-[#4ade80]">
              +{naira(sale.amount)}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("learner");

  const heroCards =
    mode === "learner" ? LearnerHeroCards() : PublisherHeroCards();

  return (
    <div
      className="relative min-h-[100svh] overflow-x-hidden md:flex"
      style={{
        background:
          "radial-gradient(circle at 50% -8%, rgba(239,199,0,0.08), transparent 30%), linear-gradient(145deg, #070b12 0%, #0d1420 52%, #080711 100%)",
        fontFamily: "'Product Sans', 'Proxima Nova', sans-serif",
      }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={mode}
        onModeChange={setMode}
        firstName={USER.firstName}
        xp={USER.xp}
        level={USER.level}
      />

      <div className="min-w-0 flex-1">
        <Header
          streak={USER.streak}
          notificationCount={2}
          mode={mode}
          onModeChange={setMode}
          onMenuPress={() => setSidebarOpen(true)}
          onBellPress={() => setActiveTab("more")}
        />

        <main className="px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-6">
            <div className="vp-card-in flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Title>Hi, {USER.firstName.split(" ")[0]}</Title>
                <Subtitle>
                  {getGreeting()}.{" "}
                  {mode === "learner"
                    ? "Continue your publishing lessons"
                    : "Track your books and earnings"}
                </Subtitle>
              </div>

              <ProfileAvatar
                name={USER.firstName}
                avatar={USER.avatar}
                onClick={() => setSidebarOpen(true)}
              />
            </div>

            <div className="vp-card-in" style={{ animationDelay: "60ms" }}>
              <SectionLabel>
                {mode === "learner" ? "Your progress" : "Your earnings"}
              </SectionLabel>
              <HeroSlider cards={heroCards} />
            </div>

            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
              <div
                className="vp-card-in md:col-span-1"
                style={{ animationDelay: "100ms" }}
              >
                <SectionLabel>Quick actions</SectionLabel>
                <QuickActions
                  mode={mode}
                  onNavigate={(dest) => console.log("navigate:", dest)}
                />
              </div>

              <div
                className="vp-card-in md:col-span-1"
                style={{ animationDelay: "140ms" }}
              >
                <SidePanel mode={mode} />
              </div>

              <div
                className="vp-card-in md:col-span-1"
                style={{ animationDelay: "180ms" }}
              >
                <StageBars
                  activeIndex={
                    mode === "learner"
                      ? LEARNER_STAGE_INDEX
                      : PUBLISHER_STAGE_INDEX
                  }
                  label={
                    mode === "learner"
                      ? "Learning momentum"
                      : "Earnings momentum"
                  }
                />
              </div>
            </div>

            {mode === "learner" ? <LessonsSection /> : <BooksSection />}
          </div>
        </main>
      </div>

      <MainTab active={activeTab} onTab={setActiveTab} />

      <style jsx global>{`
        @keyframes vpFadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .vp-card-in {
          animation: vpFadeInUp 0.5s cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .vp-card-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
