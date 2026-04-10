"use client";

import Link from "next/link";

const BUSINESS_TOOLS = [
  {
    category: "직장인 필수",
    tools: [
      {
        title: "월급 실수령액",
        description: "비과세, 부양가족 반영 4대보험·소득세 자동 계산",
        href: "/salary",
      },
      {
        title: "상여금·성과급",
        description: "보너스 수령 시 실제 내 통장에 꽂히는 금액",
        href: "/bonus",
      },
    ],
  },
  {
    category: "알바·프리랜서",
    tools: [
      {
        title: "시급·알바비",
        description: "주휴수당, 포괄임금제 포함 월 환산 금액",
        href: "/hourly",
      },
      {
        title: "프리랜서 3.3%",
        description: "소득세 3.3% 제외 실지급액 및 원천징수 영수증",
        href: "/freelance",
      },
    ],
  },
];

export default function BusinessPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      {/* --- 상단 헤더 --- */}
      <section className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">비즈니스·금융</h1>
        <p className="text-sm text-gray-400 font-medium italic">직장인부터 프리랜서까지, 정교한 정산 도구</p>
      </section>

      {/* --- 계산기 도구 섹션 --- */}
      <div className="space-y-12">
        {BUSINESS_TOOLS.map((group, groupIndex) => (
          <section key={groupIndex} className="space-y-5">
            {/* 카테고리 구분선 */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                {group.category}
              </span>
              <div className="h-[1px] flex-1 bg-blue-50"></div>
            </div>

            {/* 카드 그리드 */}
            <div className="grid grid-cols-1 gap-4">
              {group.tools.map((tool, toolIndex) => (
                <Link
                  key={toolIndex}
                  href={tool.href}
                  className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-blue-500 transition-all duration-300 shadow-sm shadow-blue-500/5 hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-0.5">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {tool.description}
                      </p>
                    </div>
                    {/* 호버 시 블루 컬러로 변하는 화살표 */}
                    <span className="text-xl text-gray-200 group-hover:text-blue-500 transition-colors">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 푸터 */}
      <footer className="pt-10 border-t border-gray-50 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}