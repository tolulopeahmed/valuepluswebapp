"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
  Fragment,
} from "react";
import { Check, Lock, Play } from "lucide-react";
import SectionLabel from "../../../components/SectionLabel";
import Header from "../../../components/Header";
import QuickActions from "../../../components/QuickActions";
import Sidebar from "../../../components/Sidebar";
import Title from "../../../components/Title";
import Subtitle from "../../../components/Subtitle";
import Button from "../../../components/buttons/buttons";
import LessonDetailModal, {
  type LessonDetail,
  type LessonStatus,
} from "../../../components/LessonDetailsModal";
import MarqueeName from "../../../components/MarqueeName";

type Mode = "learner" | "publisher";

const USER = {
  firstName: "Oluwaseunfunmilayo",
  streak: 7,
  xp: 2340,
  level: 4,
  nextLevelXp: 3000,
  avatar: null as string | null,
};

// 6-module curriculum. Lessons 1 & 2 are complete; Lesson 3 is the one
// currently in progress; 4–6 are locked/upcoming.
const MODULES = [
  {
    id: 1,
    module: "Module 01",
    title: "Foundations: A–Z of Publishing",
    description:
      "Tools of the Trade: understanding the publishing process, from manuscript to market.",
    actionTip:
      "Revisit your notes on the manuscript-to-market pipeline before moving on — everything else builds on this.",
    xp: 120,
    duration: "12 min",
    progress: 100,
  },
  {
    id: 2,
    module: "Module 02",
    title: "Design: Inside and Cover",
    description:
      "Cover design, inside design, formatting and layout, and everything that makes a book reader-ready.",
    actionTip:
      "Sketch three cover directions before opening any design tool — constraints spark better covers than a blank canvas.",
    xp: 200,
    duration: "18 min",
    progress: 100,
  },
  {
    id: 3,
    module: "Module 03",
    title: "Proofreading and Editing",
    description:
      "Getting the book error-free and updating it to ensure high engagement and readability.",
    actionTip:
      "Read your manuscript aloud — your ear will catch awkward phrasing your eyes skim right past.",
    xp: 150,
    duration: "15 min",
    progress: 40,
  },
  {
    id: 4,
    module: "Module 04",
    title: "Printing: Presswork",
    description:
      "From back-cover printing and lamination to inside printing, perfect-binding, sewing, trimming and packaging.",
    actionTip:
      "Order a single physical proof before committing to a full print run — screens lie about paper weight and color.",
    xp: 180,
    duration: "20 min",
    progress: 0,
  },
  {
    id: 5,
    module: "Module 05",
    title: "Distribution: KDP, Selar, etc.",
    description:
      "Upload, metadata, pricing strategy, and getting your book into readers' hands.",
    actionTip:
      "Write your book's metadata and keywords before uploading — retrofitting SEO after launch costs you early sales.",
    xp: 220,
    duration: "18 min",
    progress: 0,
  },
  {
    id: 6,
    module: "Module 06",
    title: "Capstone: Publish First Book",
    description:
      "Write a book about an important area of your life that you've succeeded in and publish it for others to achieve the same.",
    actionTip:
      "Set a firm publish date now — a deadline turns a capstone project into a finished book.",
    xp: 200,
    duration: "25 min",
    progress: 0,
  },
];

function lessonStatus(progress: number, isCurrentId: boolean): LessonStatus {
  if (progress === 100) return "done";
  if (isCurrentId) return "current";
  return "upcoming";
}

const CURRENT_MODULE =
  MODULES.find((m) => m.progress > 0 && m.progress < 100) ?? MODULES[0];

const CURRENT_MODULE_XP_EARNED = Math.round(
  (CURRENT_MODULE.xp * CURRENT_MODULE.progress) / 100,
);

const MODULE_EARNED_XP = MODULES.reduce((sum, m) => {
  if (m.progress === 100) return sum + m.xp;
  if (m.id === CURRENT_MODULE.id) return sum + CURRENT_MODULE_XP_EARNED;
  return sum;
}, 0);

const MODULE_TOTAL_XP = MODULES.reduce((s, m) => s + m.xp, 0);

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

