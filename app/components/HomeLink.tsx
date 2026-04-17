"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeLink() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <div className="max-w-md mx-auto px-5 mb-4">
      <Link
        href="/"
        className="text-sm text-gray-500"
      >
        ← 홈
      </Link>
    </div>
  );
}