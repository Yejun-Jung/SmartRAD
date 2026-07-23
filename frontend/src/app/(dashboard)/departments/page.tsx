"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import DepartmentModal, { Department } from "@/components/department/DepartmentModal";
import DepartmentDeleteModal from "@/components/department/DepartmentDeleteModal";

const Tree = dynamic(() => import("react-organizational-chart").then(mod => mod.Tree), { ssr: false });
const TreeNode = dynamic(() => import("react-organizational-chart").then(mod => mod.TreeNode), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface DepartmentStats {
  departmentId: number;
  employeeCount: number;
  averageTenureYears: number | null;
  monthlyPayrollTotal: number;
  monthlyPayrollAverage: number;
  attendanceIssueRate: number | null;
}

function formatCompactWon(value: number) {
  if (!value) return "-";
  const man = Math.round(value / 10000);
  return man >= 10000
    ? `${(man / 10000).toFixed(1)}억원`
    : `${man.toLocaleString("ko-KR")}만원`;
}

function formatTenure(years: number | null) {
  return years == null ? "-" : `${years.toFixed(1)}년`;
}

function formatRate(rate: number | null) {
  return rate == null ? "-" : `${Math.round(rate)}%`;
}

// Tree node definition for processing
interface OrgNode extends Department {
  children: OrgNode[];
}

// Helper function to build the tree from a flat list
function buildTree(departments: Department[]): OrgNode[] {
  const nodeMap = new Map<number, OrgNode>();
  const roots: OrgNode[] = [];

  // Initialize nodes
  departments.forEach((dept) => {
    nodeMap.set(dept.departmentId, { ...dept, children: [] });
  });

  // Build hierarchy
  departments.forEach((dept) => {
    const node = nodeMap.get(dept.departmentId)!;
    if (dept.parentDepartmentId && nodeMap.has(dept.parentDepartmentId)) {
      nodeMap.get(dept.parentDepartmentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [statsByDept, setStatsByDept] = useState<Map<number, DepartmentStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [initialParentId, setInitialParentId] = useState<number | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchDepartments() {
      setLoading(true);
      setError(null);
      try {
        const [deptRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/departments`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/departments/stats`, { headers: authHeaders() }),
        ]);
        if (deptRes.ok) {
          const data = await deptRes.json();
          if (!cancelled) setDepartments(data);
        } else {
          if (!cancelled) setError("부서 목록을 불러오는데 실패했습니다.");
        }
        if (statsRes.ok) {
          const statsData: DepartmentStats[] = await statsRes.json();
          if (!cancelled) setStatsByDept(new Map(statsData.map((s) => [s.departmentId, s])));
        }
      } catch {
        if (!cancelled) setError("네트워크 오류가 발생했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDepartments();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleDeleteClick = (dept: Department) => {
    setDeletingDept(dept);
  };

  const handleDeleted = () => {
    setDeletingDept(null);
    setRefreshKey((k) => k + 1);
  };

  const handleOpenNew = (parentId: number | null = null) => {
    setEditingDept(null);
    setInitialParentId(parentId);
    setShowModal(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setInitialParentId(null);
    setShowModal(true);
  };

  const handleSaved = () => {
    setShowModal(false);
    setRefreshKey((k) => k + 1);
  };

  const treeRoots = buildTree(departments);

  // Styled Node Component
  const OrgChartNode = ({ node }: { node: OrgNode }) => {
    const stats = statsByDept.get(node.departmentId);
    return (
      <div className="inline-block relative group mx-2">
        {/* Box container */}
        <div className="flex flex-col w-44 bg-white border border-[#1e4e8c] shadow-md transition-shadow">
          {/* Header - Department Name */}
          <div className="bg-[#1e4e8c] text-white text-center py-2 px-2 font-bold text-[15px] tracking-wide break-keep leading-tight min-h-[44px] flex items-center justify-center">
            {node.departmentName}
          </div>

          {/* Body - Manager Name */}
          <div className="text-center py-2 px-2 text-[15px] font-semibold text-gray-800 bg-white min-h-[40px] flex items-center justify-center relative">
            <span>{node.departmentHeadName || "(담당자 미지정)"}</span>

            {/* Action Overlay (Hover) */}
            <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity z-10 border-t border-gray-100">
              <button
                onClick={() => handleOpenNew(node.departmentId)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="하위 부서 추가"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleOpenEdit(node)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="수정"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(node)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="삭제"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer - Department Stats */}
          <div className="border-t border-gray-100 bg-gray-50 px-2.5 py-1.5 text-[10px] leading-relaxed text-gray-500">
            <div className="flex items-center justify-between">
              <span>인원</span>
              <span className="font-semibold text-gray-700">{stats ? `${stats.employeeCount}명` : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>평균 근속</span>
              <span className="font-semibold text-gray-700">{stats ? formatTenure(stats.averageTenureYears) : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>이번달 급여</span>
              <span className="font-semibold text-gray-700">{stats ? formatCompactWon(stats.monthlyPayrollTotal) : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>근태 이상</span>
              <span className={`font-semibold ${stats && stats.attendanceIssueRate ? "text-rose-600" : "text-gray-700"}`}>
                {stats ? formatRate(stats.attendanceIssueRate) : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Recursive render function
  const renderTreeNodes = (nodes: OrgNode[]) => {
    return nodes.map((node) => (
      <TreeNode key={node.departmentId} label={<OrgChartNode node={node} />}>
        {node.children.length > 0 && renderTreeNodes(node.children)}
      </TreeNode>
    ));
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">부서 조직도 관리</h1>
          <p className="mt-1 text-sm text-gray-500">조직도를 다이어그램 형태로 한눈에 파악하고 관리합니다.</p>
        </div>
        <button
          onClick={() => handleOpenNew(null)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e4e8c] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          최상위 부서 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">조직도 다이어그램</h2>
          <span className="bg-blue-100 text-[#1e4e8c] text-xs font-semibold px-2.5 py-0.5 rounded-full">
            총 {departments.length}개 부서
          </span>
        </div>
        
        <div className="flex-1 overflow-auto p-12 flex justify-center bg-[#f8fafc]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 font-medium">조직도를 불러오는 중입니다...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-rose-500 font-medium">{error}</div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-base font-medium text-gray-900 mb-1">등록된 부서가 없습니다</p>
              <p className="text-sm">우측 상단의 버튼을 눌러 첫 부서를 추가해보세요.</p>
            </div>
          ) : (
            <div className="inline-block">
              {/* If there are multiple roots, we wrap them in a virtual root or render multiple trees */}
              {treeRoots.length === 1 ? (
                <Tree
                  lineWidth={"2px"}
                  lineColor={"#cbd5e1"}
                  lineBorderRadius={"0px"}
                  label={<OrgChartNode node={treeRoots[0]} />}
                >
                  {treeRoots[0].children.length > 0 && renderTreeNodes(treeRoots[0].children)}
                </Tree>
              ) : (
                <div className="flex gap-16">
                  {treeRoots.map((root) => (
                    <Tree
                      key={root.departmentId}
                      lineWidth={"2px"}
                      lineColor={"#cbd5e1"}
                      lineBorderRadius={"0px"}
                      label={<OrgChartNode node={root} />}
                    >
                      {root.children.length > 0 && renderTreeNodes(root.children)}
                    </Tree>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <DepartmentModal
          department={editingDept}
          departments={departments}
          initialParentId={initialParentId}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}

      {deletingDept && (
        <DepartmentDeleteModal
          department={deletingDept}
          departments={departments}
          onClose={() => setDeletingDept(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
