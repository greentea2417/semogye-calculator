"use client";

import { useMemo, useState } from "react";
import InputBlock from "../components/InputBlock";
import BottomActions from "../components/BottomActions";
import ResultRow from "../components/ResultRow";
import PageTitle from "../components/PageTitle";
import { copyToClipboardSafe } from "../components/lib/shareUtils";

function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
function formatComma(n: number) { return n ? n.toLocaleString("ko-KR") : ""; }

export default function SalaryClient() {
  const [salaryRaw, setSalaryRaw] = useState("");
  const [insured, setInsured] = useState<"yes" | "no">("yes");
  const [dependents, setDependents] = useState("1");
  const [child20, setChild20] = useState("0");
  const [nonTaxRaw, setNonTaxRaw] = useState("");

  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);
    const nonTax = parseNumber(nonTaxRaw);
    const base = Math.max(0, salary - nonTax);
    const pension = insured === "yes" ? Math.round(base * 0.045) : 0;
    const health = insured === "yes" ? Math.round(base * 0.03545) : 0;
    const care = insured === "yes" ? Math.round(health * 0.1295) : 0;
    const employment = insured === "yes" ? Math.round(base * 0.009) : 0;
    const incomeTax = Math.round(base * 0.025);
    const residentTax = Math.round(incomeTax * 0.1);
    const takeHome = Math.max(0, base - pension - health - care - employment - incomeTax - residentTax);
    return { pension, health, care, employment, incomeTax, residentTax, takeHome };
  }, [salaryRaw, insured, nonTaxRaw]);

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <section className="mb-8">
        <PageTitle title="월급 실수령액 계산기" subtitle="세전 월급 기준으로 실제 받는 금액을 계산합니다." />
        <p className="text-sm leading-relaxed text-gray-500 text-center">
          4대보험 가입 여부와 비과세 식대 등을 반영해 월 실수령액을 빠르게 확인해보세요.
        </p>
      </section>

      <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30 space-y-4">
        <InputBlock label="월 급여 (세전)" type="text" value={salaryRaw} onChange={(e: any) => setSalaryRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 3,000,000" />
        <select className="w-full rounded-2xl border border-gray-200 bg-white p-3" value={insured} onChange={(e) => setInsured(e.target.value as any)}>
          <option value="yes">4대보험 가입</option>
          <option value="no">4대보험 미가입</option>
        </select>
        <InputBlock label="부양가족 수 (본인 포함)" type="text" inputMode="numeric" value={dependents} onChange={(e: any) => setDependents(e.target.value)} />
        <InputBlock label="20세 이하 자녀 수" type="text" inputMode="numeric" value={child20} onChange={(e: any) => setChild20(e.target.value)} />
        <InputBlock label="비과세 식대" type="text" value={nonTaxRaw} onChange={(e: any) => setNonTaxRaw(formatComma(parseNumber(e.target.value)))} placeholder="0" />
      </section>

      <section className="mt-6 rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/30">
        <h2 className="mb-4 text-lg font-bold text-gray-900">계산 결과</h2>
        <ResultRow label="국민연금" value={result.pension} />
        <ResultRow label="건강보험" value={result.health} />
        <ResultRow label="장기요양보험" value={result.care} />
        <ResultRow label="고용보험" value={result.employment} />
        <ResultRow label="소득세" value={result.incomeTax} />
        <ResultRow label="지방소득세" value={result.residentTax} />
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-center">
          <p className="text-xs font-semibold text-blue-700">실수령액</p>
          <p className="mt-1 text-3xl font-extrabold text-blue-700 tabular-nums">{result.takeHome.toLocaleString()}원</p>
        </div>
        <BottomActions onShare={async () => { await copyToClipboardSafe(shareUrl); }} />
      </section>
    </main>
  );
}
