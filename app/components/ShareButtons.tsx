"use client";

import { useState } from "react";

type Props = {
  title: string;
  url: string;
};

function isSecureContextSafe() {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  if (protocol === "https:") return true;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  return false;
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "-9999px";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  if (!ok) throw new Error("클립보드 복사 실패");
}

export default function ShareButtons({ title, url }: Props) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = async () => {
    if (!url) return;
    setLoading(true);
    setToast(null);
    try {
      const canWebShare = typeof (navigator as any).share === "function" && isSecureContextSafe();
      if (canWebShare) {
        try {
          await (navigator as any).share({ title, text: title, url });
          setToast("공유 완료");
          return;
        } catch {}
      }
      await copyToClipboard(url);
      setToast("링크 복사 완료");
    } catch (e) {
      console.error(e);
      setToast("공유 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleShare}
        disabled={loading}
        className="rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-900 shadow-sm shadow-gray-200/40 transition hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? "처리중..." : "공유하기"}
      </button>
      {toast && <div className="text-sm text-gray-700">{toast}</div>}
    </div>
  );
}
