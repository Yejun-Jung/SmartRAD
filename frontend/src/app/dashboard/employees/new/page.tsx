"use client";

import { type ChangeEvent, useState } from "react";
import DashboardShell from "../../DashboardShell";

type Option = {
  label: string;
  value: string;
};

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  muted?: boolean;
  suffix?: string;
  placeholder?: string;
  type?: string;
};

const Input = ({ label, name, value, onChange, required, muted, suffix, placeholder, type = "text" }: InputProps) => (
  <label className="block" htmlFor={name}>
    <span className="mb-2 block text-xs font-bold text-slate-700">
      {label} {required ? <b className="text-rose-500">*</b> : null}
    </span>
    <div
      className={`flex h-10 items-center rounded-lg border px-3 text-sm ${
        muted ? "border-slate-200 bg-slate-50 text-slate-300" : "border-slate-200 bg-white text-slate-900 focus-within:border-indigo-500"
      }`}
    >
      <input
        id={name}
        name={name}
        className="w-full bg-transparent outline-none placeholder:text-slate-300"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={muted}
        disabled={muted}
        placeholder={placeholder}
        type={type}
      />
      {suffix ? <span className="text-xs text-slate-400">{suffix}</span> : null}
    </div>
  </label>
);

const Select = ({ label, name, value, onChange, options, placeholder, required }: { label: string; name: string; value: string; onChange: (value: string) => void; options: Option[]; placeholder: string; required?: boolean }) => (
  <label className="block" htmlFor={name}>
    <span className="mb-2 block text-xs font-bold text-slate-700">
      {label} {required ? <b className="text-rose-500">*</b> : null}
    </span>
    <select
      id={name}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 ${value ? "text-slate-900" : "text-slate-300"}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const Card = ({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex h-14 items-center justify-between border-b border-slate-200 px-6">
      <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
      {badge ? <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-400">{badge}</span> : null}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const departments: Option[] = [
  { label: "인사팀", value: "hr" },
  { label: "디자인팀", value: "design" },
  { label: "개발팀", value: "development" },
  { label: "기획팀", value: "planning" },
  { label: "마케팅팀", value: "marketing" },
  { label: "영업팀", value: "sales" },
];

const positions: Option[] = [
  { label: "사원", value: "staff" },
  { label: "주임", value: "associate" },
  { label: "대리", value: "assistant-manager" },
  { label: "과장", value: "manager" },
  { label: "차장", value: "deputy-general-manager" },
  { label: "부장", value: "general-manager" },
];

const existingEmployees: Option[] = [
  { label: "김서연 (인사팀 팀장)", value: "emp-hr-001" },
  { label: "이도현 (디자인팀 팀장)", value: "emp-design-001" },
  { label: "박준혁 (개발팀 팀장)", value: "emp-dev-001" },
  { label: "최유진 (기획팀 팀장)", value: "emp-planning-001" },
  { label: "정민수 (마케팅팀 팀장)", value: "emp-marketing-001" },
  { label: "한지우 (영업팀 팀장)", value: "emp-sales-001" },
];

const emptyEmployee = {
  name: "",
  birthDate: "",
  phone: "",
  email: "",
  gender: "",
  department: "",
  position: "",
  manager: "",
};

export default function NewEmployeePage() {
  const [employee, setEmployee] = useState(emptyEmployee);
  const [profileImage, setProfileImage] = useState<{ name: string; preview: string } | null>(null);
  const [attachedDocuments, setAttachedDocuments] = useState<{ id: string; name: string; size: string }[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  const updateEmployee = (field: keyof typeof emptyEmployee) => (value: string) => {
    setEmployee((currentEmployee) => ({ ...currentEmployee, [field]: value }));
  };

  const resetForm = () => {
    setEmployee(emptyEmployee);
    setProfileImage(null);
    setAttachedDocuments([]);
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage({ name: file.name, preview: reader.result });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    setAttachedDocuments((currentDocuments) => [
      ...currentDocuments,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024)).toLocaleString()} KB`,
      })),
    ]);
  };

  const removeDocument = (documentId: string) => {
    setAttachedDocuments((currentDocuments) => currentDocuments.filter((document) => document.id !== documentId));
  };

  return (
    <DashboardShell activePath="/dashboard/employees/new">
      <header className="sticky top-0 z-10 flex min-h-[60px] items-center justify-between border-b border-slate-200 bg-white px-8">
        <div>
          <h1 className="text-xl font-extrabold">신규 직원 등록</h1>
          <p className="mt-1 text-xs text-slate-400">
            홈 · 인사 관리 · <span className="text-indigo-500">신규 직원 등록</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500">♧</button>
          <button className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold">취소</button>
          <button className="h-9 rounded-lg bg-indigo-600 px-6 text-sm font-bold text-white shadow-sm">✓ 저장하기</button>
        </div>
      </header>

      <main className="p-8 pb-24">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-200 text-indigo-700">♧</div>
            <div>
              <p className="text-sm font-extrabold">신규 직원 등록</p>
              <p className="text-xs text-indigo-500">필수 항목을 모두 입력한 뒤 저장하기를 눌러 등록을 완료하세요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
            등록 모드 <span className="h-7 w-12 rounded-full bg-indigo-500 after:ml-6 after:mt-1 after:block after:h-5 after:w-5 after:rounded-full after:bg-white" /> <span className="text-slate-400">수정 모드</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Card title="①  기본 정보" badge="* 표시 항목은 필수입니다">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="이름" name="name" value={employee.name} onChange={updateEmployee("name")} required placeholder="이름을 입력하세요" />
                <Input label="직원 번호" name="employeeNumber" value="" onChange={() => undefined} muted placeholder="저장 시 자동 생성됩니다" />
                <Input label="생년월일" name="birthDate" value={employee.birthDate} onChange={updateEmployee("birthDate")} required placeholder="YYYY-MM-DD" type="date" />
                <div>
                  <span className="mb-2 block text-xs font-bold text-slate-700">
                    성별 <b className="text-rose-500">*</b>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "남성", value: "male" },
                      { label: "여성", value: "female" },
                    ].map((gender) => {
                      const selected = employee.gender === gender.value;
                      return (
                        <button
                          key={gender.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => updateEmployee("gender")(gender.value)}
                          className={`h-10 rounded-lg border text-sm font-bold transition ${
                            selected ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-500"
                          }`}
                        >
                          {gender.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Input label="연락처" name="phone" value={employee.phone} onChange={updateEmployee("phone")} required placeholder="010-0000-0000" type="tel" />
                <Input label="이메일" name="email" value={employee.email} onChange={updateEmployee("email")} required placeholder="email@example.com" type="email" />
              </div>
            </Card>

            <Card title="②  소속 및 고용 정보">
              <div className="grid gap-4 md:grid-cols-2">
                <Select label="부서" name="department" value={employee.department} onChange={updateEmployee("department")} options={departments} placeholder="부서를 선택하세요" required />
                <Select label="직급" name="position" value={employee.position} onChange={updateEmployee("position")} options={positions} placeholder="직급을 선택하세요" required />
                <Select label="직속 관리자" name="manager" value={employee.manager} onChange={updateEmployee("manager")} options={existingEmployees} placeholder="DB 등록 직원을 선택하세요" />
                <Input label="입사일" name="hireDate" value="" onChange={() => undefined} placeholder="YYYY-MM-DD" type="date" />
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card title="프로필 사진">
              <div className="text-center">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImage.preview} alt={`${profileImage.name} 미리보기`} className="mx-auto h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-bold text-slate-300">?</div>
                )}
                <p className="mt-4 text-sm font-bold">사진을 업로드하세요</p>
                <p className="text-xs text-slate-400">JPG, PNG 최대 2MB</p>
                {profileImage ? <p className="mt-2 truncate text-xs font-semibold text-indigo-600">{profileImage.name}</p> : null}
                <label className="mt-4 flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-sm hover:border-indigo-300 hover:text-indigo-600">
                  ⇧ 파일 선택
                  <input key={`profile-${fileInputKey}`} type="file" accept="image/png,image/jpeg" onChange={handleProfileImageChange} className="sr-only" />
                </label>
              </div>
            </Card>
            <Card title="서류 첨부" badge="선택사항">
              <label className="block cursor-pointer rounded-xl border border-indigo-200 bg-slate-50 p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/50">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">⇧</div>
                <p className="text-sm font-bold">파일을 드래그하거나</p>
                <p className="text-xs text-slate-400">클릭하여 업로드하세요</p>
                <span className="mt-3 inline-flex rounded-lg bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600">파일 선택</span>
                <input key={`documents-${fileInputKey}`} type="file" multiple onChange={handleDocumentChange} className="sr-only" />
              </label>
              {attachedDocuments.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {attachedDocuments.map((document) => (
                    <div key={document.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs">
                      <span className="min-w-0 font-bold">
                        ▣ <span className="break-all">{document.name}</span>
                        <br />
                        <small className="ml-5 font-normal text-slate-400">{document.size}</small>
                      </span>
                      <button type="button" onClick={() => removeDocument(document.id)} className="ml-3 text-rose-400 hover:text-rose-600" aria-label={`${document.name} 삭제`}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          </aside>
        </div>
      </main>

      <footer className="fixed bottom-0 right-0 left-0 z-20 border-t border-slate-200 bg-white px-8 py-3 md:left-[210px]">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">ⓘ * 표시 항목은 모두 입력해야 저장이 가능합니다.</p>
          <div className="flex gap-3">
            <button className="h-10 rounded-lg border border-slate-200 px-5 text-sm">취소</button>
            <button type="button" onClick={resetForm} className="h-10 rounded-lg border border-orange-200 bg-orange-50 px-5 text-sm font-bold text-orange-500">
              초기화
            </button>
            <button className="h-10 rounded-lg bg-indigo-600 px-7 text-sm font-bold text-white">✓ 저장하기</button>
          </div>
        </div>
      </footer>
    </DashboardShell>
  );
}
