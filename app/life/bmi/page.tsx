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

<div className="mt-12 w-full border-t border-gray-100 pt-8 mb-20 px-4">
  <details className="group">
    <summary className="list-none cursor-pointer flex justify-between items-center text-gray-600 font-bold text-lg">
      <span className="tracking-tight">💡 BMI 지수와 건강 체중 알고 가기</span>
      <span className="text-gray-300 group-open:rotate-180 transition-transform duration-300 text-xs">▼</span>
    </summary>
    <div className="mt-6 text-sm text-gray-500 leading-relaxed space-y-6 pb-10">
      
      {/* 건강 요약 박스 */}
      <div className="bg-green-50 p-5 rounded-2xl space-y-3 border border-green-100">
        <p className="font-bold text-green-900 text-xs uppercase tracking-wider">Health Status Guide</p>
        <div className="space-y-2 text-xs text-green-800">
          <p>• <strong>정상 범위:</strong> BMI 18.5 ~ 22.9 (한국인 기준)</p>
          <p>• <strong>관리 포인트:</strong> 수치보다 중요한 것은 근육량과 체지방의 균형입니다.</p>
        </div>
      </div>

      <section className="space-y-4 px-1">
        <div>
          <h4 className="font-bold text-gray-800 mb-1">BMI, 왜 확인해야 할까요?</h4>
          <p>체질량지수는 성인병 예방을 위한 기초 지표입니다. 세모계는 2026년 최신 건강 가이드를 반영하여, 단순 수치 계산을 넘어 당신의 건강 상태를 한눈에 파악할 수 있도록 돕습니다.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-1">정갈한 디자인으로 만나는 건강 기록</h4>
          <p>8년 차 광고 디자이너의 감각으로 설계된 인터페이스는 자칫 딱딱하게 느껴질 수 있는 건강 수치를 부드럽고 명확하게 전달합니다. 세모계와 함께 즐거운 건강 관리를 시작하세요.</p>
        </div>
      </section>

      <p className="text-[11px] text-gray-400 italic border-l-2 border-gray-200 pl-3">
        ※ 본 계산 결과는 일반적인 지침일 뿐이며, 임신 중이거나 근육량이 매우 많은 경우 정확하지 않을 수 있습니다. 자세한 상담은 전문가와 상의하세요.
      </p>
    </div>
  </details>
</div>