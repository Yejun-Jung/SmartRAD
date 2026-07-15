"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  ClockIcon,
  CheckBadgeIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

interface Notice {
  noticeId: number;
  writerName: string;
  title: string;
  pinned: boolean;
  createdAt: string;
}

interface Summary {
  totalEmployees: number;
  todayAttendance: number;
  pendingLeaveRequests: number;
  totalNotices: number;
}

function getAuthToken() {
  return (
    window.localStorage.getItem("accessToken") ??
    window.sessionStorage.getItem("accessToken")
  );
}

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = getAuthToken();
      const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const [employeesRes, attendanceRes, leaveRes, noticesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/employees?page=0&size=1`),
          fetch(`${API_BASE_URL}/attendances?date=${todayString()}`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/leave-requests?status=PENDING`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/notices?page=0&size=5`, { headers: authHeaders }),
        ]);

        const employees = employeesRes.ok ? await employeesRes.json() : { totalElements: 0 };
        const attendance = attendanceRes.ok ? await attendanceRes.json() : [];
        const leaveRequests = leaveRes.ok ? await leaveRes.json() : [];
        const noticePage = noticesRes.ok ? await noticesRes.json() : { content: [], totalElements: 0 };

        setSummary({
          totalEmployees: employees.totalElements ?? 0,
          todayAttendance: Array.isArray(attendance) ? attendance.length : 0,
          pendingLeaveRequests: Array.isArray(leaveRequests) ? leaveRequests.length : 0,
          totalNotices: noticePage.totalElements ?? 0,
        });
        setNotices(noticePage.content ?? []);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const stats = [
    {
      label: "전체 직원",
      value: summary ? `${summary.totalEmployees}명` : "-",
      icon: UsersIcon,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "오늘 출근 인원",
      value: summary ? `${summary.todayAttendance}명` : "-",
      icon: ClockIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "휴가 승인 대기",
      value: summary ? `${summary.pendingLeaveRequests}건` : "-",
      icon: CheckBadgeIcon,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "등록된 공지사항",
      value: summary ? `${summary.totalNotices}건` : "-",
      icon: MegaphoneIcon,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">최근 공지사항</h2>
          <Link href="/notices" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            전체보기 &gt;
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="text-center py-10 text-gray-500">로딩 중...</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-10 text-gray-500">등록된 공지사항이 없습니다.</div>
          ) : (
            notices.map((notice) => (
              <div key={notice.noticeId} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notice.pinned && (
                    <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">고정</span>
                  )}
                  <span className="font-medium text-gray-900">{notice.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{notice.writerName}</span>
                  <span>{notice.createdAt.substring(0, 10)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
