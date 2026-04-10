"use client";

import Link from "next/link";

export default function LifePage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-12">
      <section>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-black text-gray-900">라이프 계산기</h1>
          <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm">NEW</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">더 나은 일상을 위한 생활 지표들</p>
      </section>

      <div className="grid gap-4">
        {/* 학점 계산기 (6월 타겟!) */}
        <Link href="/life/grade" className="block p-6 bg-white border rounded-2xl shadow-sm hover:border-blue-500 transition-all group">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-900">학점 계산기</h3>
              <p className="text-sm text-gray-400 mt-1">기말고사 대비 목표 학점 시뮬레이션</p>
            </div>
            <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>
        </Link>

        {/* 2단 구성: BMI & 키빼몸 */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/life/bmi" className="group bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm hover:border-green-500 transition-all">
            <h3 className="font-bold text-gray-900 mb-1">BMI 지수</h3>
            <p className="text-[10px] text-gray-400 leading-tight">체질량 지수 기반<br />비만도 체크</p>
          </Link>

          <Link href="/life/kbm" className="group bg-gray-900 p-6 rounded-[32px] shadow-lg hover:scale-[1.03] transition-all">
            <h3 className="font-bold text-white mb-1">키빼몸 <span className="text-[10px] text-blue-400">HIT</span></h3>
            <p className="text-[10px] text-white/40 leading-tight">미용 체중과<br />옷핏 스펙 확인</p>
          </Link>
        </div>
      </div>
    </main>
  );
}