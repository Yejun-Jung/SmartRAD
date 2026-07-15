import { BellIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function DashboardHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0">
      <div>
        <h1 className="text-xl font-bold text-gray-900">직원 목록 조회</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <span>홈</span>
          <span>&gt;</span>
          <span>인사 관리</span>
          <span>&gt;</span>
          <span className="text-blue-600 font-medium">직원 목록 조회</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
          <BellIcon className="w-5 h-5" />
        </button>
        <button className="flex items-center gap-2 bg-[#4A5DDF] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
          <UserPlusIcon className="w-4 h-4" />
          직원 등록
        </button>
      </div>
    </header>
  );
}
