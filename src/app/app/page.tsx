// src/app/app/page.tsx

"use client";

import SectionLabel from "../../components/SectionLabel";
import QuickActions from "../../components/QuickActions";
import Title from "../../components/Title";
import Subtitle from "../../components/Subtitle";
import MarqueeName from "../../components/MarqueeName";
import GlassCard from "./GlassCard";
import HeroCards from "./HeroCards";
import { useAppShell } from "./AppShellContext";
import { USER } from "./MockUser";
import {
  MODULES,
  getCurrentModule,
  getModuleXpEarned,
  LearnerRoadmap,
} from "./CurriculumModules";
import {
  BOOKS,
  RECENT_SALES,
  LEADERBOARD,
  BooksSection,
  PublisherRoadmap,
  type LeaderboardEntry,
} from "./PublisherBooks";
import Image from "next/image";

type Mode = "learner" | "publisher";

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
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
};

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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
        <Image
          src={avatar}
          alt={name}
          className="h-16 w-16 rounded-full border-2 object-cover md:h-14 md:w-14"
          style={{ borderColor: "rgb(var(--vp-accent-rgb))" }}
        />
      ) : (
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 text-base font-black text-white md:h-14 md:w-14"
          style={{
            borderColor: "rgb(var(--vp-accent-rgb))",
            background: "linear-gradient(145deg, #3a4763, #232e47)",
          }}
        >
          {initial}
        </div>
      )}
    </button>
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
                  ? "bg-[rgb(var(--vp-accent-rgb))] shadow-[0_0_12px_rgba(var(--vp-accent-rgb),0.4)]"
                  : "bg-white/[0.08]"
              }`}
              style={{ height: `${18 + i * 9}%` }}
            />
            <span
              className={`text-[0.4rem] font-black uppercase ${
                i === activeIndex
                  ? "text-[rgb(var(--vp-accent-rgb))]"
                  : "text-white/25"
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

function SidePanel({ mode }: { mode: Mode }) {
  if (mode === "learner") {
    return (
      <GlassCard className="p-4">
        <SectionLabel>Leaderboard</SectionLabel>

        <div className="flex flex-col gap-2.5">
          {LEADERBOARD.map((entry: LeaderboardEntry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${
                entry.isYou ? "bg-[rgba(var(--vp-accent-rgb),0.08)]" : ""
              }`}
            >
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[0.62rem] font-black ${
                  entry.rank === 1
                    ? "bg-[rgb(var(--vp-accent-rgb))] text-[#171100]"
                    : "bg-white/[0.08] text-white/50"
                }`}
              >
                {entry.rank}
              </span>

              <span
                className={`flex-1 truncate text-[0.72rem] font-black ${
                  entry.isYou
                    ? "text-[rgb(var(--vp-accent-rgb))]"
                    : "text-white/75"
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
  const { mode, setSidebarOpen } = useAppShell();

  const currentModule = getCurrentModule(MODULES);
  const currentModuleXpEarned = getModuleXpEarned(currentModule);

  const referralStats = {
    totalEarned: 15000,
    referralCount: 3,
    perReferral: 5000,
  };

  const publisherStats = {
    totalEarned: BOOKS.reduce((s, b) => s + b.earned, 0),
    weeklyDelta: 4500,
  };

  return (
    <>
      <div className="vp-card-in flex items-start gap-3 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-hidden pr-2">
          <Title className="block max-w-full overflow-hidden">
            <span className="flex min-w-0 max-w-full items-center overflow-hidden">
              <MarqueeName
                text={`Hi, ${USER.firstName}`}
                className="min-w-0 flex-1"
                fadeColor="rgba(10,14,27,0.96)"
              />
            </span>
          </Title>
          <Subtitle className="text-sm font-medium text-white/70">
            {mode === "learner"
              ? `${getGreeting()}. Continue your lessons.`
              : "Track your books earnings"}
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
        <HeroCards
          mode={mode}
          currentModule={{
            module: currentModule.module,
            title: currentModule.title,
            progress: currentModule.progress,
            duration: currentModule.duration,
            xpEarned: currentModuleXpEarned,
          }}
          referralStats={referralStats}
          publisherStats={publisherStats}
          onResume={() => console.log("Resume clicked")}
          onWithdrawReferral={() => console.log("Withdraw referral clicked")}
          onWithdrawEarnings={() => console.log("Withdraw earnings clicked")}
        />
      </div>

      <div className="vp-card-in" style={{ animationDelay: "80ms" }}>
        {mode === "learner" ? <LearnerRoadmap /> : <PublisherRoadmap />}
      </div>

      <div className="vp-card-in" style={{ animationDelay: "100ms" }}>
        <SectionLabel>Quick actions</SectionLabel>
        <QuickActions
          mode={mode}
          onNavigate={(dest) => console.log("navigate:", dest)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
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
              mode === "learner" ? LEARNER_STAGE_INDEX : PUBLISHER_STAGE_INDEX
            }
            label={
              mode === "learner" ? "Learning momentum" : "Earnings momentum"
            }
          />
        </div>
      </div>

      {mode === "publisher" && <BooksSection />}
    </>
  );
}
