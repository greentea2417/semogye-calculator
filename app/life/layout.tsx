"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const groups = [
  {
    label: "건강",
    items: [
      { href: "/life/bmi", title: "BMI 계산기" },
      { href: "/life/body-age", title: "신체 나이 계산기" },
      { href: "/life/kbm", title: "키빼몸 계산기" },
    ],
  },
  {
    label: "학습",
    items: [{ href: "/life/grade", title: "학점 계산기" }],
  },
  {
    label: "재미",
    items: [{ href: "/life/waste-time", title: "내가 날린 인생 시간은?" }],
  },
];

export default function LifeLayout({ children }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, [pathname]);

  const allItems = groups.flatMap((g) => g.items);

  return (
    <div className="min-h-screen bg-white">
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

      {/* 모바일: 가로 스크롤 메뉴 */}
      <div className="md:hidden sticky top-16 z-40 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-2 px-6 py-3 w-max">
          {allItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 flex gap-10">
        {/* 데스크톱 사이드바 */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-7">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1 h-3.5 rounded-full bg-green-500" />
                  <p className="text-[13px] font-extrabold text-gray-900">{g.label}</p>
                </div>
                <div className="space-y-0.5">
                  {g.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg text-[13px] transition-colors ${
                          active
                            ? "bg-green-50 text-green-600 font-bold"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 중앙 패널: 라우트 전환 시 페이드인 */}
        <main
          className="flex-1 min-w-0 transition-opacity duration-300 ease-out"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
