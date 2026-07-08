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

const WEEKS_PER_MONTH = 4.345; // 월 평균 주 수
const EMPLOYER_BURDEN_RATE = 0.11; // 4대보험 사업주 부담분 단순 추정치 (약 11%)

function OwnerCostContent() {
  const [wageRaw, setWageRaw] = useState(""); // 시급
  const [weeklyHoursRaw, setWeeklyHoursRaw] = useState(""); // 주 근무시간

  const result = useMemo(() => {
    const wage = parseNumber(wageRaw);
    const weeklyHours = parseNumber(weeklyHoursRaw);

    // 주휴수당: 주 15시간 이상 근무 시 발생, 주 40시간 한도로 비례 계산
    const eligibleForHolidayPay = weeklyHours >= 15;
    const cappedHours = Math.min(weeklyHours, 40);
    const weeklyHolidayPay = eligibleForHolidayPay ? Math.round((cappedHours / 40) * 8 * wage) : 0;

    const monthlyWorkHours = weeklyHours * WEEKS_PER_MONTH;
    const monthlyHolidayPay = weeklyHolidayPay * WEEKS_PER_MONTH;

    const baseMonthlyPay = Math.round(wage * monthlyWorkHours);
    const monthlySalary = Math.round(baseMonthlyPay + monthlyHolidayPay);

    const estimatedLaborCost = Math.round(monthlySalary * (1 + EMPLOYER_BURDEN_RATE));

    return {
      eligibleForHolidayPay,
      weeklyHolidayPay,
      monthlyHolidayPay: Math.round(monthlyHolidayPay),
      monthlySalary,
      estimatedLaborCost,
    };
  }, [wageRaw, weeklyHoursRaw]);

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          MVP
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900">사장님 계산기</h1>
        <p className="text-gray-500 text-sm mt-1">
          직원 한 명, 이번 달 인건비가 얼마나 나갈까요?
        </p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock
          label="시급"
          type="text"
          value={wageRaw}
          onChange={(e: any) => setWageRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 10,030"
        />
        <InputBlock
          label="주 근무시간"
          type="text"
          value={weeklyHoursRaw}
          onChange={(e: any) => setWeeklyHoursRaw(formatComma(parseNumber(e.target.value)))}
          placeholder="예: 30"
        />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">인건비 리포트</h2>

        <ResultRow label="주휴수당 (주당)" value={result.weeklyHolidayPay} />
        <ResultRow label="주휴수당 (월 환산)" value={result.monthlyHolidayPay} />

        <hr className="my-4" />

        <div className="flex justify-between items-center font-extrabold text-2xl text-blue-600">
          <span>월급 (주휴수당 포함)</span>
          <span>{result.monthlySalary.toLocaleString()}원</span>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-700">예상 인건비 (4대보험 사업주부담 포함)</span>
          <span className="text-lg font-extrabold text-orange-500">
            {result.estimatedLaborCost.toLocaleString()}원
          </span>
        </div>

        {!result.eligibleForHolidayPay && (
          <p className="mt-4 text-[11px] text-amber-600 bg-amber-50 p-2 rounded text-center">
            주 15시간 미만 근무는 주휴수당 발생 대상이 아니에요.
          </p>
        )}

        <p className="mt-4 text-[11px] text-gray-400 leading-relaxed text-center bg-gray-50 p-2 rounded">
          * 4대보험 사업주부담분은 약 11%로 단순 추정한 값이며, 실제 요율은 사업장·직원 조건에 따라 달라질 수 있습니다.
        </p>
      </section>
    </main>
  );
}

export default function OwnerCostMvpPage() {
  return <OwnerCostContent />;
}
