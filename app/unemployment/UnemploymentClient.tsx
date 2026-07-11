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

export default function UnemploymentClient() {
  const [avgWageRaw, setAvgWageRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("");
  const [daysRaw, setDaysRaw] = useState("120");
  const [ageRaw, setAgeRaw] = useState("");

  const result = useMemo(() => {
    const avgWage = parseNumber(avgWageRaw);
    const months = parseNumber(monthsRaw);
    const days = parseNumber(daysRaw);
    const age = parseNumber(ageRaw);

    const eligible = months >= 6;
    const rate = 0.6;
    const dailyBenefit = eligible ? Math.min(Math.max(Math.round(avgWage * rate), 0), 66666) : 0;
    const totalBenefit = eligible ? dailyBenefit * days : 0;

    return { eligible, rate, dailyBenefit, totalBenefit, months, age, days };
  }, [avgWageRaw, monthsRaw, daysRaw, ageRaw]);

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          근거: 고용보험 실업급여 제도
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900">실업급여 계산기</h1>
        <p className="text-sm text-gray-500">
          평균임금과 수급 가능 일수를 바탕으로 예상 실업급여를 계산합니다.
        </p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="평균 1일 임금"
          type="text"
          value={avgWageRaw}
          onChange={(e: any) => setAvgWageRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 100,000"
        />
        <InputBlock
          label="고용보험 가입 개월 수"
          type="text"
          value={monthsRaw}
          onChange={(e: any) => setMonthsRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 18"
        />
        <InputBlock
          label="예상 수급일수"
          type="text"
          value={daysRaw}
          onChange={(e: any) => setDaysRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 150"
        />
        <InputBlock
          label="나이"
          type="text"
          value={ageRaw}
          onChange={(e: any) => setAgeRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 35"
        />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">계산 결과</h2>
        <ResultRow label="수급 가능 여부" value={result.eligible ? 1 : 0} />
        <ResultRow label="1일 예상 실업급여" value={result.dailyBenefit} />
        <ResultRow label="총 예상 수급액" value={result.totalBenefit} />

        {!result.eligible && (
          <p className="mt-4 text-[11px] text-amber-600 bg-amber-50 p-2 rounded text-center">
            보통 고용보험 가입기간 6개월 이상이어야 수급 자격 검토가 가능합니다.
          </p>
        )}

        <div className="mt-6 space-y-4 text-sm text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">계산식</h3>
            <p>
              1일 예상 실업급여 = 평균 1일 임금 × 60% (상한 적용)
              <br />
              총 예상 수급액 = 1일 예상 실업급여 × 예상 수급일수
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">주의</h3>
            <p>
              실제 실업급여는 나이, 가입기간, 이직 사유, 재취업활동 요건, 상·하한액, 수급일수 구간에 따라 달라질 수 있습니다.
              중요한 신청 전에는 고용보험 공식 안내를 꼭 확인하세요.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <h2 className="font-bold text-xl text-gray-900">자주 묻는 질문</h2>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">실업급여는 누구나 받을 수 있나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            고용보험 가입 이력, 이직 사유, 근로기간 등 여러 조건을 충족해야 합니다.
          </p>
        </details>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">왜 실제 금액과 다를 수 있나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            실업급여는 상·하한액과 수급일수, 퇴사 사유, 연령에 따라 달라질 수 있습니다.
          </p>
        </details>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">가입기간이 짧으면 무조건 못 받나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            일반적으로 일정 가입기간이 필요하며, 세부 요건은 개인 상황에 따라 달라집니다.
          </p>
        </details>
      </section>
    </main>
  );
}
