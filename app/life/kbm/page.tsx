"use client";

import { useState } from "react";

export default function StandardWeightCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const diff = height && weight ? Number(height) - Number(weight) : null;
  
  // 미용 체중 계산 (보통 키(m) * 키(m) * 18.5)
  const beautyWeight = height ? (Math.pow(Number(height) / 100, 2) * 18.5).toFixed(1) : null;

  const getStatus = (val: number) => {
    if (val >= 115) return { label: "모델 권역", color: "text-purple-500" };
    if (val >= 110) return { label: "슬림 탄탄", color: "text-blue-500" };
    if (val >= 105) return { label: "보기 좋은 표준", color: "text-green-500" };
    return { label: "건강한 표준", color: "text-gray-400" };
  };

  return (
    <main className="max-w-md mx-auto px-6 py-12 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900 italic">KIBBEMOM</h1>
        <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">Standard Weight Check</p>
      </section>

      {/* 키빼몸 결과 카드 */}
      <div className="bg-white border-2 border-gray-900 rounded-[40px] p-10 text-center relative overflow-hidden">
        <p className="text-gray-400 text-xs font-bold mb-1 uppercase">나의 키빼몸 수치</p>
        <div className="text-7xl font-black text-gray-900 tracking-tighter mb-2">
          {diff || "000"}
        </div>
        {diff && (
          <p className={`text-sm font-black ${getStatus(diff).color}`}>
            {getStatus(diff).label}
          </p>
        )}
      </div>

      {/* 미용 체중 정보 (디자이너의 팁 느낌) */}
      {beautyWeight && (
        <div className="bg-blue-50 rounded-3xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-blue-400 uppercase">Beauty Target</p>
            <p className="text-sm font-bold text-blue-900">당신의 미용 체중은?</p>
          </div>
          <div className="text-2xl font-black text-blue-600">{beautyWeight}kg</div>
        </div>
      )}

      {/* 입력 섹션 */}
      <div className="space-y-3">
        <div className="flex bg-gray-50 p-2 rounded-[30px] items-center px-6 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <span className="text-xs font-black text-gray-400 w-12">키</span>
          <input
            type="number"
            className="flex-1 bg-transparent py-4 text-right font-black outline-none"
            placeholder="000"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <span className="ml-2 font-bold text-gray-900">cm</span>
        </div>
        <div className="flex bg-gray-50 p-2 rounded-[30px] items-center px-6 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <span className="text-xs font-black text-gray-400 w-12">몸무게</span>
          <input
            type="number"
            className="flex-1 bg-transparent py-4 text-right font-black outline-none"
            placeholder="00"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <span className="ml-2 font-bold text-gray-900">kg</span>
        </div>
      </div>

      <p className="text-[10px] text-gray-300 text-center leading-relaxed">
        키빼몸은 의학적 지표는 아니지만, 흔히 통용되는 미용 지표입니다.<br />
        가장 중요한 것은 숫자보다 당신의 건강한 컨디션입니다! ✨
      </p>
    </main>
  );
}