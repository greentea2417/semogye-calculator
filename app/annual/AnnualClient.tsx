"use client";

import { useMemo, useState } from "react";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function formatComma(n: number) {
  return n !== undefined ? n.toLocaleString("ko-KR") : "";
}

export default function AnnualClient() {
  const [dailyWageRaw, setDailyWageRaw] = useState("");
  const [unusedDaysRaw, setUnusedDaysRaw] = useState("");

  const result = useMemo(() => {
    const dailyWage = parseNumber(dailyWageRaw);
    const unusedDays = parseNumber(unusedDaysRaw);
    const allowance = Math.round(dailyWage * unusedDays);
    return { dailyWage, unusedDays, allowance };
  }, [dailyWageRaw, unusedDaysRaw]);

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          근거: 근로기준법 연차유급휴가
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900">연차수당 계산기</h1>
        <p className="text-sm text-gray-500">
          미사용 연차일수와 1일 임금을 바탕으로 예상 연차수당을 계산합니다.
        </p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="1일 통상임금(또는 평균임금)"
          type="text"
          value={dailyWageRaw}
          onChange={(e: any) => setDailyWageRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 100,000"
        />
        <InputBlock
          label="미사용 연차일수"
          type="text"
          value={unusedDaysRaw}
          onChange={(e: any) => setUnusedDaysRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 8"
        />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">계산 결과</h2>
        <ResultRow label="1일 임금" value={result.dailyWage} />
        <ResultRow label="미사용 연차일수" value={result.unusedDays} />
        <ResultRow label="예상 연차수당" value={result.allowance} />

        <div className="mt-6 space-y-4 text-sm text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">계산식</h3>
            <p>연차수당 = 1일 임금 × 미사용 연차일수</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">주의</h3>
            <p>
              실제 연차수당은 회사의 임금 규정, 통상임금 산정 방식, 연차 발생 기준 및 취업규칙에 따라 달라질 수 있습니다.
              지급 전에는 급여명세서와 회사 규정을 꼭 확인하세요.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <h2 className="font-bold text-xl text-gray-900">자주 묻는 질문</h2>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">통상임금과 평균임금 중 무엇을 쓰나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            연차수당은 통상임금을 기준으로 보는 경우가 많지만, 실제 적용은 회사 규정과 근로조건에 따라 달라질 수 있습니다.
          </p>
        </details>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">미사용 연차는 어떻게 계산하나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            발생한 연차에서 사용한 연차를 뺀 나머지 일수입니다.
          </p>
        </details>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">왜 실제 지급액과 차이가 날 수 있나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            수당 산정 기준, 근로시간, 회사 내부 규정, 연차 소멸/이월 기준 등에 따라 차이가 날 수 있습니다.
          </p>
        </details>
      </section>
    </main>
  );
}
