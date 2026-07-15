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
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export const dashboardMenuGroups = [
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
