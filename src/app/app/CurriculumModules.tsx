// app/(app)/components/CurriculumModules.tsx

"use client";

import { ProgressRoadmap, type RoadmapItem } from "./CurriculumRoadmap";

export interface ModuleItem {
  id: number;
  module: string;
  title: string;
  description: string;
  actionTip: string;
  xp: number;
  duration: string;
  progress: number;
}

export const MODULES: ModuleItem[] = [
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

export function getCurrentModule(modules: ModuleItem[] = MODULES) {
  return modules.find((m) => m.progress > 0 && m.progress < 100) ?? modules[0];
}

export function getModuleXpEarned(module: ModuleItem) {
  return Math.round((module.xp * module.progress) / 100);
}

export function LearnerRoadmap() {
  const items: RoadmapItem[] = MODULES.map((m) => ({
    id: m.id,
    label: m.title.split(" ").slice(0, 2).join(" "),
    status: m.progress === 100 ? "done" : m.id === 3 ? "current" : "upcoming",
  }));

  return <ProgressRoadmap items={items} />;
}
