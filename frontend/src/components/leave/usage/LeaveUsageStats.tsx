import { CalendarDaysIcon, CheckBadgeIcon, ClipboardDocumentCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import type { UsageSummary } from "./leaveUsageTypes";
import { formatDays } from "./leaveUsageUtils";

export default function LeaveUsageStats({ summary, loading }: { summary: UsageSummary; loading: boolean }) { const cards = [
  { label: "전체 직원", value: `${summary.employeeCount}명`, note: "전체 직원 기준", icon: UserGroupIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "전체 연차 지급", value: `${formatDays(summary.totalGranted)}일`, note: "현재 잔액 합계", icon: CalendarDaysIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "전체 연차 사용", value: `${formatDays(summary.totalUsed)}일`, note: `사용률 ${summary.usageRate}%`, icon: ClipboardDocumentCheckIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "전체 연차 잔여", value: `${formatDays(summary.totalRemaining)}일`, note: `잔여율 ${summary.remainingRate}%`, icon: CheckBadgeIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
]; return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:gap-4">{cards.map((card) => { const Icon=card.icon; return <div key={card.label} className="flex min-w-0 items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><div className="min-w-0"><p className="text-sm font-medium text-gray-500">{card.label}</p><p className="mt-2 whitespace-nowrap text-2xl font-bold text-gray-900 sm:text-3xl">{loading ? "-" : card.value}</p><p className="mt-1 truncate text-xs text-gray-400">{loading ? "" : card.note}</p></div><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.bg} ${card.color}`}><Icon className="h-6 w-6" /></div></div>; })}</div>; }
