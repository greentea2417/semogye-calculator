"use client";

import { useMemo, useState } from "react";

export default function BusinessFreelancePage() {
  const [amount, setAmount] = useState("");
  const value = Number(amount);
  const valid = Number.isFinite(value) && value > 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const tax = Math.round(value * 0.033);
    const net = Math.round(value - tax);
    return { tax, net };
  }, [value, valid]);

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <section className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          비즈니스 계산기
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-['Pretendard_Variable',sans-serif]">
          프리랜서 실수령액 계산기
        </h1>
        <div className="mt-4 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-sky-300" />
        <p className="mt-3 text-gray-500">3.3% 원천징수 기준으로 간단히 예상해보세요.</p>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          프리랜서 정산은 세전 금액에서 사업소득 원천징수 3.3%를 먼저 반영해 예상 실수령액을 보는 방식이에요.
          실제 신고 시에는 필요경비, 공제 항목, 신고 방식에 따라 결과가 달라질 수 있으니 참고용으로 확인해 주세요.
        </p>
      </section>

      <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 sm:p-8">
        <label className="space-y-2 block">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
            세전 금액 (원)
          </span>
          <input
            type="number"
            placeholder="1000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-2xl border-none bg-gray-50 p-4 text-center text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        {result && (
          <div className="mt-8 border-t border-gray-100 pt-8 text-center space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-700">예상 세금</p>
                <p className="mt-1 text-2xl font-extrabold text-blue-700">{result.tax.toLocaleString()}원</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-xs font-semibold text-sky-700">예상 실수령액</p>
                <p className="mt-1 text-2xl font-extrabold text-sky-700">{result.net.toLocaleString()}원</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">간이 계산이며 실제 신고/공제 조건에 따라 달라질 수 있어요.</p>
          </div>
        )}
      </section>
    </main>
  );
}
