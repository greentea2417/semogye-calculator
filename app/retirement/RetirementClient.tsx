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

export default function RetirementClient() {
  const [wage3mRaw, setWage3mRaw] = useState("");
  const [days3mRaw, setDays3mRaw] = useState("92");
  const [serviceDaysRaw, setServiceDaysRaw] = useState("");

  const result = useMemo(() => {
    const wage3m = parseNumber(wage3mRaw);
    const days3m = parseNumber(days3mRaw);
    const serviceDays = parseNumber(serviceDaysRaw);

    const eligible = serviceDays >= 365;
    const avgDailyWage = days3m > 0 ? wage3m / days3m : 0;
    const retirementPay = eligible ? Math.round(avgDailyWage * 30 * (serviceDays / 365)) : 0;

    return {
      eligible,
      avgDailyWage: Math.round(avgDailyWage),
      retirementPay,
    };
  }, [wage3mRaw, days3mRaw, serviceDaysRaw]);

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          근거: 근로자퇴직급여보장법
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900">퇴직금 계산기</h1>
        <p className="text-sm text-gray-500">
          최근 3개월 평균임금과 재직일수를 바탕으로 예상 퇴직금을 계산합니다.
        </p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="최근 3개월 총임금"
          type="text"
          value={wage3mRaw}
          onChange={(e: any) => setWage3mRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 9,000,000"
        />
        <InputBlock
          label="최근 3개월 총일수"
          type="text"
          value={days3mRaw}
          onChange={(e: any) => setDays3mRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 92"
        />
        <InputBlock
          label="총 재직일수"
          type="text"
          value={serviceDaysRaw}
          onChange={(e: any) => setServiceDaysRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 1095"
        />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">계산 결과</h2>
        <ResultRow label="평균 1일 임금" value={result.avgDailyWage} />
        <ResultRow label="예상 퇴직금" value={result.retirementPay} />

        {!result.eligible && (
          <p className="mt-4 text-[11px] text-amber-600 bg-amber-50 p-2 rounded text-center">
            총 재직일수가 1년 미만이면 원칙적으로 퇴직금 지급 대상이 아닙니다.
          </p>
        )}

        <div className="mt-6 space-y-4 text-sm text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">계산식</h3>
            <p>
              평균임금 = 최근 3개월 총임금 ÷ 최근 3개월 총일수
              <br />
              퇴직금 = 평균임금 × 30일 × (총 재직일수 ÷ 365)
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">주의</h3>
            <p>
              실제 퇴직금은 법정 평균임금, 통상임금 비교, 수당 포함 여부, 재직기간 산정 방식에 따라 달라질 수 있습니다.
              중요한 지급/정산 전에는 공식 자료와 실제 급여명세를 반드시 확인하세요.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <h2 className="font-bold text-xl text-gray-900">자주 묻는 질문</h2>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">퇴직금은 언제 받을 수 있나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            일반적으로 1년 이상 계속 근로한 근로자가 퇴직할 때 지급 대상이 됩니다.
          </p>
        </details>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">평균임금은 어떻게 구하나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            퇴직일 이전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나누어 구합니다.
          </p>
        </details>
        <details className="rounded-lg border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900">왜 실제 금액과 다를 수 있나요?</summary>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            수당 포함 여부, 평균임금 산정 기간, 휴업/무급 기간, 퇴직 직전 임금 변동 등에 따라 결과가 달라질 수 있습니다.
          </p>
        </details>
      </section>
    </main>
  );
}
