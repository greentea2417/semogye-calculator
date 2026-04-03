"use client";

import { Suspense } from "react"; // 추가
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputBlock from "@/components/InputBlock";
import ResultRow from "@/components/ResultRow";
import BottomActions from "@/components/BottomActions";
import { calculateSalary } from "@/utils/salaryCalculators";
import { decodeShareState, encodeShareState } from "../components/lib/shareState";

/* ... (기본 함수들: parseNumber, formatComma 등은 동일하므로 생략하거나 기존 것 유지) ... */
function parseNumber(raw: string | number) {
  const cleaned = String(raw ?? "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return Number(cleaned) || 0;
}
function formatComma(n: number) {
  return n !== undefined ? n.toLocaleString("ko-KR") : "";
}
function toDigitsOrEmpty(v: unknown) {
  return String(v ?? "").replace(/[^\d]/g, "");
}
function restoreNumericString(value: unknown, fallback: string) {
  if (typeof value === "string") {
    const d = toDigitsOrEmpty(value);
    return d === "" ? "" : String(Number(d));
  }
  return fallback;
}
async function copyToClipboardSafe(text: string) {
  try { await navigator.clipboard.writeText(text); } catch { /* 생략 */ }
}

/* ================= 메인 로직 분리 ================= */
function BonusContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const [salaryRaw, setSalaryRaw] = useState("");
  const [bonusRaw, setBonusRaw] = useState("");
  const [insured, setInsured] = useState<"yes" | "no">("yes");
  const [dependents, setDependents] = useState("1");
  const [child20, setChild20] = useState("0");
  const [nonTaxRaw, setNonTaxRaw] = useState("200,000");

  const result = useMemo(() => {
    const salary = parseNumber(salaryRaw);
    const bonus = parseNumber(bonusRaw);
    return calculateSalary({
      salary: salary + bonus,
      insured,
      dependents: Number(dependents || 0),
      child20: Number(child20 || 0),
      nonTax: parseNumber(nonTaxRaw),
    }) || { pension: 0, health: 0, care: 0, employment: 0, incomeTax: 0, residentTax: 0, takeHome: 0 };
  }, [salaryRaw, bonusRaw, insured, dependents, child20, nonTaxRaw]);

  // 공유 데이터 복구 로직 (기존과 동일)
  useEffect(() => {
    const data = sp.get("data");
    if (!data) return;
    const decoded = decodeShareState<any>(data);
    if (decoded?.inputs) {
      const i = decoded.inputs;
      setSalaryRaw(i.salaryRaw ?? "");
      setBonusRaw(i.bonusRaw ?? "");
      setInsured(i.insured === "no" ? "no" : "yes");
      setDependents(restoreNumericString(i.dependents, "1"));
      setChild20(restoreNumericString(i.child20, "0"));
      setNonTaxRaw(typeof i.nonTaxRaw === "number" ? formatComma(i.nonTaxRaw) : (i.nonTaxRaw ?? "200,000"));
      router.replace("/bonus");
    }
  }, [sp, router]);

  return (
    <main className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">상여금/성과급 계산기</h1>
        <p className="text-gray-500 text-sm">기본급과 합산하여 세금 폭탄 피하는 실수령액 확인</p>
      </section>

      <section className="bg-white p-6 rounded-xl border space-y-4">
        <InputBlock label="기본 월 급여 (세전)" type="text" value={salaryRaw} onChange={(e: any) => setSalaryRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 3,000,000" />
        <InputBlock label="상여금/성과급 (세전)" type="text" value={bonusRaw} onChange={(e: any) => setBonusRaw(formatComma(parseNumber(e.target.value)))} placeholder="예: 5,000,000" />
        {/* ... 나머지 입력창 UI는 기존과 동일 ... */}
        <select className="w-full border p-3 rounded-lg" value={insured} onChange={(e) => setInsured(e.target.value as any)}>
          <option value="yes">4대보험 가입</option>
          <option value="no">4대보험 미가입</option>
        </select>
        <InputBlock label="부양가족 수" type="text" inputMode="numeric" value={dependents} onChange={(e: any) => setDependents(toDigitsOrEmpty(e.target.value))} />
        <InputBlock label="20세 이하 자녀 수" type="text" inputMode="numeric" value={child20} onChange={(e: any) => setChild20(toDigitsOrEmpty(e.target.value))} />
        <InputBlock label="비과세 식대" type="text" value={nonTaxRaw} onChange={(e: any) => setNonTaxRaw(formatComma(parseNumber(e.target.value)))} />
      </section>

      <section className="bg-white p-6 rounded-xl border">
        <h2 className="font-bold text-xl mb-4 text-gray-900">합산 계산 결과</h2>
        <ResultRow label="국민연금" value={result.pension} />
        <ResultRow label="건강보험" value={result.health} />
        <ResultRow label="장기요양보험" value={result.care} />
        <ResultRow label="고용보험" value={result.employment} />
        <ResultRow label="소득세" value={result.incomeTax} />
        <ResultRow label="지방소득세" value={result.residentTax} />
        <hr className="my-4" />
        <div className="flex justify-between font-bold text-lg text-blue-600">
          <span>최종 실수령액</span>
          <span>{result.takeHome.toLocaleString()}원</span>
        </div>
        <BottomActions onCopyLink={() => {}} onShare={() => {}} />
      </section>
    </main>
  );
}

// 🚀 최종 Export: Suspense로 감싸서 빌드 에러 해결!
export default function BonusPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">계산기 불러오는 중...</div>}>
      <BonusContent />
    </Suspense>
  );
}