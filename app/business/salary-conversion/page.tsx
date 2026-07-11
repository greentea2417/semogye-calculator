"use client";

import { useMemo, useState } from "react";

export default function SalaryConversionPage() {
  const [annual, setAnnual] = useState("");
  const value = Number(annual);
  const valid = Number.isFinite(value) && value > 0;

  const monthly = useMemo(() => (valid ? Math.round(value / 12) : null), [value, valid]);

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <section className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          비즈니스 계산기
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-['Pretendard_Variable',sans-serif]">
          연봉 → 월급 계산기
        </h1>
        <div className="mt-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-sky-300" />
        <p className="mt-3 text-gray-500">연봉을 12개월 기준으로 간단히 월급으로 바꿔보세요.</p>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          연봉 계산기는 채용 공고나 계약서에서 본 연봉을 월급 단위로 빠르게 환산할 때 유용해요.
          상여금, 성과급, 세전/세후 여부에 따라 체감 월급이 달라질 수 있으니 기본 환산용으로 활용해 주세요.
        </p>
      </section>

      <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 sm:p-8">
        <label className="space-y-2 block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
            연봉 (원)
          </span>
          <input
            type="number"
            placeholder="36000000"
            value={annual}
            onChange={(e) => setAnnual(e.target.value)}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 text-center text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        {monthly && (
          <div className="mt-8 border-t border-gray-100 pt-8 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">예상 월급</p>
            <p className="mt-2 text-4xl font-black tracking-tight text-blue-700">{monthly.toLocaleString()}원</p>
            <p className="mt-2 text-xs text-gray-400">세전 기준 단순 환산 값입니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
