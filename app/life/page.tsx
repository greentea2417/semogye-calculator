"use client";

import Link from "next/link";

const LIFE_TOOLS = [
  { title: "학점 계산기", description: "중간, 기말 대비 학점 시뮬레이션", href: "/life/grade", tag: "TARGET" },
  { title: "BMI 지수", description: "체질량 지수 기반 비만도 체크", href: "/life/bmi", tag: "HEALTH" },
  { title: "키빼몸", description: "키빼몸을 알아보자", href: "/life/kbm", tag: "HIT" },
];

export default function LifePage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-12 space-y-12">
      {/* --- 상단 헤더 --- */}
      <section className="space-y-4">
        <Link href="/" className="group inline-flex items-center text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] hover:text-blue-500 transition-colors">
          <span className="mr-1 transform group-hover:-translate-x-1 transition-transform">←</span> Home
        </Link>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">라이프 계산기</h1>
            <span className="bg-blue-500 text-[9px] text-white px-1.5 py-0.5 rounded-md font-black tracking-tighter">NEW</span>
          </div>
          <p className="text-[13px] text-gray-400 font-medium tracking-tight">더 나은 일상을 위한 생활 지표들</p>
        </div>
      </section>

      {/* --- 리스트 섹션 --- */}
      <div className="space-y-3">
        {LIFE_TOOLS.map((tool, index) => (
          <Link key={index} href={tool.href} className="group block bg-white border border-gray-50 p-7 rounded-[28px] hover:border-blue-500/30 transition-all duration-400 shadow-sm shadow-gray-200/20">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-[17px] text-gray-900">{tool.title}</h3>
                  <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">{tool.tag}</span>
                </div>
                <p className="text-[13px] text-gray-400 font-medium tracking-tight">{tool.description}</p>
              </div>
              <span className="text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">→</span>
            </div>
          </Link>
        ))}
      </div>
      <footer className="pt-20 text-center">
        <p className="text-[9px] font-bold text-gray-200 uppercase tracking-[0.3em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}