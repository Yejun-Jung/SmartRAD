"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function SessionTimer() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const calculateTimeLeft = () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
    if (!token) {
      setTimeLeft(null);
      return;
    }
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) {
      setTimeLeft(null);
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    const diff = decoded.exp - now;
    setTimeLeft(diff > 0 ? diff : 0);
  };

  useEffect(() => {
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRenew = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
    const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          if (window.localStorage.getItem("accessToken")) {
            window.localStorage.setItem("accessToken", data.accessToken);
          } else {
            window.sessionStorage.setItem("accessToken", data.accessToken);
          }
          calculateTimeLeft();
        }
      }
    } catch (e) {
      console.error("Failed to renew session", e);
    }
  };

  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 300; // less than 5 minutes

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
      <span className={`text-sm font-medium tabular-nums ${isWarning ? 'text-red-600' : 'text-gray-600'}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <button
        onClick={handleRenew}
        title="세션 연장"
        className="p-1 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <ArrowPathIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
