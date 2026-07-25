// app/(app)/components/CurriculumModules.tsx

"use client";

import { useCoreCourse, type CoreCourse } from "../../hooks/useAcademy";
import { ProgressRoadmap, type RoadmapItem } from "./CurriculumRoadmap";
import type {
  LessonDetail,
  LessonStatus,
} from "../../components/LessonDetailsModal";

export interface ModuleItem {
  id: number;
  lessonId: string;
  module: string;
  title: string;
  description: string;
  actionTip: string;
  xp: number;
  duration: string;
  progress: number;
}

// Course.modules -> ModuleItem[]. The seed data gives every module
// exactly one lesson, so a "module" and its lesson are 1:1 here — real
// per-lesson completion is binary (is_completed), so progress is always
// 0 or 100, never the partial values the old mock used.
export function courseToModules(course: CoreCourse | null): ModuleItem[] {
  if (!course) return [];

  return course.modules.map((m, i) => {
    const lesson = m.lessons[0];
    return {
      id: m.id,
      lessonId: lesson?.id ?? "",
      module: `Module ${String(i + 1).padStart(2, "0")}`,
      title: lesson?.title ?? m.title,
      description: lesson?.body ?? "",
      actionTip: lesson?.action_tip ?? "",
      xp: lesson?.xp_reward ?? 0,
      duration: lesson ? `${lesson.estimated_minutes} min` : "",
      progress: lesson?.is_completed ? 100 : 0,
    };
  });
}

// "Current" = the first not-yet-completed module (what a learner should
// resume next); once everything is done, stick on the last one.
export function getCurrentModule(modules: ModuleItem[]): ModuleItem | null {
  if (modules.length === 0) return null;
  return modules.find((m) => m.progress < 100) ?? modules[modules.length - 1];
}

export function getModuleXpEarned(module: ModuleItem) {
  return Math.round((module.xp * module.progress) / 100);
}

function moduleStatus(m: ModuleItem, currentId: number | null): LessonStatus {
  if (m.progress === 100) return "done";
  if (m.id === currentId) return "current";
  return "upcoming";
}

// One real fetch (+ auto-enroll) per mount, shared by every consumer that
// needs the learner's curriculum — HomeScreen, LearnPage.
export function useLearnerCurriculum() {
  const { course, loading, error, refetch } = useCoreCourse();
  const modules = courseToModules(course);
  const current = getCurrentModule(modules);
  const currentXpEarned = current ? getModuleXpEarned(current) : 0;

  return { modules, current, currentXpEarned, loading, error, refetch };
}

export function LearnerRoadmap({
  modules,
  currentId,
  onSelect,
}: {
  modules: ModuleItem[];
  currentId: number | null;
  onSelect?: (lesson: LessonDetail) => void;
}) {
  const items: RoadmapItem[] = modules.map((m) => ({
    id: m.id,
    label: m.title,
    status: moduleStatus(m, currentId),
    progress: m.progress,
  }));

  const handleSelect = (id: string | number) => {
    if (!onSelect) return;

    const index = modules.findIndex((m) => m.id === id);
    const m = modules[index];
    if (!m) return;

    onSelect({
      index: index + 1,
      total: modules.length,
      moduleLabel: m.module,
      title: m.title,
      description: m.description,
      actionTip: m.actionTip,
      xp: m.xp,
      status: moduleStatus(m, currentId),
      lessonId: m.lessonId,
    });
  };

  return <ProgressRoadmap items={items} onSelect={handleSelect} />;
}
