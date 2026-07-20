"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

interface AttendanceResponse {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  workDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workMinutes: number | null;
  attendanceStatusCode: string;
}

interface ErrorResponse {
  code: string;
  message: string;
}

const STATUS_LABEL: Record<string, string> = {
  NORMAL: "정상",
  LATE: "지각",
  EARLY_LEAVE: "조퇴",
  ABSENT: "결근",
};

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getEmployeeId(): number | null {
  const raw = window.localStorage.getItem("employeeId") ?? window.sessionStorage.getItem("employeeId");
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function formatTime(value: string | null) {
  if (!value) return "-";
  return value.slice(11, 16);
}

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatClock(value: Date) {
  return value.toLocaleTimeString("ko-KR", { hour12: false });
}

export default function SelfAttendancePage() {
  const [today] = useState(todayString());
  const [now, setNow] = useState(() => new Date());
  const [record, setRecord] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = async () => {
    setError(null);
    const employeeId = getEmployeeId();
    if (employeeId == null) {
      setError("로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/attendances?date=${today}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("오늘의 근태 정보를 불러오지 못했습니다.");
      const data = (await res.json()) as AttendanceResponse[];
      setRecord(data.find((item) => item.employeeId === employeeId) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오늘의 근태 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/attendances/check-in`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body: ErrorResponse = await res.json();
        throw new Error(body.message || "출근 체크에 실패했습니다.");
      }
      await fetchToday();
    } catch (err) {
      setError(err instanceof Error ? err.message : "출근 체크에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/attendances/check-out`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body: ErrorResponse = await res.json();
        throw new Error(body.message || "퇴근 체크에 실패했습니다.");
      }
      await fetchToday();
    } catch (err) {
      setError(err instanceof Error ? err.message : "퇴근 체크에 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  const checkedIn = record?.checkInTime != null;
  const checkedOut = record?.checkOutTime != null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">내 근태 체크</h1>
        <p className="mt-1 text-sm text-slate-500">{today} 오늘의 출퇴근을 기록합니다.</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">불러오는 중...</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <ClockIcon className="h-8 w-8" />
            </div>

            <p className="font-mono text-4xl font-extrabold tracking-wide text-slate-900" aria-live="polite">
              {formatClock(now)}
            </p>

            <div className="grid w-full max-w-md grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-400">출근 시간</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatTime(record?.checkInTime ?? null)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-400">퇴근 시간</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatTime(record?.checkOutTime ?? null)}</p>
              </div>
            </div>

            {record && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                  record.attendanceStatusCode === "NORMAL"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-orange-50 text-orange-600 ring-orange-200"
                }`}
              >
                {STATUS_LABEL[record.attendanceStatusCode] ?? record.attendanceStatusCode}
              </span>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {error}
              </p>
            )}

            <div className="flex w-full max-w-md gap-3">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={processing || checkedIn}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                {checkedIn ? "출근 완료" : processing ? "처리 중..." : "출근하기"}
              </button>
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={processing || !checkedIn || checkedOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                {checkedOut ? "퇴근 완료" : processing ? "처리 중..." : "퇴근하기"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
