"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useSummarize() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (text: string) => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch(`${API_BASE_URL}/assistant/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "요약을 가져오지 못했습니다.");
      }
      const data: { summary: string } = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요약을 가져오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSummary(null);
    setError(null);
  };

  return { summary, loading, error, summarize, reset };
}
