"use client";

import { useMemo, useState } from "react";

export default function NetSalaryPage() {
  const [gross, setGross] = useState("");
  const value = Number(gross);
  const valid = Number.isFinite(value) && value > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const insurance = Math.round(value * 0.097);
    const tax = Math.round(value * 0.03);
    const net = Math.round(value - insurance - tax);
    return { insurance, tax, net };
  }, [value, valid]);

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <section className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          비즈니스 계산기
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-['Pretendard_Variable',sans-serif]">
          세후 실수령액 간이 계산기
        </h1>
        <div className="mt-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-sky-300" />
        <p className="mt-3 text-gray-500">월급에서 4대보험·세금을 대략 빼고 실수령액을 확인해보세요.</p>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          세후 실수령액 계산기는 세전 월급에서 국민연금, 건강보험, 고용보험 같은 공제 항목과 세금을 감안한 대략의 수령액을 보여줘요.
          회사마다 공제 구조가 다를 수 있어 정확한 급여명세서와는 차이가 있을 수 있습니다.
        </p>
      </section>

      <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 sm:p-8">
        <label className="space-y-2 block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
            세전 월급 (원)
          </span>
          <input
            type="number"
            placeholder="3000000"
            value={gross}
            onChange={(e) => setGross(e.target.value)}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 text-center text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        {result && (
          <div className="mt-8 border-t border-gray-100 pt-8 text-center space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-700">4대보험 추정</p>
                <p className="mt-1 text-xl font-extrabold text-blue-700">{result.insurance.toLocaleString()}원</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-xs font-semibold text-sky-700">세금 추정</p>
                <p className="mt-1 text-xl font-extrabold text-sky-700">{result.tax.toLocaleString()}원</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">실수령액</p>
                <p className="mt-1 text-xl font-extrabold text-emerald-700">{result.net.toLocaleString()}원</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">간이 추정치이며 회사/공제 조건에 따라 달라질 수 있어요.</p>
          </div>
        )}
      </section>
    </main>
  );
}
