"use client";

import { useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Modal, { ModalCancelButton, ModalPrimaryButton } from "@/components/common/Modal";
import type { Department } from "./DepartmentModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Props {
  department: Department;
  departments: Department[];
  onClose: () => void;
  onDeleted: () => void;
}

export default function DepartmentDeleteModal({ department, departments, onClose, onDeleted }: Props) {
  const [employees, setEmployees] = useState<{ employeeId: number; name: string }[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [targetDepartmentId, setTargetDepartmentId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await fetch(`${API_BASE_URL}/employees?departmentId=${department.departmentId}&size=1000`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setEmployees(data.content || []);
        }
      } catch (err) {
        console.error("Failed to fetch department employees", err);
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    };
    fetchEmployees();
    return () => {
      cancelled = true;
    };
  }, [department.departmentId]);

  const targetOptions = departments.filter((d) => d.departmentId !== department.departmentId);
  const hasEmployees = employees.length > 0;

  const handleDelete = async () => {
    if (hasEmployees && !targetDepartmentId) {
      setError("이동할 부서를 선택해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const params = hasEmployees ? `?reassignToDepartmentId=${targetDepartmentId}` : "";
      const res = await fetch(`${API_BASE_URL}/departments/${department.departmentId}${params}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "부서를 삭제할 수 없습니다.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      icon={ExclamationTriangleIcon}
      iconColor="rose"
      title="부서 삭제"
      subtitle={`"${department.departmentName}" 부서를 삭제합니다.`}
      onClose={onClose}
      footer={
        <>
          <ModalCancelButton onClick={onClose} disabled={saving} />
          <ModalPrimaryButton
            tone="rose"
            onClick={handleDelete}
            disabled={saving || loadingEmployees || (hasEmployees && !targetDepartmentId)}
          >
            {saving ? "삭제 중..." : "삭제"}
          </ModalPrimaryButton>
        </>
      }
    >
      {loadingEmployees ? (
        <p className="text-sm text-gray-500">소속 직원 정보를 확인하는 중입니다...</p>
      ) : hasEmployees ? (
        <>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            이 부서에 소속된 직원이 <b>{employees.length}명</b> 있습니다. 삭제하려면 이동할 부서를 선택해주세요.
          </div>
          <div className="max-h-28 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
            {employees.map((employee) => employee.name).join(", ")}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">
              이동할 부서 <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetDepartmentId}
              onChange={(event) => setTargetDepartmentId(event.target.value === "" ? "" : Number(event.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">부서를 선택하세요</option>
              {targetOptions.map((option) => (
                <option key={option.departmentId} value={option.departmentId}>
                  {option.departmentName}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600">정말로 이 부서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
      )}

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">{error}</div>}
    </Modal>
  );
}
