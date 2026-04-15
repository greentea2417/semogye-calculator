"use client";

import Link from "next/link";

const MAIN_CATEGORIES = [
  {
    category: "비즈니스·금융",
    description: "사장님부터 직장인까지 꼭 필요한 정산 도구",
    href: "/business",
  },
  {
    category: "라이프·건강",
    description: "일상의 가치를 숫자로 환산하는 도구",
    href: "/life",
  },
];

export default function Home() {
  return (
    <main className="max-w-xl mx-auto px-5 py-24 space-y-20">
      {/* 히어로 섹션 - 중앙 정렬 강화 */}
      <section className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">
          SEMOGYE
        </h1>
        <p className="text-sm text-gray-400 font-medium tracking-widest uppercase">
          Everything is Calculable
        </p>
      </section>

      {/* 카테고리 선택 섹션 */}
      <div className="space-y-16">
        <section className="space-y-8">
          {/* 중앙 정렬된 볼드 카테고리 헤더 */}
          <div className="flex items-center space-x-5">
            <div className="h-[1px] flex-1 bg-gray-100"></div>
            <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">
              SELECT CATEGORY
            </span>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {MAIN_CATEGORIES.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="group block bg-white border border-gray-100 p-9 rounded-[40px] hover:border-gray-900 transition-all duration-300 shadow-sm shadow-gray-200/20"
              >
                <div className="flex justify-between items-center">
                  <div className="text-left space-y-2">
                    <h3 className="font-black text-2xl text-gray-900 italic tracking-tight group-hover:text-blue-600 transition-colors">
                      {item.category}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-2xl text-gray-200 group-hover:text-gray-900 transition-colors transform group-hover:translate-x-1 duration-300">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="pt-20 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">
          Designed by greentea • 2026
        </p>
      </footer>
    </main>
  );
}