"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { 
  UsersIcon, 
  HomeIcon, 
  UserPlusIcon, 
  ArrowPathIcon, 
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  BanknotesIcon,
  MegaphoneIcon
} from "@heroicons/react/24/outline";

const menuGroups = [
  {
    title: "메인",
    items: [
      { name: "대시보드", href: "/dashboard", icon: HomeIcon }
    ]
  },
  {
    title: "인사 관리",
    items: [
      { name: "직원 목록 조회", href: "/employees", icon: UsersIcon },
      { name: "신규 직원 등록", href: "/employees/new", icon: UserPlusIcon },
      { name: "인사 발령 관리", href: "/appointments", icon: ArrowPathIcon },
      { name: "제증명서 관리", href: "/certificates", icon: DocumentTextIcon },
    ]
  },
  {
    title: "근태 및 휴가 관리",
    items: [
      { name: "일일 근태 현황", href: "/attendance/daily", icon: ClockIcon },
      { name: "월간 근태 통계", href: "/attendance/monthly", icon: ChartBarIcon },
      { name: "휴가 승인/관리", href: "/leave/approve", icon: CheckBadgeIcon },
      { name: "휴가 사용 현황", href: "/leave/status", icon: CalendarIcon },
    ]
  },
  {
    title: "급여 관리",
    items: [
      { name: "급여 기본정보 관리", href: "/payroll/basic", icon: CurrencyDollarIcon },
      { name: "급여 계산", href: "/payroll/calculate", icon: CalculatorIcon },
      { name: "급여 지급 처리", href: "/payroll/process", icon: BanknotesIcon },
    ]
  },
  {
    title: "사내 소통",
    items: [
      { name: "공지사항 관리", href: "/notices", icon: MegaphoneIcon },
    ]
  }
];

export default function DashboardSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.name.includes(searchQuery))
  })).filter(group => group.items.length > 0);

  return (
    <aside className="w-64 bg-[#0B1120] text-gray-300 min-h-screen flex flex-col hidden md:flex fixed h-full">
      <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
        <span className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-xl font-bold text-white tracking-wide">SmartHR</span>
        </span>
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto dark-scrollbar pb-24">
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="메뉴 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A2234] border border-gray-700 rounded-md py-2 px-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-4">
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx} className={groupIdx === 0 && group.title === "메인" ? "mb-6" : "mb-6"}>
              {group.title !== "메인" && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={itemIdx} 
                      href={item.href} 
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive 
                          ? "bg-[#1A2234] text-white border-l-2 border-blue-500" 
                          : "hover:bg-[#1A2234] hover:text-white"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-blue-500" : ""}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t border-gray-800 p-4 absolute bottom-0 w-64 bg-[#0B1120] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            관
          </div>
          <div>
            <p className="text-sm font-medium text-white">시스템 관리자</p>
            <p className="text-xs text-gray-400">admin@smarthr.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
