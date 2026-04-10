"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      {/* --- 헤더 세션 --- */}
      <section className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">세모계</h1>
        <p className="text-sm text-gray-400 font-medium italic">세상의 모든 계산기, 정갈하게 담다</p>
      </section>

      <div className="space-y-12">
        {/* 1. 비즈니스 & 금융 섹션 */}
        <section className="space-y-5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Business</span>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>
          <Link href="/business" className="group block bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:border-blue-500 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">금융·정산 계산기</h3>
                <p className="text-sm text-gray-400">월급, 실수령액, 시급부터 사업 정산까지</p>
              </div>
              <span className="text-2xl text-gray-200 group-hover:text-blue-500 transition-colors">→</span>
            </div>
          </Link>
        </section>

        {/* 2. 라이프 섹션 (NEW!) */}
        <section className="space-y-5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Life</span>
            <div className="h-[1px] flex-1 bg-blue-50"></div>
          </div>
          <Link href="/life" className="group block bg-gray-900 p-8 rounded-[40px] shadow-xl hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-xl text-white">라이프 계산기</h3>
                  <span className="bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-full font-black animate-pulse">UPDATE</span>
                </div>
                <p className="text-sm text-white/40">학점 시뮬레이터, 키빼몸, BMI 등 일상 지표</p>
              </div>
              <span className="text-2xl text-white/20 group-hover:text-white transition-colors">→</span>
            </div>
          </Link>
        </section>
      </div>

      {/* 푸터 느낌의 태그라인 */}
      <footer className="pt-10 border-t border-gray-50 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}