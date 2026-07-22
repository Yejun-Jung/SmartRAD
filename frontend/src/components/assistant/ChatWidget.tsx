"use client";

import { useEffect, useRef, useState } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "안녕하세요! 연차, 급여, 근태 등 본인 정보에 대해 편하게 물어보세요.",
};

const CLOSED_BUTTON_SIZE = 56;
const DEFAULT_EDGE_OFFSET = 24;
const AVOIDANCE_GAP = 12;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // 챗봇 버튼은 항상 같은 자리에 고정해두고, 그 발밑(오른쪽 아래 고정 영역)에
  // 실제로 깔리는 버튼/링크만 딱 겹치지 않을 만큼씩 왼쪽으로 밀어준다.
  useEffect(() => {
    // element -> 지금 적용 중인 왼쪽 이동량(px). 매 계산마다 원위치로 되돌린 뒤
    // 다시 재보정해서, 겹침이 해소되면 자연스럽게 원래 자리로 복귀하게 한다.
    const appliedShifts = new Map<HTMLElement, number>();

    const restoreAll = () => {
      appliedShifts.forEach((_, el) => {
        el.style.transform = "";
      });
      appliedShifts.clear();
    };

    const sync = () => {
      // 정확한 위치를 재보정하기 위해 먼저 기존에 밀어둔 것들을 원위치로 되돌린다.
      appliedShifts.forEach((_, el) => {
        el.style.transform = "";
      });

      if (open) {
        appliedShifts.clear();
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const widgetLeft = viewportWidth - DEFAULT_EDGE_OFFSET - CLOSED_BUTTON_SIZE;
      const widgetTop = viewportHeight - DEFAULT_EDGE_OFFSET - CLOSED_BUTTON_SIZE;

      // 닫힌 버튼(56x56) 영역을 격자로 훑어서 그 자리에 실제로 깔리는 컨트롤을 찾는다.
      const found = new Set<HTMLElement>();
      const steps = 6;
      for (let i = 0; i <= steps; i++) {
        for (let j = 0; j <= steps; j++) {
          const x = widgetLeft + (CLOSED_BUTTON_SIZE * i) / steps;
          const y = widgetTop + (CLOSED_BUTTON_SIZE * j) / steps;
          const stack = document.elementsFromPoint(x, y);
          const topOutsideWidget = stack.find((el) => !container.contains(el));
          const control = topOutsideWidget?.closest("button, a, [role='button'], input, select") as HTMLElement | null;
          if (control) found.add(control);
        }
      }

      const nextShifts = new Map<HTMLElement, number>();
      found.forEach((el) => {
        const rect = el.getBoundingClientRect(); // 위에서 원위치로 되돌렸으니 원래 위치 기준
        const overlap = rect.right - widgetLeft + AVOIDANCE_GAP;
        if (overlap > 0) {
          el.style.transition = "transform 150ms ease";
          el.style.transform = `translateX(-${overlap}px)`;
          nextShifts.set(el, overlap);
        }
      });
      appliedShifts.clear();
      nextShifts.forEach((value, key) => appliedShifts.set(key, value));
    };

    sync();
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    const interval = window.setInterval(sync, 400);
    return () => {
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
      window.clearInterval(interval);
      restoreAll();
    };
  }, [open]);

  const send = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "AI 비서 응답을 가져오지 못했습니다.");
      }
      const data: { reply: string } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: error instanceof Error ? error.message : "AI 비서 응답을 가져오지 못했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
      {open && (
        <div className="mb-3 flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-indigo-600 px-4 py-3 text-white">
            <span className="text-sm font-bold">SmartHR AI 비서</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="rounded-md p-1 hover:bg-white/10">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-400">답변을 준비하고 있어요...</div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="relative">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="예: 연차 며칠 남았어?"
                className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-10 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-indigo-600 text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="전송"
              >
                <PaperAirplaneIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700"
        aria-label="AI 비서 열기"
      >
        {open ? <XMarkIcon className="h-6 w-6" /> : <ChatBubbleLeftRightIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}
