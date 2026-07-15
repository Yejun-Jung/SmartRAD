"use client";

import { useEffect, useState } from "react";
import { UserIcon, PencilSquareIcon, TrashIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon, BuildingOfficeIcon, BriefcaseIcon, IdentificationIcon } from "@heroicons/react/24/outline";

interface EmployeeDetailData {
  employeeId: number;
  employeeNo: string;
  name: string;
  email: string;
  phone: string;
  hireDate: string;
  employeeStatusCode: string;
  departmentId: number | null;
  departmentName: string;
  positionId: number | null;
  positionName: string;
  employmentTypeId: number | null;
  employmentTypeName: string;
}

export default function EmployeeDetail({ employeeId, onEditClick, onDeleteClick }: { employeeId: number | null, onEditClick?: (data: EmployeeDetailData) => void, onDeleteClick?: (id: number) => void }) {
  const [data, setData] = useState<EmployeeDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchDetail();
    } else {
      setData(null);
    }
  }, [employeeId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/${employeeId}`);
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
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-blue-600" />
          직원 상세
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => onEditClick?.(data)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <PencilSquareIcon className="w-4 h-4" />
            정보 수정
          </button>
          <button onClick={() => onDeleteClick?.(data.employeeId)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-md hover:bg-rose-100 transition-colors">
            <TrashIcon className="w-4 h-4" />
            직원 삭제
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Profile Card */}
        <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-6 flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
              {data.name ? data.name.charAt(0) : '?'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{data.name}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border ${data.employeeStatusCode === 'ACTIVE' ? 'border-emerald-200 text-emerald-600 before:bg-emerald-500' : 'border-gray-200 text-gray-600 before:bg-gray-400'} before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full`}>
                  {data.employeeStatusCode === 'ACTIVE' ? '재직중' : data.employeeStatusCode}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><BuildingOfficeIcon className="w-4 h-4" /> {data.departmentName || '-'}</span>
                <span className="flex items-center gap-1.5"><BriefcaseIcon className="w-4 h-4" /> {data.positionName || '-'}</span>
                <span className="flex items-center gap-1.5"><IdentificationIcon className="w-4 h-4" /> {data.employeeNo || '-'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
             <div className="text-sm font-bold text-blue-600 bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-50">
                <span className="text-gray-500 font-medium mr-2">근속 기간</span> 
                {/* Dummy duration */} 3년 4개월
             </div>
             <div className="text-sm font-bold text-emerald-600 bg-white px-3 py-1.5 rounded-md shadow-sm border border-emerald-50 mt-2">
                <span className="text-emerald-500 font-medium mr-2">잔여 연차</span> 
                {/* Dummy leave */} 12일
             </div>
          </div>
        </div>

        {/* Info Grids */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 text-center">기본 정보</h4>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">연락처</span>
                <span className="text-gray-900 font-medium">{data.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">이메일</span>
                <span className="text-gray-900 font-medium">{data.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">입사일</span>
                <span className="text-gray-900 font-medium">{data.hireDate ? data.hireDate.substring(0, 10) : '-'}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 text-center">소속 정보</h4>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">부서</span>
                <span className="text-gray-900 font-medium">{data.departmentName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">직급</span>
                <span className="text-gray-900 font-medium">{data.positionName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">고용 형태</span>
                <span className="text-gray-900 font-medium">{data.employmentTypeName || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 mb-3">관련 페이지로 이동</h4>
          <div className="grid grid-cols-3 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-700 font-bold hover:bg-blue-50 transition-colors text-sm">
              <ClockIcon className="w-5 h-5" />
              근태 현황 보기 &gt;
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors text-sm">
              <CurrencyDollarIcon className="w-5 h-5" />
              급여 정보 보기 &gt;
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-orange-200 bg-orange-50/50 text-orange-700 font-bold hover:bg-orange-50 transition-colors text-sm">
              <DocumentTextIcon className="w-5 h-5" />
              증명서 발급 &gt;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
