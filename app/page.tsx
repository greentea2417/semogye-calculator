"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-16">
      {/* --- 상단 헤더 --- */}
      <section className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">세모계</h1>
        {/* 수정된 슬로건 */}
        <p className="text-sm text-gray-400 font-medium italic">계산하고 싶은 모든 것</p>
      </section>

      <div className="space-y-10">
        {/* 1. 비즈니스 & 금융 섹션 */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</span>
            <div className="h-[1px] flex-1 bg-gray-50"></div>
          </div>
          <Link href="/business" className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-gray-900 transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-0.5">금융·정산</h3>
                <p className="text-xs text-gray-400">월급, 시급부터 사업 정산까지</p>
              </div>
              <span className="text-xl text-gray-200 group-hover:text-gray-900 transition-colors">→</span>
            </div>
          </Link>
        </section>

        {/* 2. 라이프 섹션 */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Life</span>
            <div className="h-[1px] flex-1 bg-blue-50"></div>
          </div>
          <Link href="/life" className="group block bg-white border border-gray-100 p-7 rounded-[32px] hover:border-blue-500 transition-all duration-300 shadow-sm shadow-blue-500/5">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-0.5">
                  <h3 className="font-bold text-lg text-gray-900">라이프</h3>
                  <span className="bg-blue-50 text-[10px] text-blue-500 px-2 py-0.5 rounded-full font-bold">New</span>
                </div>
                <p className="text-xs text-gray-400">학점, 키빼몸 등 일상 지표</p>
              </div>
              <span className="text-xl text-gray-200 group-hover:text-blue-500 transition-colors">→</span>
            </div>
          </Link>
        </section>
      </div>

      {/* 푸터 */}
      <footer className="pt-10 border-t border-gray-50 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}