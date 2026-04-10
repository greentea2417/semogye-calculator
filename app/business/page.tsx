"use client";

import Link from "next/link";

const BUSINESS_TOOLS = [
  {
    category: "직장인 필수",
    tools: [
      { title: "월급 실수령액", description: "비과세, 부양가족 반영 4대보험·소득세 자동 계산", href: "/salary" },
      { title: "상여금·성과급", description: "보너스 수령 시 실제 내 통장에 꽂히는 금액", href: "/bonus" },
    ],
  },
  {
    category: "알바·프리랜서",
    tools: [
      { title: "시급·알바비", description: "주휴수당, 포괄임금제 포함 월 환산 금액", href: "/hourly" },
      { title: "프리랜서 3.3%", description: "소득세 3.3% 제외 실지급액 및 원천징수 영수증", href: "/freelance" },
    ],
  },
];

export default function BusinessPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      <section className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">비즈니스·금융</h1>
        <p className="text-sm text-gray-400 font-medium">직장인부터 프리랜서까지, 정교한 정산 도구</p>
      </section>

      <div className="space-y-12">
        {BUSINESS_TOOLS.map((group, idx) => (
          <section key={idx} className="space-y-5">
            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{group.category}</span>
              <div className="h-[1px] flex-1 bg-gray-50"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {group.tools.map((tool, tIdx) => (
                <Link key={tIdx} href={tool.href} className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-gray-900 transition-all duration-300 shadow-sm shadow-gray-200/20">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-lg text-gray-900">{tool.title}</h3>
                      <p className="text-xs text-gray-400 font-medium">{tool.description}</p>
                    </div>
                    <span className="text-xl text-gray-200 group-hover:text-gray-900 transition-colors transform group-hover:translate-x-1 duration-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <footer className="pt-20 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}