// GlassCard: warm olive-gold wash top-to-bottom, matching the reference —
// the top stays bright and saturated, the bottom only dips slightly
// darker. No portion of the card should read as near-black anymore.
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
        accent
          ? "border-[rgba(239,199,0,0.45)]"
          : "border-[rgba(239,199,0,0.22)]"
      } ${className}`}
      style={{
        background: accent
          ? "radial-gradient(120% 90% at 20% 0%, rgba(239,199,0,0.5), transparent 72%), linear-gradient(180deg, #6b5111 0%, #4a3811 45%, #2e2410 100%)"
          : "radial-gradient(120% 90% at 20% 0%, rgba(239,199,0,0.34), transparent 72%), linear-gradient(180deg, #4a4258 0%, #342e42 45%, #201c2c 100%)",
        boxShadow:
          "0 12px 34px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
        ...style,
      }}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
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
          }}
        >
          {initial}
        </div>
      )}
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
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-2 md:items-stretch md:overflow-visible lg:grid-cols-4"
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

// ─────────────────────────────────────────────
// Horizontal step icon (shared visual language with vertical list)
// ─────────────────────────────────────────────

function StepNode({ status, index }: { status: LessonStatus; index: number }) {
  if (status === "done") {
    return (
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          background: "rgb(74,222,128)",
          boxShadow: "0 0 0 3px rgba(74,222,128,0.16)",
        }}
      >
        <Check size={15} strokeWidth={3} className="text-[#0b1a0f]" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className="vp-pulse-ring flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-[0.62rem] font-black"
        style={{
          borderColor: "rgb(239,199,0)",
          background: "rgba(239,199,0,0.16)",
          color: "rgb(239,199,0)",
        }}
      >
        {index + 1}
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/25">
      <Lock size={12} strokeWidth={2.25} />
    </div>
  );
}

function ProgressRoadmap({
  items,
}: {
  items: { id: string | number; label: string; status: LessonStatus }[];
}) {
  return (
    <GlassCard className="p-4 md:p-5">
      <SectionLabel>Course roadmap</SectionLabel>

      <div className="flex items-start">
        {items.map((item, i) => (
          <Fragment key={item.id}>
            <div className="flex w-14 flex-shrink-0 flex-col items-center gap-2 md:w-20">
              <StepNode status={item.status} index={i} />
              <span
                className={`text-center text-[0.44rem] font-black uppercase leading-tight tracking-wider md:text-[0.5rem] ${
                  item.status === "upcoming"
                    ? "text-white/25"
                    : item.status === "current"
                      ? "text-[rgb(239,199,0)]"
                      : "text-white/55"
                }`}
              >
                {item.label}
              </span>
            </div>

            {i < items.length - 1 && (
              <div
                className="mt-4 h-[2px] flex-1 rounded-full transition-colors duration-500"
                style={{
                  background:
                    item.status === "done"
                      ? "rgb(74,222,128)"
                      : "rgba(255,255,255,0.1)",
                }}
              />
            )}
          </Fragment>
        ))}
      </div>
    </GlassCard>
  );
}

function LearnerRoadmap() {
  const items = MODULES.map((m) => ({
    id: m.id,
    label: m.title.split(" ").slice(0, 2).join(" "),
    status: lessonStatus(m.progress, m.id === CURRENT_MODULE.id),
  }));

  return <ProgressRoadmap items={items} />;
}

function PublisherRoadmap() {
  const items = BOOKS.map((book) => ({
    id: book.id,
    label: book.title.split(" ").slice(0, 2).join(" "),
    status: (book.status === "published"
      ? "done"
      : book.status === "in_progress"
        ? "current"
        : "upcoming") as LessonStatus,
  }));

  return <ProgressRoadmap items={items} />;
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
  return [
    {
      key: "focus",
      // Current-module card: header block up top, bottom row has the
      // progress bar (left) and Resume (right) on one line. Unfilled
      // track is a visible grey, not near-black.
      content: (
        <GlassCard accent className="flex h-full flex-col p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
            {CURRENT_MODULE.module}
          </p>

          <p className="mt-2 text-xl font-black leading-tight text-white">
            {CURRENT_MODULE.title}
          </p>

          <p className="mt-1 text-[0.68rem] text-white/70">
            {CURRENT_MODULE.progress}% complete · {CURRENT_MODULE.duration}
          </p>

          <div className="mt-4 flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(0,0,0,0.28)]">
                <div
                  className="h-full rounded-full bg-[rgb(239,199,0)] shadow-[0_0_10px_rgba(239,199,0,0.5)] transition-all duration-700"
                  style={{ width: `${CURRENT_MODULE.progress}%` }}
                />
              </div>
              <p className="mt-1.5 truncate text-[0.6rem] font-black text-[#3a2c05]">
                +{CURRENT_MODULE_XP_EARNED} XP earned
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              className="!w-auto flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
            >
              RESUME
            </Button>
          </div>
        </GlassCard>
      ),
    },
    {
      key: "streak",
      content: (
        <GlassCard accent className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
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
                      ? "bg-[#171100] text-[rgb(239,199,0)] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "bg-black/20 text-white/40"
                  }`}
                >
                  {STREAK_DONE[i] ? "✓" : ""}
                </div>
                <span className="text-[0.48rem] font-black uppercase text-white/40">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      ),
    },
    {
      key: "xp",
      content: (
        <GlassCard accent className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
            Total XP
          </p>

          <p className="mt-2 text-4xl font-black leading-none text-white md:text-3xl">
            {USER.xp.toLocaleString()}
          </p>

          <p className="mt-1 text-[0.68rem] text-white/70">
            {USER.nextLevelXp - USER.xp} XP to Level {USER.level + 1}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[rgba(0,0,0,0.28)]">
            <div
              className="h-full rounded-full bg-[rgb(239,199,0)] shadow-[0_0_10px_rgba(239,199,0,0.5)] transition-all duration-700"
              style={{
                width: `${Math.round((USER.xp / USER.nextLevelXp) * 100)}%`,
              }}
            />
          </div>
        </GlassCard>
      ),
    },
    {
      key: "rank",
      content: (
        <GlassCard accent className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
            Leaderboard rank
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">#3</p>

          <p className="mt-1 text-[0.68rem] text-white/70">
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
            <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
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
        <GlassCard accent className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
            Total sales
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">
            {totalSales}
          </p>

          <p className="mt-1 text-[0.68rem] text-white/70">
            copies sold across all books
          </p>
        </GlassCard>
      ),
    },
    {
      key: "books",
      content: (
        <GlassCard accent className="h-full p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
            Books published
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">
            {publishedCount}{" "}
            <span className="text-base text-white/40">/ {BOOKS.length}</span>
          </p>

          <p className="mt-1 text-[0.68rem] text-white/70">1 in progress</p>
        </GlassCard>
      ),
    },
    {
      key: "payout",
      content: (
        <GlassCard accent className="flex h-full flex-col p-5">
          <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[#3a2c05]">
            Available payout
          </p>

          <p className="mt-2 text-3xl font-black leading-none text-white">
            {naira(103247)}
          </p>

          <div className="mt-4 flex items-center justify-end">
            <Button
              size="sm"
              variant="primary"
              className="!w-auto whitespace-nowrap rounded-full px-4 shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
            >
              Withdraw
            </Button>
          </div>
        </GlassCard>
      ),
    },
  ];
}

