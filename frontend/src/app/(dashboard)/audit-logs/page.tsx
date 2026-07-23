"use client";

import { useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
const PAGE_SIZE = 15;

const ACTION_TYPE_LABELS: Record<string, string> = {
  EMPLOYEE_CREATE: "직원 등록",
  EMPLOYEE_BULK_CREATE: "직원 일괄등록",
  EMPLOYEE_UPDATE: "직원 정보 수정",
  EMPLOYEE_DELETE: "직원 삭제",
  DEPARTMENT_CREATE: "부서 생성",
  DEPARTMENT_UPDATE: "부서 수정",
  DEPARTMENT_DELETE: "부서 삭제",
  PAYROLL_BASE_SALARY_UPDATE: "연봉 정보 변경",
  PAYROLL_BULK_EMPLOYMENT_TYPE: "급여형태 일괄변경",
  PAYROLL_BULK_BASIC_REGISTER: "급여정보 일괄등록",
  APPOINTMENT_CREATE: "인사 발령 등록",
  APPOINTMENT_DELETE: "인사 발령 삭제",
  CERTIFICATE_CREATE: "증명서 신청 등록",
  CERTIFICATE_APPROVE: "증명서 승인",
  CERTIFICATE_REJECT: "증명서 반려",
  CERTIFICATE_ISSUE: "증명서 발급 완료",
  EVENT_SUPPORT_APPROVE: "경조비 승인",
  EVENT_SUPPORT_REJECT: "경조비 반려",
  EVENT_SUPPORT_PAY: "경조비 지급",
  LEAVE_REQUEST_CREATE: "휴가 신청 등록",
  LEAVE_REQUEST_APPROVE: "휴가 승인",
  LEAVE_REQUEST_REJECT: "휴가 반려",
  LEAVE_TYPE_CREATE: "휴가유형 등록",
  LEAVE_BALANCE_GRANT: "휴가 잔여일수 등록",
  LEAVE_POLICY_CREATE: "휴가정책 등록",
  LEAVE_POLICY_DELETE: "휴가정책 삭제",
  NOTICE_CREATE: "공지사항 등록",
  NOTICE_UPDATE: "공지사항 수정",
  NOTICE_DELETE: "공지사항 삭제",
};

const ACTION_TYPE_STYLES: Record<string, string> = {
  EMPLOYEE_CREATE: "bg-emerald-50 text-emerald-700",
  EMPLOYEE_BULK_CREATE: "bg-emerald-50 text-emerald-700",
  EMPLOYEE_UPDATE: "bg-blue-50 text-blue-700",
  EMPLOYEE_DELETE: "bg-rose-50 text-rose-700",
  DEPARTMENT_CREATE: "bg-emerald-50 text-emerald-700",
  DEPARTMENT_UPDATE: "bg-blue-50 text-blue-700",
  DEPARTMENT_DELETE: "bg-rose-50 text-rose-700",
  PAYROLL_BASE_SALARY_UPDATE: "bg-amber-50 text-amber-700",
  PAYROLL_BULK_EMPLOYMENT_TYPE: "bg-amber-50 text-amber-700",
  PAYROLL_BULK_BASIC_REGISTER: "bg-amber-50 text-amber-700",
  APPOINTMENT_CREATE: "bg-emerald-50 text-emerald-700",
  APPOINTMENT_DELETE: "bg-rose-50 text-rose-700",
  CERTIFICATE_CREATE: "bg-emerald-50 text-emerald-700",
  CERTIFICATE_APPROVE: "bg-emerald-50 text-emerald-700",
  CERTIFICATE_REJECT: "bg-rose-50 text-rose-700",
  CERTIFICATE_ISSUE: "bg-blue-50 text-blue-700",
  EVENT_SUPPORT_APPROVE: "bg-emerald-50 text-emerald-700",
  EVENT_SUPPORT_REJECT: "bg-rose-50 text-rose-700",
  EVENT_SUPPORT_PAY: "bg-blue-50 text-blue-700",
  LEAVE_REQUEST_CREATE: "bg-emerald-50 text-emerald-700",
  LEAVE_REQUEST_APPROVE: "bg-emerald-50 text-emerald-700",
  LEAVE_REQUEST_REJECT: "bg-rose-50 text-rose-700",
  LEAVE_TYPE_CREATE: "bg-emerald-50 text-emerald-700",
  LEAVE_BALANCE_GRANT: "bg-amber-50 text-amber-700",
  LEAVE_POLICY_CREATE: "bg-emerald-50 text-emerald-700",
  LEAVE_POLICY_DELETE: "bg-rose-50 text-rose-700",
  NOTICE_CREATE: "bg-emerald-50 text-emerald-700",
  NOTICE_UPDATE: "bg-blue-50 text-blue-700",
  NOTICE_DELETE: "bg-rose-50 text-rose-700",
};

function actionLabel(actionType: string) {
  return ACTION_TYPE_LABELS[actionType] ?? actionType;
}

function actionStyle(actionType: string) {
  return ACTION_TYPE_STYLES[actionType] ?? "bg-gray-100 text-gray-600";
}

interface AuditLogRow {
  auditLogId: number;
  actorId: number | null;
  actorName: string;
  actionType: string;
  targetDescription: string;
  detail: string | null;
  createdAt: string;
}

interface PageData {
  content: AuditLogRow[];
  totalElements: number;
  totalPages: number;
}

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDateTime(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) return value;
  return `${match[1]} ${match[2]}`;
}

