"use client";

import Link from "next/link";

const LIFE_TOOLS = [
  { category: "학업·자기계발", tools: [{ title: "학점 계산기", description: "과목별 성적 입력 후 평균 평점 확인", href: "/life/gpa" }, { title: "인생 낭비 환산기", description: "스마트폰 사용 시간으로 본 인생의 기회비용", href: "/life/waste-time" }] },
  { category: "건강·저속노화", tools: [{ title: "내 몸 나이 (생체 나이)", description: "생활 습관 기반 나의 생물학적 나이 측정", href: "/life/body-age" }, { title: "키빼몸·BMI", description: "신체 지표를 통한 권장 체질량 및 체중 체크", href: "/life/bmi" }] },
];

export default function LifePage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">라이프·건강</h1>
        <p className="text-sm text-gray-400 font-medium">일상의 가치를 숫자로 환산하는 도구</p>
      </section>
      <div className="space-y-16">
        {LIFE_TOOLS.map((group, idx) => (
          <section key={idx} className="space-y-8">
            <div className="flex items-center space-x-5">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">{group.category}</span>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {group.tools.map((tool, tIdx) => (
                <Link key={tIdx} href={tool.href} className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-blue-600 transition-all duration-300 shadow-sm shadow-gray-200/20">
                  <div className="flex justify-between items-center text-left">
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
    </main>
  );
}