// src/app/app/page.tsx

"use client";

import { useState } from "react";
import SectionLabel from "../../components/SectionLabel";
import QuickActions from "../../components/QuickActions";
import Title from "../../components/Title";
import Subtitle from "../../components/Subtitle";
import MarqueeName from "../../components/MarqueeName";
import HeroCards from "./HeroCards";
// import SidePanel from "./SidePanel";
import Transactions from "../../components/Transactions";
import { useAppShell } from "./AppShellContext";
import { USER } from "./MockUser";
import {
  MODULES,
  getCurrentModule,
  getModuleXpEarned,
  LearnerRoadmap,
} from "./CurriculumModules";
import { BOOKS, BooksSection, PublisherRoadmap } from "./PublisherBooks";
import LessonDetailModal, {
  type LessonDetail,
} from "../../components/LessonDetailsModal";
import Image from "next/image";

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
      className="relative shrink-0 rounded-full transition-transform active:scale-95"
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

export default function HomeScreen() {
  const { mode, setSidebarOpen } = useAppShell();
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(
    null,
  );

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

        <div className="shrink-0">
          <ProfileAvatar
            name={USER.firstName}
            avatar={USER.avatar}
            onClick={() => setSidebarOpen(true)}
          />
        </div>
      </div>

      <SectionLabel style={{ marginBottom: -15, fontFamily: "PP Telegraf" }}>
        MY PROGRESS
      </SectionLabel>

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
        {mode === "learner" ? (
          <LearnerRoadmap onSelect={setSelectedLesson} />
        ) : (
          <PublisherRoadmap />
        )}
      </div>

      {/*
        Quick actions and recent transactions share a row on desktop, where
        there's enough width for two columns — they stack on mobile instead.
      */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {/* <div
          className="vp-card-in md:col-span-1"
          style={{ animationDelay: "140ms" }}
        >
          <SidePanel mode={mode} />
        </div> */}

        <div className="vp-card-in" style={{ animationDelay: "100ms" }}>
          <SectionLabel>Quick actions</SectionLabel>
          <QuickActions
            mode={mode}
            onNavigate={(dest) => console.log("navigate:", dest)}
          />
        </div>

        <div className="vp-card-in" style={{ animationDelay: "140ms" }}>
          <Transactions />
        </div>
      </div>

      {mode === "publisher" && <BooksSection />}

      <LessonDetailModal
        open={selectedLesson !== null}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
      />
    </>
  );
}
