"use client";

import { useEffect, useRef, useState } from "react";

export type SearchableSelectOption = { label: string; value: string };

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  invalid?: boolean;
}

export default function SearchableSelect({ label, value, onChange, options, placeholder, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);
  const filtered = query.trim()
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div className="relative" ref={containerRef}>
      {label ? <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span> : null}
      <div className={`flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 ${invalid ? "border-rose-400 bg-rose-50/40 ring-1 ring-rose-200" : "border-gray-300"}`}>
        <input
          type="text"
          value={open ? query : (selected?.label ?? "")}
          onChange={(event) => { setQuery(event.target.value); if (!open) setOpen(true); }}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onKeyDown={(event) => {
            if (event.key === "Escape") { setOpen(false); event.currentTarget.blur(); }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300"
        />
        {value ? (
          <button
            type="button"
            onClick={() => { onChange(""); setQuery(""); }}
            className="shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="선택 해제"
          >
            ×
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">검색 결과가 없습니다.</p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setQuery(""); setOpen(false); }}
                className={`block w-full truncate px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                  option.value === value ? "bg-blue-50 font-semibold text-blue-600" : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
