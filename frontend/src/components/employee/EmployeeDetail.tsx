"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, PencilSquareIcon, TrashIcon, ClockIcon, CurrencyDollarIcon, BuildingOfficeIcon, BriefcaseIcon, IdentificationIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getEmployeeStatusLabel, getEmployeeStatusBadgeClasses } from "@/lib/employeeStatus";
import { EMPLOYEE_DOCUMENT_TYPE_OPTIONS } from "@/components/employee/documentTypes";
import { resolveFileUrl } from "@/lib/fileUrl";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface EmployeeDetailData {
  employeeId: number;
  employeeNo: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  hireDate: string;
  employeeStatusCode: string;
  departmentId: number | null;
  departmentName: string;
  positionId: number | null;
  positionName: string;
  employmentTypeId: number | null;
  employmentTypeName: string;
  managerId: number | null;
  managerName: string | null;
  profileImage: string | null;
}

interface LeaveBalance {
  leaveTypeName: string;
  remainDays: number;
}

type EmployeeDocument = {
  employeeDocumentId: number;
  documentType: string;
  attachmentUrl: string;
  attachmentName: string;
  createdAt: string;
};

function formatTenure(hireDate: string | null) {
  if (!hireDate) return "-";
  const hire = new Date(hireDate);
  if (Number.isNaN(hire.getTime())) return "-";

  const now = new Date();
  let years = now.getFullYear() - hire.getFullYear();
  let months = now.getMonth() - hire.getMonth();
  if (now.getDate() < hire.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "-";

  return `${years}년 ${months}개월`;
}

function formatDays(days: number) {
  return Number.isInteger(days) ? `${days}일` : `${days.toFixed(1)}일`;
}

export default function EmployeeDetail({ employeeId, onEditClick, onDeleteClick, refreshKey, role, onBackClick }: { employeeId: number | null, onEditClick?: (data: EmployeeDetailData) => void, onDeleteClick?: (id: number) => void, refreshKey?: number, role?: string | null, onBackClick?: () => void }) {
  const router = useRouter();
  const [data, setData] = useState<EmployeeDetailData | null>(null);
  const [annualLeaveDays, setAnnualLeaveDays] = useState<number | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchDetail();
      fetchLeaveBalance();
      fetchDocuments();
    } else {
      setData(null);
      setAnnualLeaveDays(null);
      setDocuments([]);
    }
  }, [employeeId, refreshKey]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employeeId}`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch detail", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/leave-balances?employeeId=${employeeId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const balances: LeaveBalance[] = await res.json();
        const annual = balances.find((b) => b.leaveTypeName === "연차");
        setAnnualLeaveDays(annual ? annual.remainDays : null);
      }
    } catch (error) {
      console.error("Failed to fetch leave balance", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/documents`, { headers: authHeaders() });
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch employee documents", error);
    }
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    setUploadingType(documentType);
    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/documents`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (res.ok) {
        await fetchDocuments();
      } else {
        alert("서류 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서류 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingType(null);
    }
  };

  const handleDocumentDelete = async (documentId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employeeId}/documents/${documentId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setDocuments((current) => current.filter((document) => document.employeeDocumentId !== documentId));
      } else {
        alert("서류 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서류 삭제 중 오류가 발생했습니다.");
    }
  };

  if (!employeeId) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-gray-400 p-8">
        <UserIcon className="w-16 h-16 mb-4 text-gray-200" />
        <p>왼쪽 목록에서 직원을 선택해주세요.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex items-center justify-center p-8 text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBackClick && (
            <button onClick={onBackClick} className="lg:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors" aria-label="목록으로 돌아가기">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600 hidden sm:block" />
            직원 상세
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {role === "ADMIN" && (
            <>
              <button onClick={() => onEditClick?.(data)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <PencilSquareIcon className="w-4 h-4" />
                정보 수정
              </button>
              <button onClick={() => onDeleteClick?.(data.employeeId)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-md hover:bg-rose-100 transition-colors">
                <TrashIcon className="w-4 h-4" />
                직원 삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Profile Card */}
        <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-4 sm:p-6 flex flex-col xl:flex-row items-center xl:items-start justify-between mb-6 gap-4 xl:gap-0 text-center xl:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 w-full xl:w-auto">
            {data.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveFileUrl(data.profileImage)} alt={`${data.name} 프로필 사진`} className="w-20 h-20 rounded-full object-cover shadow-md shrink-0" />
            ) : (
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md shrink-0">
                {data.name ? data.name.charAt(0) : '?'}
              </div>
            )}
            <div className="flex flex-col items-center sm:items-start w-full">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{data.name}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border ${getEmployeeStatusBadgeClasses(data.employeeStatusCode)} before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full`}>
                  {getEmployeeStatusLabel(data.employeeStatusCode)}
                </span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><BuildingOfficeIcon className="w-4 h-4 shrink-0" /> {data.departmentName || '-'}</span>
                <span className="flex items-center gap-1.5"><BriefcaseIcon className="w-4 h-4 shrink-0" /> {data.positionName || '-'}</span>
                <span className="flex items-center gap-1.5"><IdentificationIcon className="w-4 h-4 shrink-0" /> {data.employeeNo || '-'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row xl:flex-col gap-2 items-center xl:items-end w-full xl:w-auto justify-center xl:justify-end">
             <div className="text-sm font-bold text-blue-600 bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-50 whitespace-nowrap">
                <span className="text-gray-500 font-medium mr-2">근속 기간</span>
                {formatTenure(data.hireDate)}
             </div>
             {role === "ADMIN" && (
               <div className="text-sm font-bold text-emerald-600 bg-white px-3 py-1.5 rounded-md shadow-sm border border-emerald-50 whitespace-nowrap">
                  <span className="text-emerald-500 font-medium mr-2">잔여 연차</span>
                  {annualLeaveDays !== null ? formatDays(annualLeaveDays) : "-"}
               </div>
             )}
          </div>
        </div>

        {/* Info Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 text-center">기본 정보</h4>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">연락처</span>
                <span className="text-gray-900 font-medium break-all">{data.phone || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">이메일</span>
                <span className="text-gray-900 font-medium break-all">{data.email || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">입사일</span>
                <span className="text-gray-900 font-medium break-all">{data.hireDate ? data.hireDate.substring(0, 10) : '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">주소</span>
                <span className="text-gray-900 font-medium break-words text-left sm:text-right">{data.address || '-'}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 text-center">소속 정보</h4>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">부서</span>
                <span className="text-gray-900 font-medium break-all">{data.departmentName || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">직급</span>
                <span className="text-gray-900 font-medium break-all">{data.positionName || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">고용 형태</span>
                <span className="text-gray-900 font-medium break-all">{data.employmentTypeName || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-500 font-medium">직속 관리자</span>
                <span className="text-gray-900 font-medium break-all">{data.managerName || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="border border-gray-100 rounded-lg overflow-hidden mb-8">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 text-center">첨부 서류</h4>
          </div>
          <div className="p-4 space-y-2">
            {EMPLOYEE_DOCUMENT_TYPE_OPTIONS.map((docType) => {
              const document = documents.find((doc) => doc.documentType === docType.value);
              const uploading = uploadingType === docType.value;
              return (
                <div key={docType.value} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="min-w-0 w-full sm:w-auto flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <p className="text-sm font-bold text-gray-700 sm:w-32 shrink-0">
                      {docType.label} {docType.required ? <b className="text-rose-500">*</b> : null}
                    </p>
                    {document ? (
                      <a
                        href={resolveFileUrl(document.attachmentUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm font-semibold text-blue-600 hover:underline break-all"
                      >
                        {document.attachmentName}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 font-medium">미제출</p>
                    )}
                  </div>
                  {role === "ADMIN" && (
                    <div className="flex shrink-0 items-center gap-2">
                      <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
                        {uploading ? "업로드 중..." : document ? "재업로드" : "파일 선택"}
                        <input
                          type="file"
                          disabled={uploading}
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) void handleDocumentUpload(docType.value, file);
                          }}
                        />
                      </label>
                      {document && (
                        <button
                          type="button"
                          onClick={() => handleDocumentDelete(document.employeeDocumentId)}
                          className="flex items-center justify-center rounded-md border border-gray-300 bg-white p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                          aria-label={`${docType.label} 삭제`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        {role === "ADMIN" && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-3">관련 페이지로 이동</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => router.push(`/attendance/daily?keyword=${encodeURIComponent(data.name)}`)}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-700 font-bold hover:bg-blue-50 transition-colors text-sm"
              >
                <ClockIcon className="w-5 h-5" />
                근태 현황 보기 &gt;
              </button>
              <button
                onClick={() => router.push(`/payroll/basic?keyword=${encodeURIComponent(data.name)}`)}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors text-sm"
              >
                <CurrencyDollarIcon className="w-5 h-5" />
                급여 정보 보기 &gt;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