export default function AuditLogsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [draftActionType, setDraftActionType] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [actionType, setActionType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionType, from, to]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/audit-logs?page=${page}&size=${PAGE_SIZE}&sort=createdAt,desc`;
      if (actionType) url += `&actionType=${actionType}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setActionType(draftActionType);
    setFrom(draftFrom);
    setTo(draftTo);
    setPage(0);
  };

  const resetFilters = () => {
    setDraftActionType("");
    setDraftFrom("");
    setDraftTo("");
    setActionType("");
    setFrom("");
    setTo("");
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <ClipboardDocumentListIcon className="h-7 w-7 text-gray-400" />
          관리자 활동 로그
        </h1>
        <p className="mt-1 text-sm text-gray-500">직원/부서/급여 등 주요 데이터를 누가, 언제, 무엇을 변경했는지 기록합니다.</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 xl:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
          <label className="space-y-1 text-sm font-semibold text-gray-700">
            <span>액션 유형</span>
            <select
              value={draftActionType}
              onChange={(event) => setDraftActionType(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-700">
            <span>조회 시작일</span>
            <input
              type="date"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-700">
            <span>조회 종료일</span>
            <input
              type="date"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 self-end rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <ArrowPathIcon className="mr-1 inline h-4 w-4" />
            초기화
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="h-10 self-end rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <MagnifyingGlassIcon className="mr-1 inline h-4 w-4" />
            조회
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">활동 내역</h2>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
            총 {data?.totalElements ?? 0}건
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                {["시간", "담당자", "액션 유형", "내용"].map((label) => (
                  <th key={label} className="px-5 py-3 font-semibold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center text-gray-500">활동 로그를 불러오는 중입니다.</td></tr>
              ) : !data || data.content.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-gray-500">조건에 맞는 활동 로그가 없습니다.</td></tr>
              ) : (
                data.content.map((row) => (
                  <tr key={row.auditLogId} className="border-t border-gray-100">
                    <td className="whitespace-nowrap px-5 py-4 text-gray-500">{formatDateTime(row.createdAt)}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">{row.actorName}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionStyle(row.actionType)}`}>
                        {actionLabel(row.actionType)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{row.targetDescription}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4">
            <span className="text-sm text-gray-500">
              {page + 1} / {data.totalPages} 페이지
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
