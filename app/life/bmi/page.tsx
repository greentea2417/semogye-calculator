"use client";

import { useState } from "react";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const calculateBMI = () => {
    if (!height || !weight) return null;
    const h = Number(height) / 100;
    const w = Number(weight);
    return (w / (h * h)).toFixed(1);
  };

  const bmi = calculateBMI();

  const getStatus = (val: number) => {
    if (val < 18.5) return { label: "저체중", color: "text-blue-500", bg: "bg-blue-50" };
    if (val < 23) return { label: "정상", color: "text-green-500", bg: "bg-green-50" };
    if (val < 25) return { label: "과체중", color: "text-yellow-500", bg: "bg-yellow-50" };
    return { label: "비만", color: "text-red-500", bg: "bg-red-50" };
  };

  const status = bmi ? getStatus(Number(bmi)) : null;

  return (
    <main className="max-w-md mx-auto px-6 py-12 space-y-8">
      {/* 헤더 */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900">BMI 계산기</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Body Mass Index</p>
      </section>

      {/* 결과 디스플레이 (수치에 따라 배경색 반응) */}
      <div className={`rounded-[40px] p-12 text-center transition-all duration-500 ${status ? status.bg : 'bg-gray-900'}`}>
        <p className={`${status ? 'text-gray-600' : 'text-white/50'} text-xs font-bold mb-2 uppercase`}>
          나의 체질량 지수
        </p>
        <div className={`text-7xl font-black italic tracking-tighter ${status ? 'text-gray-900' : 'text-white'}`}>
          {bmi || "00.0"}
        </div>
        {status && (
          <div className={`mt-4 inline-block px-4 py-1 rounded-full font-black text-sm ${status.color} bg-white shadow-sm`}>
            {status.label}
          </div>
        )}
      </div>

      {/* 입력 섹션 */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm flex items-center justify-between">
          <span className="font-bold text-gray-400 text-sm uppercase">Height</span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="000"
              className="w-20 text-right text-2xl font-black outline-none border-none focus:ring-0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <span className="font-bold text-gray-900">cm</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm flex items-center justify-between">
          <span className="font-bold text-gray-400 text-sm uppercase">Weight</span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="00"
              className="w-20 text-right text-2xl font-black outline-none border-none focus:ring-0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <span className="font-bold text-gray-900">kg</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-300 text-center leading-relaxed">
        BMI는 질병관리청의 성인 비만 기준을 따릅니다.<br />
        근육량 등에 따라 실제 체지방 상태와 다를 수 있습니다.
      </p>
    </main>
  );
}