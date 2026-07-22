"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNotifications, type NotificationItem } from "@/lib/useNotifications";

function relativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return value.substring(0, 10);
}

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const handleSelect = (notification: NotificationItem) => {
    if (!notification.read) markAsRead(notification.notificationId);
    setOpen(false);
    if (notification.linkUrl) router.push(notification.linkUrl);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="알림"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-bold text-gray-900">알림</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={() => markAllAsRead()} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                모두 읽음으로 표시
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">불러오는 중...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">새로운 알림이 없습니다.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.notificationId}
                  onClick={() => handleSelect(notification)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-gray-50 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 ${notification.read ? "" : "bg-blue-50/50"}`}
                >
                  <div className="flex w-full items-center gap-1.5">
                    {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />}
                    <span className={`text-sm ${notification.read ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>{notification.title}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-gray-400">{relativeTime(notification.createdAt)}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-gray-500">{notification.content}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
