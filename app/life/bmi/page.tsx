"use client";

import { useState } from "react";
import Link from "next/link";

export default function BmiPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  
  // BMI 계산 로직
  const bmiValue = weightNum && heightNum 
    ? parseFloat((weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1)) 
    : null;

  // BMI 상태 및 컬러 판정 함수
  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "저체중", desc: "조금 더 든든하게 드셔도 좋겠어요.", color: "text-amber-500" };
    if (bmi < 23) return { label: "정상", desc: "아주 건강하고 이상적인 상태입니다!", color: "text-blue-500" };
    if (bmi < 25) return { label: "과체중", desc: "관리가 필요한 시점이에요. 가벼운 운동 어때요?", color: "text-orange-500" };
    return { label: "비만", desc: "건강을 위해 식단 조절과 운동을 권장합니다.", color: "text-red-500" };
  };

  const status = bmiValue ? getBmiStatus(bmiValue) : null;

  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-12">
      <section className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">BMI 지수</h1>
        <p className="text-sm text-gray-400 font-medium">나의 체질량 지수를 확인해보세요</p>
      </section>

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm shadow-gray-200/20">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Height (cm)</label>
            <input type="number" placeholder="160" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500/20 transition-all text-center" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Weight (kg)</label>
            <input type="number" placeholder="50" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500/20 transition-all text-center" />
          </div>
        </div>

        {bmiValue && status && (
          <div className="mt-10 pt-10 border-t border-gray-50 text-center animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your BMI</span>
            <div className="text-6xl font-black text-gray-900 tracking-tighter my-2">{bmiValue}</div>
            
            {/* 결과 설명 섹션 */}
            <div className="mt-4 space-y-1">
              <p className={`text-xl font-black ${status.color}`}>{status.label}</p>
              <p className="text-sm text-gray-400 font-medium">{status.desc}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}