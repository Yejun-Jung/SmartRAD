"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
const FILE_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Props {
  attendanceId: number;
  title: string;
  description?: string;
  initialReason?: string | null;
  initialAttachmentName?: string | null;
  initialAttachmentUrl?: string | null;
  skipLabel?: string;
  onClose: () => void;
  onSaved: (response: { reason: string | null; attachmentUrl: string | null; attachmentName: string | null }) => void;
}

export default function AttendanceReasonModal({
  attendanceId,
  title,
  description,
  initialReason,
  initialAttachmentName,
  initialAttachmentUrl,
  skipLabel = "취소",
  onClose,
  onSaved,
}: Props) {
  const [reason, setReason] = useState(initialReason ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("reason", reason);
      if (file) formData.append("attachment", file);
      const res = await fetch(`${API_BASE_URL}/attendances/${attendanceId}/reason`, {
        method: "PATCH",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "사유 저장에 실패했습니다.");
      }
      const saved = (await res.json()) as { reason: string | null; attachmentUrl: string | null; attachmentName: string | null };
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "사유 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block text-sm font-medium text-gray-700">
            사유
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="사유를 입력해주세요."
              className="mt-1 block w-full resize-none rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            첨부파일 <span className="font-normal text-gray-400">(선택)</span>
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border file:border-gray-200 file:bg-gray-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-600 hover:file:bg-gray-100"
            />
            {!file && initialAttachmentName && (
              <p className="mt-1 text-xs text-gray-400">
                등록된 파일:{" "}
                {initialAttachmentUrl ? (
                  <a href={`${FILE_ORIGIN}${initialAttachmentUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {initialAttachmentName}
                  </a>
                ) : (
                  initialAttachmentName
                )}
              </p>
            )}
          </label>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {skipLabel}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="rounded-md bg-[#4A5DDF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "저장 중..." : "제출"}
          </button>
        </div>
      </div>
    </div>
  );
}
