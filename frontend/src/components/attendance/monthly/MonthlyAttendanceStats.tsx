import { ArrowTrendingUpIcon, BoltIcon, CalendarDaysIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import type { MonthlyViewData } from "./monthlyAttendanceTypes";

export default function MonthlyAttendanceStats({ data, loading }: { data: MonthlyViewData | null; loading: boolean }) {
  const overtime = data?.averageOvertimeMinutes;
  const attendanceRate = data?.attendanceRate;
  const cards = [
    { label: "총 근무일수", value: loading ? "-" : `${data?.workdayCount ?? 0}일`, icon: CalendarDaysIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "평균 출근율", value: loading || attendanceRate === null || attendanceRate === undefined ? "-" : `${attendanceRate}%`, icon: ArrowTrendingUpIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "총 지각건수", value: loading ? "-" : `${data?.lateCount ?? 0}건`, icon: ClockIcon, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "총 결근건수", value: loading ? "-" : `${data?.absentCount ?? 0}건`, icon: ExclamationCircleIcon, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "평균 초과근무", value: loading || overtime === null || overtime === undefined ? "-" : `${(overtime / 60).toFixed(1)}h`, icon: BoltIcon, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.color}`}><Icon className="h-6 w-6" /></div><div className="min-w-0"><p className="text-sm font-medium text-gray-500">{card.label}</p><p className="mt-1 whitespace-nowrap text-xl font-bold text-gray-900 sm:text-2xl">{card.value}</p></div></div>; })}</div>;
}
