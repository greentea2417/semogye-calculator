"use client";

import Link from "next/link";

const LIFE_TOOLS = [
  {
    title: "학점 계산기",
    description: "중간, 기말 대비 학점 시뮬레이션",
    href: "/life/grade",
    tag: "TARGET",
  },
  {
    title: "BMI 지수",
    description: "체질량 지수 기반 비만도 체크",
    href: "/life/bmi",
    tag: "HEALTH",
  },
  {
    title: "키빼몸",
    description: "키빼몸을 알아보자",
    href: "/life/kbm",
    tag: "HIT",
  },
];

export default function LifePage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      {/* --- 상단 헤더 --- */}
      <section className="space-y-2">
        <Link href="/" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-500 transition-colors">← Home</Link>
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">라이프 계산기</h1>
          <span className="bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-full font-black uppercase">New</span>
        </div>
        <p className="text-sm text-gray-400 font-medium italic">더 나은 일상을 위한 생활 지표들</p>
      </section>

      {/* --- 리스트 섹션 (학점 계산기 레이아웃 통일) --- */}
      <div className="space-y-4">
        {LIFE_TOOLS.map((tool, index) => (
          <Link
            key={index}
            href={tool.href}
            className="group block bg-white border border-gray-100 p-8 rounded-[32px] hover:border-blue-500 transition-all duration-300 shadow-sm shadow-blue-500/5"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-xl text-gray-900">{tool.title}</h3>
                  <span className="text-[9px] font-black text-blue-500 border border-blue-100 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                    {tool.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-medium leading-tight">
                  {tool.description}
                </p>
              </div>
              <span className="text-2xl text-gray-100 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 푸터 */}
      <footer className="pt-10 border-t border-gray-50 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}