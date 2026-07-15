"use client";

import { useState } from "react";
import EmployeeStats from "@/components/employee/EmployeeStats";
import EmployeeList from "@/components/employee/EmployeeList";
import EmployeeDetail from "@/components/employee/EmployeeDetail";
import EmployeeEditModal from "@/components/employee/EmployeeEditModal";

export default function EmployeesPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [editEmployee, setEditEmployee] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-fetch in List and Detail

  const handleDelete = async (id: number) => {
    if (confirm("정말로 이 직원을 삭제하시겠습니까?")) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("삭제되었습니다.");
          setSelectedEmployeeId(null);
          setRefreshKey((prev) => prev + 1);
        } else {
          alert("삭제 실패");
        }
      } catch (error) {
        alert("오류 발생");
      }
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <EmployeeStats />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <EmployeeList 
          key={`list-${refreshKey}`}
          onSelectEmployee={setSelectedEmployeeId} 
          selectedId={selectedEmployeeId} 
        />
        <EmployeeDetail 
          key={`detail-${refreshKey}`}
          employeeId={selectedEmployeeId} 
          onEditClick={setEditEmployee}
          onDeleteClick={handleDelete}
        />
      </div>

      {editEmployee && (
        <EmployeeEditModal 
          employee={editEmployee} 
          onClose={() => setEditEmployee(null)} 
          onSave={() => {
            setEditEmployee(null);
            setRefreshKey((prev) => prev + 1);
          }} 
        />
      )}
    </div>
  );
}
