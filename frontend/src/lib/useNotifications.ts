"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
const POLL_INTERVAL_MS = 30000;

export interface NotificationItem {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationPage {
  content: NotificationItem[];
}

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/me/unread-count`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = (await res.json()) as { unreadCount: number };
      setUnreadCount(data.unreadCount);
    } catch {
      /* ignore polling errors */
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/me?page=0&size=15`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = (await res.json()) as NotificationPage;
      setNotifications(data.content ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = window.setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchUnreadCount]);

  const ensureLoaded = useCallback(() => {
    if (!loadedRef.current) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: number) => {
    setNotifications((items) => items.map((item) => (item.notificationId === notificationId ? { ...item, read: true } : item)));
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: "PATCH", headers: authHeaders() });
    } catch {
      /* ignore */
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await fetch(`${API_BASE_URL}/notifications/me/read-all`, { method: "PATCH", headers: authHeaders() });
    } catch {
      /* ignore */
    }
  }, []);

  return { notifications, unreadCount, loading, fetchNotifications, ensureLoaded, markAsRead, markAllAsRead };
}
