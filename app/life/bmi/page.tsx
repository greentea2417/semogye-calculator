"use client";

import { useState } from "react";
import Link from "next/link";

export default function BmiPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const bmi = weightNum && heightNum ? (weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1) : null;

  return (
    <main className="max-w-xl mx-auto px-5 py-16 space-y-12">
      <section className="space-y-2">
        <Link href="/life" className="text-xs font-bold text-blue-500 uppercase tracking-widest hover:underline">← Life</Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">BMI 지수</h1>
        <p className="text-sm text-gray-400 font-medium">나의 체질량 지수를 확인해보세요</p>
      </section>

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm shadow-gray-200/20">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Height (cm)</label>
            <input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Weight (kg)</label>
            {/* 🔥 오류 수정: onChange를 setWeight로 변경 */}
            <input type="number" placeholder="65" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
        </div>

        {bmi && (
          <div className="mt-10 pt-10 border-t border-gray-50 text-center animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Your BMI</span>
            <div className="text-6xl font-black text-gray-900 tracking-tighter my-2">{bmi}</div>
          </div>
        )}
      </div>
    </main>
  );
}