// ─────────────────────────────────────────────
// "All lessons" — MyFund "All Stages" style vertical list
// ─────────────────────────────────────────────

function AllLessonsSection({
  onSelect,
}: {
  onSelect: (lesson: LessonDetail) => void;
}) {
  return (
    <GlassCard className="p-4 md:p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <SectionLabel>All lessons</SectionLabel>
        <span className="text-[0.6rem] font-black text-white/45">
          {MODULE_EARNED_XP.toLocaleString()} /{" "}
          {MODULE_TOTAL_XP.toLocaleString()} XP
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {MODULES.map((m, i) => {
          const status = lessonStatus(m.progress, m.id === CURRENT_MODULE.id);
          const isCurrent = status === "current";

          const barColor =
            status === "done"
              ? "rgb(74,222,128)"
              : status === "current"
                ? "rgb(239,199,0)"
                : "rgba(255,255,255,0.15)";

          return (
            <button
              key={m.id}
              onClick={() =>
                onSelect({
                  index: i + 1,
                  total: MODULES.length,
                  moduleLabel: m.module,
                  title: m.title,
                  description: m.description,
                  actionTip: m.actionTip,
                  xp: m.xp,
                  status,
                })
              }
              className={`group flex w-full items-start gap-3 rounded-xl px-2.5 py-3 text-left transition-all active:scale-[0.99] ${
                isCurrent ? "border" : "border border-transparent"
              }`}
              style={
                isCurrent
                  ? {
                      background: "rgba(239,199,0,0.1)",
                      borderColor: "rgba(239,199,0,0.35)",
                    }
                  : undefined
              }
            >
              <span
                className="mt-0.5 h-full min-h-[2.75rem] w-[3px] flex-shrink-0 self-stretch rounded-full transition-colors"
                style={{ background: barColor }}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[0.6rem] font-black uppercase tracking-[0.08em] ${
                      status === "upcoming" ? "text-white/35" : "text-white/55"
                    }`}
                  >
                    {m.module}
                  </span>

                  {isCurrent && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-[1px] text-[0.44rem] font-black uppercase tracking-[0.1em]"
                      style={{
                        background: "rgba(239,199,0,0.18)",
                        color: "rgb(239,199,0)",
                      }}
                    >
                      You are here
                    </span>
                  )}
                </div>

                <p
                  className={`mt-0.5 truncate text-[0.85rem] font-black ${
                    status === "upcoming" ? "text-white/45" : "text-white"
                  }`}
                >
                  {m.title}
                </p>

                <p className="mt-0.5 text-[0.58rem] text-white/38">
                  {m.duration} · {m.xp} XP
                </p>
              </div>

              <span className="mt-1 flex-shrink-0">
                {status === "done" && (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[rgba(74,222,128,0.16)] text-[#4ade80]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}

                {status === "current" && (
                  <span
                    className="vp-pulse-ring grid h-6 w-6 place-items-center rounded-full border-2"
                    style={{
                      borderColor: "rgb(239,199,0)",
                      background: "rgba(239,199,0,0.14)",
                    }}
                  />
                )}

                {status === "upcoming" && (
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/30">
                    <Lock size={11} strokeWidth={2.25} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
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

              <Button variant="secondary" size="sm" className="flex-shrink-0">
                Manage
              </Button>
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
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(
    null,
  );

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
            <div className="vp-card-in flex items-start gap-3 overflow-hidden">
              <div className="min-w-0 flex-1 overflow-hidden pr-2">
                <Title className="block max-w-full overflow-hidden">
                  <span className="flex min-w-0 max-w-full items-center overflow-hidden">
                    <MarqueeName
                      text={`Hi, ${USER.firstName.split(" ")[0]}`}
                      className="min-w-0 flex-1"
                      fadeColor="rgba(7,11,18,0.96)"
                    />
                  </span>
                </Title>
                <Subtitle>
                  {getGreeting()}.{" "}
                  {mode === "learner"
                    ? "Continue your lessons"
                    : "Track your books and earnings"}
                </Subtitle>
              </div>

              <div className="flex-shrink-0">
                <ProfileAvatar
                  name={USER.firstName}
                  avatar={USER.avatar}
                  onClick={() => setSidebarOpen(true)}
                />
              </div>
            </div>

            <div className="vp-card-in" style={{ animationDelay: "60ms" }}>
              <SectionLabel>
                {mode === "learner" ? "Your progress" : "Your earnings"}
              </SectionLabel>
              <HeroSlider cards={heroCards} />
            </div>

            <div className="vp-card-in" style={{ animationDelay: "80ms" }}>
              {mode === "learner" ? <LearnerRoadmap /> : <PublisherRoadmap />}
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

            {mode === "learner" ? (
              <AllLessonsSection onSelect={setSelectedLesson} />
            ) : (
              <BooksSection />
            )}
          </div>
        </main>
      </div>

      <MainTab active={activeTab} onTab={setActiveTab} />

      <LessonDetailModal
        open={selectedLesson !== null}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
      />

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

        @keyframes vpPulseRing {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(239, 199, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(239, 199, 0, 0);
          }
        }

        .vp-pulse-ring {
          animation: vpPulseRing 1.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .vp-card-in,
          .vp-pulse-ring {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
