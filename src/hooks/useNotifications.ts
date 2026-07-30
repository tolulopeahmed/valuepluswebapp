"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface AppNotification {
  id: string;
  category: "transaction" | "kyc" | "system";
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<AppNotification[]>("/notifications/mine/");
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { notifications, loading, refetch };
}

// Polled rather than fetched once — there's no websocket/push channel for
// notifications yet, so this is how the bell badge on the header notices
// a new one landed without the user having to reload the page.
const POLL_INTERVAL_MS = 45_000;

export function useUnreadNotificationCount() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    try {
      const data = await apiFetch<{ count: number }>(
        "/notifications/unread-count/",
      );
      setCount(data.count);
    } catch {
      // Leave the last-known count on a transient failure rather than
      // flashing the badge to 0.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    if (!isAuthenticated) return;
    const interval = setInterval(refetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch, isAuthenticated]);

  return { count, refetch };
}

// Called when the user opens the Notifications page — clears the bell
// badge without the frontend needing to track/send individual ids.
export function markAllNotificationsRead() {
  return apiFetch<{ marked: boolean }>("/notifications/mark-read/", {
    method: "POST",
  });
}
