"use client";

import { useEffect, useState } from "react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { APPOINTMENT_TYPE_OPTIONS } from "./types";
import Modal, { ModalCancelButton, ModalPrimaryButton } from "@/components/common/Modal";
import SearchableSelect from "@/components/common/SearchableSelect";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

type Option = { label: string; value: string };

const inputClasses = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function AppointmentRegisterModal({ onClose, onSaved }: Props) {
  const [employees, setEmployees] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [appointmentType, setAppointmentType] = useState("TRANSFER");
  const [appointmentDate, setAppointmentDate] = useState(todayString());
  const [effectiveDate, setEffectiveDate] = useState(todayString());
  const [toDepartmentId, setToDepartmentId] = useState("");
  const [toPositionId, setToPositionId] = useState("");
  const [reason, setReason] = useState("");
  const [memo, setMemo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [employeesRes, departmentsRes, positionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/employees?page=0&size=1000`),
          fetch(`${API_BASE_URL}/departments`),
          fetch(`${API_BASE_URL}/positions`),
        ]);
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          setEmployees(
            data.content.map((e: { employeeId: number; name: string; departmentName: string | null; positionName: string | null }) => ({
              label: `${e.name}${e.departmentName ? ` (${e.departmentName}${e.positionName ? ` ${e.positionName}` : ""})` : ""}`,
              value: String(e.employeeId),
            }))
          );
        }
        if (departmentsRes.ok) {
          const data = await departmentsRes.json();
          setDepartments(data.map((d: { departmentId: number; departmentName: string }) => ({ label: d.departmentName, value: String(d.departmentId) })));
        }
        if (positionsRes.ok) {
          const data = await positionsRes.json();
          setPositions(data.map((p: { positionId: number; positionName: string }) => ({ label: p.positionName, value: String(p.positionId) })));
        }
      } catch (err) {
        console.error("Failed to fetch appointment form options", err);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!employeeId || !appointmentType || !appointmentDate || !effectiveDate) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          employeeId: Number(employeeId),
          appointmentType,
          appointmentDate,
          effectiveDate,
          toDepartmentId: toDepartmentId ? Number(toDepartmentId) : null,
          toPositionId: toPositionId ? Number(toPositionId) : null,
          reason: reason || null,
          memo: memo || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "발령 등록에 실패했습니다.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "발령 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      icon={ArrowsRightLeftIcon}
      title="신규 발령 등록"
      onClose={onClose}
      maxWidth="lg"
      as="form"
      onSubmit={handleSubmit}
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalPrimaryButton type="submit" disabled={loading}>
            {loading ? "등록 중..." : "등록"}
          </ModalPrimaryButton>
        </>
      }
    >
            <div>
              <SearchableSelect
                label="대상 직원 *"
                value={employeeId}
                onChange={setEmployeeId}
                options={employees}
                placeholder="이름, 부서, 직급으로 검색"
              />
            </div>

            <div>
              <label className={labelClasses}>발령 유형 *</label>
              <select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} required className={inputClasses}>
                {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>발령일 *</label>
                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>발효일 *</label>
                <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required className={inputClasses} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>변경 후 부서</label>
                <select value={toDepartmentId} onChange={(e) => setToDepartmentId(e.target.value)} className={inputClasses}>
                  <option value="">변경 없음</option>
                  {departments.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>변경 후 직급</label>
                <select value={toPositionId} onChange={(e) => setToPositionId(e.target.value)} className={inputClasses}>
                  <option value="">변경 없음</option>
                  {positions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClasses}>사유</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="발령 사유를 입력하세요" className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>메모</label>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} className={inputClasses} />
            </div>

            {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
    </Modal>
  );
}
