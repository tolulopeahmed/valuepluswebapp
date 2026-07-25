"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// The one core course every learner is auto-enrolled into — seeded via
// `python manage.py seed_academy_curriculum` (server/apps/academy).
const CORE_COURSE_SLUG = "az-of-publishing";

// "Level" has no backend field — it's purely a presentational bucket
// derived from total_xp, same relationship the old mock data implied
// (xp: 2340 -> level: 4, nextLevelXp: 3000).
const XP_PER_LEVEL = 750;

export function deriveLevel(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const nextLevelXp = level * XP_PER_LEVEL;
  return { level, nextLevelXp };
}

export interface StudentBadge {
  id: number;
  badge_name: string;
  badge_description: string;
  badge_icon: string | null;
  created_at: string;
}

export interface StudentProfile {
  total_xp: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_streak_date: string | null;
  earned_badges: StudentBadge[];
  streak_at_risk: boolean;
}

export function useStudentProfile() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<StudentProfile>("/academy/profile/");
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Fetching on mount/auth-change — see the identical note in
    // useMyBooks.ts for why this is the correct, safe shape despite the
    // lint rule flagging refetch()'s synchronous loading-state reset.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { profile, loading, refetch };
}

export interface AcademyLesson {
  id: string;
  title: string;
  content_type: "text" | "video" | "quiz" | "audio";
  body: string;
  action_tip: string;
  estimated_minutes: number;
  xp_reward: number;
  display_order: number;
  is_completed: boolean;
}

export interface AcademyModule {
  id: number;
  title: string;
  display_order: number;
  lessons: AcademyLesson[];
}

export interface CoreCourse {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  cover_image: string | null;
  level: string;
  total_xp: number;
  modules: AcademyModule[];
  is_enrolled: boolean;
  progress_percent: number;
}

export function useCoreCourse() {
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<CoreCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setCourse(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data = await apiFetch<CoreCourse>(`/academy/courses/${CORE_COURSE_SLUG}/`);
      // Every learner is transparently enrolled on first visit — the
      // frontend has never had an explicit "enroll" step, so preserve
      // that by doing it here instead of gating the UI on it.
      if (!data.is_enrolled) {
        await apiFetch(`/academy/courses/${CORE_COURSE_SLUG}/enroll/`, { method: "POST" });
        data = await apiFetch<CoreCourse>(`/academy/courses/${CORE_COURSE_SLUG}/`);
      }
      setCourse(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your curriculum.");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { course, loading, error, refetch };
}

export interface CompleteLessonResult {
  lesson_completed: boolean;
  xp_earned: number;
  course_progress_percent: number;
  student_profile: StudentProfile;
}

export function completeLesson(lessonId: string) {
  return apiFetch<CompleteLessonResult>(`/academy/lessons/${lessonId}/complete/`, {
    method: "POST",
  });
}
