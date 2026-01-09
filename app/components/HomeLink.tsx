"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeLink() {
  const pathname = usePathname();

  // ✅ 메인페이지에서는 숨김
  if (pathname === "/") return null;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6">
      <Link
        href="/"
        className="text-sm text-gray-400 hover:text-gray-600 underline"
      >
        ← 홈으로
      </Link>
    </div>
  );
}
