"use client";

import React from "react";
import Link from "next/link";

const BUSINESS_TOOLS = [
  {
    category: "사장님 필수",
    tools: [
      { title: "사장님 계산기", description: "판매가 대비 순이익 및 마진율 확인", href: "/profit" },
      { title: "사장님용 시급 계산", description: "여러 명의 알바생 급여를 한 번에 정산", href: "/business/hourly-multi" },
      { title: "대출부담률 계산기", description: "소득 대비 원리금 상환 비율(DSR) 체크", href: "/burden" },
    ],
  },
  {
    category: "급여 및 정산",
    tools: [
      { title: "월급 실수령액", description: "비과세, 부양가족 반영 세후 급여 계산", href: "/salary" },
      { title: "상여금·보너스", description: "보너스 수령 시 실제 내 통장에 꽂히는 금액", href: "/business/holiday-pay" },
      { title: "월급 vs 프리랜서", description: "정규직과 3.3% 계약 중 유리한 쪽 비교", href: "/business/compare" },
    ],
  },
  {
    category: "알바·프리랜서",
    tools: [
      { title: "프리랜서 3.3%", description: "소득세 3.3% 제외 실지급액 확인", href: "/business/freelance" },
      { title: "시급·알바비", description: "주휴수당 포함 월 예상 수령액 확인", href: "/business/hourly" },
    ],
  },
];

export default function BusinessPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      <section className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Business</h1>
        <p className="text-sm text-gray-400 font-medium tracking-tight">사장님을 위한 스마트한 정산 파트너</p>
      </section>

      <div className="space-y-16">
        {BUSINESS_TOOLS.map((group, idx) => (
          <section key={idx} className="space-y-8">
            <div className="flex items-center space-x-5 px-2">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">{group.category}</span>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {group.tools.map((tool, tIdx) => (
                <Link 
                  key={tIdx} 
                  href={tool.href} 
                  className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-blue-600 transition-all duration-300 shadow-sm shadow-gray-200/20"
                >
                  <div className="flex justify-between items-center text-left px-2">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-lg text-gray-900">{tool.title}</h3>
                      <p className="text-xs text-gray-400 font-medium">{tool.description}</p>
                    </div>
                    <span className="text-xl text-gray-200 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1 duration-300">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <footer className="pt-20 text-center text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</footer>
    </main>
  );
}