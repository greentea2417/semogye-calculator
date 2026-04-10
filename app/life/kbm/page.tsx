"use client";

import Link from "next/link";

const LIFE_TOOLS = [
  { title: "학점 계산기", description: "기말고사 대비 목표 학점 시뮬레이션", href: "/life/grade", tag: "TARGET" },
  { title: "BMI 지수", description: "체질량 지수 기반 비만도 체크", href: "/life/bmi", tag: "HEALTH" },
  { title: "키빼몸", description: "미용 체중과 옷핏 스펙 확인", href: "/life/kbm", tag: "HIT" },
];

export default function LifePage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      <section className="space-y-2">
        {/* 중복된 홈 링크 제거 후 타이틀 섹션만 유지 */}
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">라이프 계산기</h1>
          <span className="bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-full font-black uppercase">New</span>
        </div>
        <p className="text-sm text-gray-400 font-medium">더 나은 일상을 위한 생활 지표들</p>
      </section>

      <div className="space-y-4">
        {LIFE_TOOLS.map((tool, index) => (
          <Link key={index} href={tool.href} className="group block bg-white border border-gray-100 p-8 rounded-[32px] hover:border-blue-500 transition-all duration-300 shadow-sm shadow-blue-500/5">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg text-gray-900">{tool.title}</h3>
                  <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">{tool.tag}</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{tool.description}</p>
              </div>
              <span className="text-xl text-gray-200 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1 duration-300">→</span>
            </div>
          </Link>
        ))}
      </div>

      <footer className="pt-20 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}