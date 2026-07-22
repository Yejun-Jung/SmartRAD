"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { dashboardMenuGroups } from "@/lib/dashboardMenu";
import { isAdmin } from "@/lib/auth";

const allMenuItems = dashboardMenuGroups.flatMap((group) => group.items);

function isAdminOnlyPath(pathname: string) {
  // Some employee routes are nested below an administrator-only route
  // (e.g. `/certificates/my` under `/certificates`), so prefix matches must
  // resolve to the most specific (longest href) menu item, not just the
  // first one encountered.
  const matches = allMenuItems.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (matches.length === 0) return false;
  const mostSpecific = matches.reduce((longest, item) => (item.href.length > longest.href.length ? item : longest));
  return mostSpecific.adminOnly;
}

export default function RoleGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isAdminOnlyPath(pathname) && !isAdmin()) {
      setBlocked(true);
      router.replace("/dashboard");
    } else {
      setBlocked(false);
    }
  }, [pathname, router]);

  if (!blocked) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">접근 권한이 없습니다</h2>
        <p className="mt-2 text-sm text-slate-500">관리자만 접근할 수 있는 페이지입니다.</p>
      </div>
    </div>
  );
}
