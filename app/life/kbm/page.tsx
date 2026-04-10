"use client";

import { useState } from "react";
import Link from "next/link";

export default function KbmPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const kbm = height && weight ? (parseFloat(height) - parseFloat(weight)).toFixed(1) : null;

  return (
    <main className="max-w-xl mx-auto px-6 py-12 space-y-10">
      <Link href="/life" className="group inline-flex items-center text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] hover:text-blue-500 transition-colors">
        <span className="mr-1 transform group-hover:-translate-x-1 transition-transform">←</span> Life
      </Link>

      <section className="space-y-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">키빼몸</h1>
        <p className="text-[13px] text-gray-400 font-medium tracking-tight">나의 미용 체중 스펙 확인</p>
      </section>

      <div className="bg-white border border-gray-50 rounded-[32px] p-8 shadow-sm shadow-gray-200/30 space-y-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Height (cm)</label>
            <input type="number" placeholder="165" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-[20px] p-5 text-xl font-bold focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-200" />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Weight (kg)</label>
            <input type="number" placeholder="52" value={weight} onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-[20px] p-5 text-xl font-bold focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-200" />
          </div>
        </div>

        {kbm && (
          <div className="pt-10 border-t border-gray-50 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 text-center">Your Result</span>
            <div className="text-6xl font-black text-gray-900 tracking-tighter mb-4">{kbm}</div>
            <div className="px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-[12px] font-bold">
              {parseFloat(kbm) >= 110 ? "👗 모델급 실루엣이네요!" : "✨ 건강하고 정갈한 체중이에요!"}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}