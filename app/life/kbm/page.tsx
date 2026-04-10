"use client";

import { useState } from "react";
import Link from "next/link";

export default function KbmPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  
  // 키빼몸 계산 (키 - 몸무게)
  const kbmValue = heightNum && weightNum ? Math.round(heightNum - weightNum) : null;

  // 키빼몸 상태 판정 함수 (보통 110~115를 미용/모델 스펙으로 봅니다)
  const getKbmStatus = (kbm: number) => {
    if (kbm >= 120) return { label: "매우 마름", desc: "모델급 스펙이에요. 건강을 위해 잘 챙겨 드세요!", color: "text-amber-500" };
    if (kbm >= 110) return { label: "미용 체중", desc: "옷핏이 가장 예쁘게 나오는 이상적인 스펙입니다.", color: "text-blue-500" };
    if (kbm >= 100) return { label: "표준 체중", desc: "가장 건강하고 보기 좋은 표준 상태입니다.", color: "text-emerald-500" };
    return { label: "관리 필요", desc: "건강한 식단과 운동으로 관리를 시작해볼까요?", color: "text-orange-500" };
  };

  const status = kbmValue !== null ? getKbmStatus(kbmValue) : null;

  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-12">
      {/* 상단 헤더 - 홈 링크 제거 및 정갈한 타이틀 */}
      <section className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">키빼몸 계산기</h1>
        <p className="text-sm text-gray-400 font-medium">나의 '키 - 몸무게' 수치를 확인해보세요</p>
      </section>

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm shadow-gray-200/20">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Height (cm)</label>
            <input 
              type="number" 
              placeholder="170" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500/20 transition-all text-center" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Weight (kg)</label>
            <input 
              type="number" 
              placeholder="60" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500/20 transition-all text-center" 
            />
          </div>
        </div>

        {kbmValue !== null && status && (
          <div className="mt-10 pt-10 border-t border-gray-50 text-center animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Score</span>
            <div className="text-6xl font-black text-gray-900 tracking-tighter my-2">{kbmValue}</div>
            
            <div className="mt-4 space-y-1">
              <p className={`text-xl font-black ${status.color}`}>{status.label}</p>
              <p className="text-sm text-gray-400 font-medium">{status.desc}</p>
            </div>
          </div>
        )}
      </div>

      <footer className="pt-20 text-center">
        <p className="text-[10px] font-bold text-gray-200 uppercase tracking-[0.2em]">Designed by greentea • 2026</p>
      </footer>
    </main>
  );
}