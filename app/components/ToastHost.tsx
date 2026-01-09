"use client";

import { useEffect, useState } from "react";
import { getToastEventName } from "./toast";

export default function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setMsg(e.detail?.message ?? "");
      // 2초 후 자동 닫힘
      setTimeout(() => setMsg(null), 2000);
    };
    window.addEventListener(getToastEventName(), handler as any);
    return () => window.removeEventListener(getToastEventName(), handler as any);
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999]">
      <div className="rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
        {msg}
      </div>
    </div>
  );
}
