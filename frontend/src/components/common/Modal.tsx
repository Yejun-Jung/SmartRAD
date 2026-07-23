"use client";

import type { ButtonHTMLAttributes, ComponentType, ReactNode, SVGProps } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ICON_COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-600",
  indigo: "bg-indigo-100 text-indigo-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
  gray: "bg-gray-100 text-gray-600",
} as const;

const MAX_WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
} as const;

export type ModalIconColor = keyof typeof ICON_COLOR_CLASSES;
export type ModalMaxWidth = keyof typeof MAX_WIDTH_CLASSES;

interface ModalProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: ModalIconColor;
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: ModalMaxWidth;
  bodyClassName?: string;
  as?: "div" | "form";
  onSubmit?: (event: React.FormEvent) => void;
}

/** 앱 전역에서 공통으로 사용하는 모달 셸. 배경/카드/헤더(아이콘+제목+닫기)/본문/푸터 레이아웃을 통일한다. */
export default function Modal({
  icon: Icon,
  iconColor = "blue",
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = "md",
  bodyClassName,
  as = "div",
  onSubmit,
}: ModalProps) {
  const Body = as;
  const bodyProps = as === "form" ? { onSubmit } : {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex max-h-[calc(100dvh-1.5rem)] w-full flex-col ${MAX_WIDTH_CLASSES[maxWidth]} animate-in fade-in zoom-in-95 overflow-hidden rounded-2xl bg-white shadow-xl duration-200 sm:max-h-[calc(100dvh-2rem)]`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ICON_COLOR_CLASSES[iconColor]}`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="truncate text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <Body {...bodyProps} className="flex min-h-0 flex-1 flex-col">
          <div className={bodyClassName ?? "min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"}>{children}</div>
          {footer && <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/30 px-4 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">{footer}</div>}
        </Body>
      </div>
    </div>
  );
}

export function ModalCancelButton({ children = "취소", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1 ${className}`}
    >
      {children}
    </button>
  );
}

const PRIMARY_BUTTON_TONES = {
  blue: "bg-blue-600 shadow-blue-200 hover:bg-blue-700",
  rose: "bg-rose-600 shadow-rose-200 hover:bg-rose-700",
  emerald: "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700",
} as const;

export function ModalPrimaryButton({
  children,
  tone = "blue",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof PRIMARY_BUTTON_TONES }) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1 ${PRIMARY_BUTTON_TONES[tone]} ${className}`}
    >
      {children}
    </button>
  );
}
