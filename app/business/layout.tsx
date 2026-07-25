"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BusinessLayout({ children }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg tracking-tight text-gray-900">
            세모계
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            ← 홈으로
          </Link>
        </div>
      </nav>

      {/* 중앙 패널: 라우트 전환 시 페이드인 */}
      <main
        className="transition-opacity duration-300 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {children}
      </main>
    </div>
  );
}
